import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from io import BytesIO
import math
import base64

# ---------------------------------------------------------------------------
# Seitenkonfiguration
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="Karton-Kostenrechner | Meypack Engineering Tool",
    page_icon="📦",
    layout="wide",
)

st.title("Karton-Kostenvergleich: RSC vs. Wrap-Around")
st.markdown(
    "Ingenieurstool zur objektiven Bewertung von **RSC (FEFCO 0201)** vs. "
    "**Wrap-Around (FEFCO 0409)** – technisch, wirtschaftlich und nachhaltig."
)

# =========================================================================
# KONSTANTEN & WELLENPROFILE
# =========================================================================
FLUTE_PROFILES = {
    "E-Welle (1.5 mm)": {
        "thickness_mm": 1.5,
        "take_up_factor": 1.25,
        "flute_pitch_mm": 3.5,
        "grammage_add_gsm": 140,   # typische Wellenzulage (g/m²)
        "bct_factor": 0.70,        # relativer BCT-Faktor (E vs C=1.0)
        "score_allowance_mm": 1.0,
    },
    "B-Welle (2.5 mm)": {
        "thickness_mm": 2.5,
        "take_up_factor": 1.32,
        "flute_pitch_mm": 6.5,
        "grammage_add_gsm": 170,
        "bct_factor": 0.85,
        "score_allowance_mm": 1.5,
    },
    "C-Welle (3.5 mm)": {
        "thickness_mm": 3.5,
        "take_up_factor": 1.43,
        "flute_pitch_mm": 8.0,
        "grammage_add_gsm": 200,
        "bct_factor": 1.00,
        "score_allowance_mm": 2.0,
    },
    "BC-Welle (6.0 mm)": {
        "thickness_mm": 6.0,
        "take_up_factor": 1.38,
        "flute_pitch_mm": 7.0,
        "grammage_add_gsm": 370,
        "bct_factor": 1.55,
        "score_allowance_mm": 3.0,
    },
}

# =========================================================================
# BERECHNUNGSMODELLE
# =========================================================================

def calc_rsc_blank(L, B, H, t, mfg_flap_mm=25.0, trim_mm=20.0, score_allow=2.0):
    """RSC FEFCO 0201: Zuschnittberechnung mit ingenieurstechnischen Zugaben.

    Bogenlänge = 2·L + 2·B + 4·t + Klebelasche + Randbeschnitt + 4·score
    Bogenbreite = B + 2·H + 4·t + Randbeschnitt + 2·score
    (Score-Allowance berücksichtigt Rillverzug je Falzlinie)
    """
    blank_length = (2 * L + 2 * B
                    + 4 * t
                    + mfg_flap_mm
                    + trim_mm
                    + 4 * score_allow)
    # RSC hat 4 vertikale Rillen => 4× score horizontal
    # Vertikal: untere Klappe(H/2) + Körper(H) ... nein, Bogenbreite: Klappe + H + B + H + Klappe
    # Klappen = B/2 bzw L/2 (major/minor)
    flap_top = max(L, B) / 2.0
    flap_bottom = max(L, B) / 2.0
    blank_width = (flap_bottom + H + B + H + flap_top  # Netto-Klappenmaße
                   + 4 * t
                   + trim_mm
                   + 2 * score_allow)

    area_mm2 = blank_length * blank_width
    area_m2 = area_mm2 / 1e6
    return {
        "blank_length_mm": blank_length,
        "blank_width_mm": blank_width,
        "area_m2": area_m2,
        "area_mm2": area_mm2,
        "flap_height_mm": flap_top,
        "mfg_flap_mm": mfg_flap_mm,
    }


def calc_wa_blank(L, B, H, t, overlap_mm=35.0, score_allow=2.0):
    """Wrap-Around FEFCO 0409: Zuschnittberechnung.

    Bogenlänge = 2·L + 2·B + overlap + 4·score
    Bogenbreite = B + 2·H (keine separaten Klappen nötig – Produkt wird umwickelt)
    """
    blank_length = (2 * L + 2 * B
                    + overlap_mm
                    + 4 * score_allow)
    blank_width = B + 2 * H

    area_mm2 = blank_length * blank_width
    area_m2 = area_mm2 / 1e6
    return {
        "blank_length_mm": blank_length,
        "blank_width_mm": blank_width,
        "area_m2": area_m2,
        "area_mm2": area_mm2,
        "overlap_mm": overlap_mm,
    }


def calc_tape_cost(L, B, H, tape_price_roll, tape_length_roll_m, pattern):
    """Klebeband-Kosten RSC: H-Muster oder Einfach."""
    if pattern == "H-Muster":
        tape_m = ((L + 2 * B + 150) / 1000) * 2
    else:
        tape_m = ((B + 100) / 1000) * 2
    cost_per_m = tape_price_roll / tape_length_roll_m
    return {"tape_m": tape_m, "cost_per_box": tape_m * cost_per_m}


def calc_hotmelt_cost(seam_length_m, hm_price_kg, hm_g_per_m):
    """Hotmelt-Kosten aus Nahtlänge."""
    kg = seam_length_m * hm_g_per_m / 1000
    return {"seam_m": seam_length_m, "kg": kg, "cost_per_box": kg * hm_price_kg}


def calc_rsc_seam_length(L, B, H):
    """RSC Hotmelt: Herstellernaht(H) + Klappenverschluss oben/unten."""
    mfg = H / 1000
    flaps = 2 * (2 * B) / 1000  # Oben + Unten je 2 Klappen mit B-Breite
    return mfg + flaps


def calc_wa_seam_length(L, B, H):
    """Wrap-Around: Längsnaht + 2 Endverklebungen."""
    seam_longitudinal = H / 1000
    seam_ends = 2 * (L + B) / 1000
    return seam_longitudinal + seam_ends


# =========================================================================
# MASCHINEN- UND LINIENKENNWERTE
# =========================================================================

def calc_machine_metrics(
    cartons_per_min,
    changeover_min,
    planned_hours_per_day,
    unplanned_stop_pct,
    annual_days,
):
    """OEE-basierte Linienleistung."""
    gross_min_day = planned_hours_per_day * 60
    net_min_day = gross_min_day * (1 - unplanned_stop_pct / 100)
    cartons_day = net_min_day * cartons_per_min
    cartons_year = cartons_day * annual_days
    availability = (1 - unplanned_stop_pct / 100) * 100
    return {
        "cartons_per_day": cartons_day,
        "cartons_per_year": cartons_year,
        "net_min_per_day": net_min_day,
        "availability_pct": availability,
    }


# =========================================================================
# TCO-MODELL
# =========================================================================

def calc_tco(
    carton_cost_per_box,
    production_volume,
    machine_invest,
    machine_life_years,
    energy_kw,
    energy_price_kwh,
    operating_hours_year,
    operators,
    operator_cost_hour,
    maintenance_pct_invest,
    spare_parts_year,
    magazine_refills_per_shift,
    shifts_per_day,
    days_per_year,
):
    """Total Cost of Ownership – jährlich."""
    annual_depreciation = machine_invest / machine_life_years if machine_life_years > 0 else 0
    annual_energy = energy_kw * operating_hours_year * energy_price_kwh
    annual_personnel = operators * operator_cost_hour * operating_hours_year
    annual_maintenance = machine_invest * maintenance_pct_invest / 100
    annual_material = carton_cost_per_box * production_volume
    annual_spares = spare_parts_year
    total_annual = (
        annual_depreciation
        + annual_energy
        + annual_personnel
        + annual_maintenance
        + annual_material
        + annual_spares
    )
    cost_per_box_tco = total_annual / production_volume if production_volume > 0 else 0
    return {
        "depreciation": annual_depreciation,
        "energy": annual_energy,
        "personnel": annual_personnel,
        "maintenance": annual_maintenance,
        "material": annual_material,
        "spares": annual_spares,
        "total": total_annual,
        "per_box": cost_per_box_tco,
    }


# =========================================================================
# NACHHALTIGKEIT
# =========================================================================

def calc_sustainability(area_m2, weight_gsm, production_volume, transport_km, pallet_factor):
    """Vereinfachte CO₂-Abschätzung."""
    weight_kg_per_box = area_m2 * weight_gsm / 1000
    total_weight_t = weight_kg_per_box * production_volume / 1000
    co2_material_kg = total_weight_t * 0.7  # ~0.7 kg CO₂/kg Wellpappe (Literaturwert)
    co2_transport_kg = total_weight_t * transport_km * 0.062 / 1000  # g CO₂/(t·km) LKW
    # Paletten-Effizienz: weniger Transporte bei flachem Zuschnitt
    co2_transport_adjusted = co2_transport_kg / pallet_factor if pallet_factor > 0 else co2_transport_kg
    return {
        "weight_kg_per_box": weight_kg_per_box,
        "total_weight_t": total_weight_t,
        "co2_material_kg": co2_material_kg,
        "co2_transport_kg": co2_transport_adjusted,
        "co2_total_kg": co2_material_kg + co2_transport_adjusted,
    }


# =========================================================================
# SENSITIVITÄTSANALYSE
# =========================================================================

def sensitivity_sweep(base_value, param_name, range_pct, steps, calc_fn):
    """Variiere einen Parameter ±range_pct und berechne Zielgröße."""
    results = []
    low = base_value * (1 - range_pct / 100)
    high = base_value * (1 + range_pct / 100)
    for val in [low + (high - low) * i / steps for i in range(steps + 1)]:
        results.append({"param_value": val, "result": calc_fn(val)})
    return results


# =========================================================================
# SVG DIELINE GENERATOR (inline, no external dependency)
# =========================================================================

def generate_dieline_svg(panels, blank_w, blank_h, crease_xs, crease_ys,
                         label_text, margin=10, scale=0.5):
    """Minimalistischer SVG-Generator für Zuschnitt-Visualisierung."""
    sw = blank_w * scale + 2 * margin
    sh = blank_h * scale + 2 * margin
    ox, oy = margin, margin

    lines = []
    lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" '
                 f'width="{sw:.0f}" height="{sh + 80:.0f}" '
                 f'viewBox="0 0 {sw:.0f} {sh + 80:.0f}">')
    lines.append(f'<rect x="{ox}" y="{oy}" width="{blank_w*scale:.1f}" '
                 f'height="{blank_h*scale:.1f}" fill="none" stroke="black" stroke-width="1.5"/>')

    for cx in crease_xs:
        x = ox + cx * scale
        lines.append(f'<line x1="{x:.1f}" y1="{oy}" x2="{x:.1f}" '
                     f'y2="{oy + blank_h*scale:.1f}" '
                     f'stroke="blue" stroke-width="0.8" stroke-dasharray="6,4"/>')

    for cy in crease_ys:
        y = oy + cy * scale
        lines.append(f'<line x1="{ox}" y1="{y:.1f}" x2="{ox + blank_w*scale:.1f}" '
                     f'y2="{y:.1f}" '
                     f'stroke="blue" stroke-width="0.8" stroke-dasharray="6,4"/>')

    # Panel labels
    prev_x = 0
    for i, (name, pw) in enumerate(panels):
        cx = ox + (prev_x + pw / 2) * scale
        cy = oy + blank_h * scale / 2
        lines.append(f'<text x="{cx:.1f}" y="{cy:.1f}" text-anchor="middle" '
                     f'font-size="11" font-family="Arial" fill="#333">{name}</text>')
        prev_x += pw

    # Info text below
    ty = oy + blank_h * scale + 20
    for j, txt in enumerate(label_text):
        lines.append(f'<text x="{ox}" y="{ty + j*16:.0f}" '
                     f'font-size="11" font-family="Arial" fill="#555">{txt}</text>')

    lines.append('</svg>')
    return "\n".join(lines)


def make_rsc_svg(L, B, H, blank):
    """SVG für RSC 0201."""
    bl = blank["blank_length_mm"]
    bw = blank["blank_width_mm"]
    flap = blank["flap_height_mm"]
    mfg = blank["mfg_flap_mm"]

    # Panels horizontal: L | B | L | B | mfg_flap
    panels = [("L", L), ("B", B), ("L", L), ("B", B), ("Lasche", mfg)]
    crease_xs = []
    x = 0
    for name, pw in panels[:-1]:
        x += pw
        crease_xs.append(x)

    # Crease lines horizontal: flap_bottom | H | flap_top
    crease_ys = [flap, flap + H]

    labels = [
        f"RSC FEFCO 0201 | Innen: {L:.0f} x {B:.0f} x {H:.0f} mm",
        f"Zuschnitt: {bl:.1f} x {bw:.1f} mm = {blank['area_m2']:.4f} m2",
    ]
    return generate_dieline_svg(panels, bl, bw, crease_xs, crease_ys, labels)


def make_wa_svg(L, B, H, blank):
    """SVG für Wrap-Around 0409."""
    bl = blank["blank_length_mm"]
    bw = blank["blank_width_mm"]
    ovl = blank["overlap_mm"]

    panels = [("L", L), ("B", B), ("L", L), ("B", B), ("Overlap", ovl)]
    crease_xs = []
    x = 0
    for name, pw in panels[:-1]:
        x += pw
        crease_xs.append(x)

    crease_ys = [H, H + B]  # top panel edge, bottom panel edge — simplified

    labels = [
        f"Wrap-Around FEFCO 0409 | Innen: {L:.0f} x {B:.0f} x {H:.0f} mm",
        f"Zuschnitt: {bl:.1f} x {bw:.1f} mm = {blank['area_m2']:.4f} m2",
    ]
    return generate_dieline_svg(panels, bl, bw, crease_xs, crease_ys, labels)


# =========================================================================
# EMPFEHLUNGSLOGIK
# =========================================================================

def generate_recommendation(
    area_savings_pct,
    cost_savings_per_box,
    production_volume,
    rsc_tco_total,
    wa_tco_total,
    changeover_count,
):
    """Bedingte Empfehlung: wenn…, dann…"""
    rec = []
    winner = None

    # Materialeffizienz
    if area_savings_pct > 5:
        rec.append(
            f"Wrap-Around spart {area_savings_pct:.1f} % Material – signifikant bei Großserien."
        )
    elif area_savings_pct > 0:
        rec.append(
            f"Materialersparnis mit Wrap-Around ({area_savings_pct:.1f} %) ist vorhanden, aber moderat."
        )
    else:
        rec.append(
            "RSC verbraucht in diesem Fall weniger Material als Wrap-Around."
        )

    # Stückkosten
    if cost_savings_per_box > 0:
        annual_saving = cost_savings_per_box * production_volume
        rec.append(
            f"Wrap-Around ist {cost_savings_per_box:.4f} EUR/Box guenstiger "
            f"(= {annual_saving:,.0f} EUR/Jahr bei {production_volume:,} Stk.)."
        )
    else:
        rec.append(
            "RSC ist auf Stueckkostenbasis guenstiger."
        )

    # TCO
    if wa_tco_total < rsc_tco_total:
        pct = (rsc_tco_total - wa_tco_total) / rsc_tco_total * 100
        rec.append(
            f"Wrap-Around TCO liegt {pct:.1f} % unter RSC – empfehlenswert bei stabilem Volumen."
        )
        winner = "Wrap-Around"
    else:
        pct = (wa_tco_total - rsc_tco_total) / wa_tco_total * 100 if wa_tco_total > 0 else 0
        rec.append(
            f"RSC TCO liegt {pct:.1f} % unter Wrap-Around – z.B. bei niedrigem Volumen oder Bestandsanlage."
        )
        winner = "RSC"

    # Serienwechsel
    if changeover_count > 10:
        rec.append(
            "Bei haeufigen Formatwechseln (>10/Woche): Umruestzeiten und Magazin-Handling kritisch pruefen."
        )

    # Klarer Entscheid
    if winner == "Wrap-Around" and area_savings_pct > 3 and cost_savings_per_box > 0:
        rec.append("EMPFEHLUNG: Wrap-Around ist technisch und wirtschaftlich vorteilhaft.")
    elif winner == "RSC":
        rec.append("EMPFEHLUNG: RSC bleibt die bessere Wahl fuer dieses Szenario.")
    else:
        rec.append("EMPFEHLUNG: Detailprüfung empfohlen – kein klarer Vorteil eines Systems.")

    return rec, winner


# =========================================================================
# SIDEBAR – Eingabeparameter
# =========================================================================
st.sidebar.header("Eingabeparameter")

# --- Abmessungen ---
st.sidebar.subheader("Kartonabmessungen (Innenmaß)")
length = st.sidebar.number_input("Laenge L (mm)", 50, 2000, 400, 10)
width = st.sidebar.number_input("Breite B (mm)", 50, 2000, 300, 10)
height = st.sidebar.number_input("Hoehe H (mm)", 20, 1000, 200, 10)

# --- Wellenprofil ---
st.sidebar.subheader("Material")
flute_name = st.sidebar.selectbox("Wellpappe-Typ", list(FLUTE_PROFILES.keys()), index=2)
flute = FLUTE_PROFILES[flute_name]
t = flute["thickness_mm"]
score_allow = flute["score_allowance_mm"]

board_grammage = st.sidebar.number_input(
    "Flächengewicht Wellpappe (g/m²)", 300, 1200, 550, 10,
    help="Typisch 400-800 g/m² je nach Aufbau"
)

# --- Kostenparameter ---
st.sidebar.subheader("Materialkosten")
rsc_price_per_1000 = st.sidebar.number_input("RSC Preis/1000 Stk (EUR)", 100.0, 5000.0, 610.0, 10.0)
wa_price_per_1000 = st.sidebar.number_input("WA Preis/1000 Stk (EUR)", 100.0, 5000.0, 555.0, 10.0)

# --- RSC Verschluss ---
st.sidebar.subheader("RSC Verschluss")
rsc_closure = st.sidebar.selectbox("Verschlussart RSC", ["Tape", "Hotmelt", "Beide vergleichen"])
tape_price_roll = st.sidebar.number_input("Tape: Preis/Rolle (EUR)", 0.5, 20.0, 2.50, 0.1)
tape_length_roll = st.sidebar.number_input("Tape: Meter/Rolle", 10, 200, 66)
tape_pattern = st.sidebar.selectbox("Tape: Muster", ["H-Muster", "Einfach"])

# --- Hotmelt ---
st.sidebar.subheader("Hotmelt-Parameter")
hm_price_kg = st.sidebar.number_input("Hotmelt Preis/kg (EUR)", 1.0, 30.0, 3.0, 0.5)
hm_bead_options = {
    "1.5 mm (0.50 g/m)": 0.50,
    "3.0 mm (2.00 g/m)": 2.00,
    "5.0 mm (6.67 g/m)": 6.67,
}
hm_bead_name = st.sidebar.selectbox("Raupenbreite", list(hm_bead_options.keys()), index=1)
hm_g_per_m = hm_bead_options[hm_bead_name]

# --- WA Overlap ---
st.sidebar.subheader("Wrap-Around Spezifisch")
wa_overlap = st.sidebar.number_input("Ueberlappung (mm)", 20.0, 100.0, 35.0, 5.0)

# --- Produktionsvolumen ---
st.sidebar.subheader("Produktion")
production_volume = st.sidebar.number_input("Jahresvolumen (Stk)", 1000, 50_000_000, 500_000, 10_000)
changeover_per_week = st.sidebar.number_input("Formatwechsel/Woche", 0, 50, 5)

# --- Maschinenparameter ---
st.sidebar.subheader("Maschinenparameter")
col_m1, col_m2 = st.sidebar.columns(2)
rsc_cpm = col_m1.number_input("RSC Takt (K/min)", 1, 100, 25)
wa_cpm = col_m2.number_input("WA Takt (K/min)", 1, 100, 35)
planned_hours = st.sidebar.number_input("Geplante Laufzeit/Tag (h)", 1, 24, 16)
unplanned_stop_pct = st.sidebar.number_input("Ungeplante Stillstände (%)", 0.0, 50.0, 8.0, 1.0)
annual_days = st.sidebar.number_input("Produktionstage/Jahr", 50, 365, 250)

# --- Investition / TCO ---
st.sidebar.subheader("Investition & TCO")
col_i1, col_i2 = st.sidebar.columns(2)
rsc_invest = col_i1.number_input("RSC Maschine (EUR)", 0, 5_000_000, 180_000, 10_000)
wa_invest = col_i2.number_input("WA Maschine (EUR)", 0, 5_000_000, 450_000, 10_000)
machine_life = st.sidebar.number_input("Nutzungsdauer (Jahre)", 1, 30, 10)
col_e1, col_e2 = st.sidebar.columns(2)
rsc_energy_kw = col_e1.number_input("RSC Leistung (kW)", 0.0, 200.0, 8.0, 1.0)
wa_energy_kw = col_e2.number_input("WA Leistung (kW)", 0.0, 200.0, 15.0, 1.0)
energy_price = st.sidebar.number_input("Strompreis (EUR/kWh)", 0.05, 1.0, 0.25, 0.01)
col_p1, col_p2 = st.sidebar.columns(2)
rsc_operators = col_p1.number_input("RSC Bediener", 0.0, 10.0, 1.0, 0.5)
wa_operators = col_p2.number_input("WA Bediener", 0.0, 10.0, 0.5, 0.5)
operator_cost = st.sidebar.number_input("Bedienerkosten (EUR/h)", 10.0, 100.0, 40.0, 5.0)
maintenance_pct = st.sidebar.number_input("Wartung (% Invest/Jahr)", 0.0, 15.0, 3.0, 0.5)
spare_parts = st.sidebar.number_input("Ersatzteile (EUR/Jahr)", 0, 100_000, 5_000, 1_000)

# --- Nachhaltigkeit ---
st.sidebar.subheader("Nachhaltigkeit")
transport_km = st.sidebar.number_input("Transport Zulieferung (km)", 10, 5000, 200, 50)

# =========================================================================
# BERECHNUNGEN
# =========================================================================

# Zuschnitte
rsc_blank = calc_rsc_blank(length, width, height, t, score_allow=score_allow)
wa_blank = calc_wa_blank(length, width, height, t, overlap_mm=wa_overlap, score_allow=score_allow)

# Flächen
area_savings_pct = (
    (rsc_blank["area_m2"] - wa_blank["area_m2"]) / rsc_blank["area_m2"] * 100
    if rsc_blank["area_m2"] > 0 else 0
)

# Materialkosten
rsc_mat = rsc_price_per_1000 / 1000
wa_mat = wa_price_per_1000 / 1000

# Klebekosten
rsc_tape = calc_tape_cost(length, width, height, tape_price_roll, tape_length_roll, tape_pattern)
rsc_seam = calc_rsc_seam_length(length, width, height)
rsc_hm = calc_hotmelt_cost(rsc_seam, hm_price_kg, hm_g_per_m)
wa_seam = calc_wa_seam_length(length, width, height)
wa_hm = calc_hotmelt_cost(wa_seam, hm_price_kg, hm_g_per_m)

# RSC Gesamtkosten je nach Verschluss
if rsc_closure == "Tape":
    rsc_adhesive_cost = rsc_tape["cost_per_box"]
    rsc_adhesive_label = "Tape"
elif rsc_closure == "Hotmelt":
    rsc_adhesive_cost = rsc_hm["cost_per_box"]
    rsc_adhesive_label = "Hotmelt"
else:
    rsc_adhesive_cost = min(rsc_tape["cost_per_box"], rsc_hm["cost_per_box"])
    rsc_adhesive_label = "Tape" if rsc_tape["cost_per_box"] <= rsc_hm["cost_per_box"] else "Hotmelt"

rsc_total_per_box = rsc_mat + rsc_adhesive_cost
wa_total_per_box = wa_mat + wa_hm["cost_per_box"]
cost_diff = rsc_total_per_box - wa_total_per_box

# Maschinen-Metriken
op_hours_year = planned_hours * annual_days
rsc_machine = calc_machine_metrics(rsc_cpm, 0, planned_hours, unplanned_stop_pct, annual_days)
wa_machine = calc_machine_metrics(wa_cpm, 0, planned_hours, unplanned_stop_pct, annual_days)

# TCO
rsc_tco = calc_tco(
    rsc_total_per_box, production_volume, rsc_invest, machine_life,
    rsc_energy_kw, energy_price, op_hours_year,
    rsc_operators, operator_cost, maintenance_pct, spare_parts,
    0, 1, annual_days,
)
wa_tco = calc_tco(
    wa_total_per_box, production_volume, wa_invest, machine_life,
    wa_energy_kw, energy_price, op_hours_year,
    wa_operators, operator_cost, maintenance_pct, spare_parts,
    0, 1, annual_days,
)

# Nachhaltigkeit
rsc_pallet_factor = 1.0  # Baseline
wa_pallet_factor = 1.4   # ~40% mehr Zuschnitte/Palette (flach)
rsc_sust = calc_sustainability(rsc_blank["area_m2"], board_grammage, production_volume, transport_km, rsc_pallet_factor)
wa_sust = calc_sustainability(wa_blank["area_m2"], board_grammage, production_volume, transport_km, wa_pallet_factor)

# Empfehlung
recommendations, winner = generate_recommendation(
    area_savings_pct, cost_diff, production_volume,
    rsc_tco["total"], wa_tco["total"], changeover_per_week,
)

# =========================================================================
# UI – TABS
# =========================================================================
tabs = st.tabs([
    "Kostenvergleich",
    "Technische Details",
    "Maschine & Linie",
    "TCO-Analyse",
    "Sensitivitaet",
    "Nachhaltigkeit",
    "Zuschnitt (Dieline)",
    "Empfehlung",
    "Export",
])

# --- Tab 0: Kostenvergleich ---
with tabs[0]:
    st.header("Kostenvergleich pro Box")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("RSC (FEFCO 0201)")
        st.metric("Zuschnittflaeche", f"{rsc_blank['area_m2']:.4f} m2")
        st.metric("Materialkosten/Box", f"{rsc_mat:.4f} EUR")
        st.metric(f"Klebekosten/Box ({rsc_adhesive_label})", f"{rsc_adhesive_cost:.4f} EUR")
        st.metric("Gesamtkosten/Box", f"{rsc_total_per_box:.4f} EUR")
    with col2:
        st.subheader("Wrap-Around (FEFCO 0409)")
        st.metric("Zuschnittflaeche", f"{wa_blank['area_m2']:.4f} m2")
        st.metric("Materialkosten/Box", f"{wa_mat:.4f} EUR")
        st.metric("Klebekosten/Box (Hotmelt)", f"{wa_hm['cost_per_box']:.4f} EUR")
        st.metric("Gesamtkosten/Box", f"{wa_total_per_box:.4f} EUR")

    st.divider()

    # Einsparungen
    col1, col2, col3 = st.columns(3)
    col1.metric("Flaechenersparnis", f"{area_savings_pct:.2f} %")
    col2.metric("Kostenersparnis/Box", f"{cost_diff:.4f} EUR",
                delta=f"{cost_diff / rsc_total_per_box * 100:.1f} %" if rsc_total_per_box else "")
    col3.metric(
        f"Ersparnis bei {production_volume:,} Stk".replace(",", "."),
        f"{cost_diff * production_volume:,.0f} EUR".replace(",", "."),
    )

    # Volumenstaffel
    st.subheader("Hochrechnung nach Volumen")
    vols = [1_000, 10_000, 50_000, 100_000, 500_000, 1_000_000]
    vol_df = pd.DataFrame({
        "Volumen": [f"{v:,}".replace(",", ".") for v in vols],
        "RSC Gesamt (EUR)": [f"{rsc_total_per_box * v:,.2f}".replace(",", ".") for v in vols],
        "WA Gesamt (EUR)": [f"{wa_total_per_box * v:,.2f}".replace(",", ".") for v in vols],
        "Ersparnis (EUR)": [f"{cost_diff * v:,.2f}".replace(",", ".") for v in vols],
    })
    st.dataframe(vol_df, use_container_width=True, hide_index=True)

    # Balkendiagramm
    fig_cost = go.Figure(data=[
        go.Bar(name="Materialkosten", x=["RSC", "Wrap-Around"],
               y=[rsc_mat, wa_mat], marker_color="#4A90D9"),
        go.Bar(name="Klebekosten", x=["RSC", "Wrap-Around"],
               y=[rsc_adhesive_cost, wa_hm["cost_per_box"]], marker_color="#E07B54"),
    ])
    fig_cost.update_layout(barmode="stack", title="Kostenaufschluesselung pro Box",
                           yaxis_title="EUR", height=400)
    st.plotly_chart(fig_cost, use_container_width=True)


# --- Tab 1: Technische Details ---
with tabs[1]:
    st.header("Technische Details")
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("RSC (FEFCO 0201)")
        st.write(f"- Bogenlänge: **{rsc_blank['blank_length_mm']:.1f}** mm")
        st.write(f"- Bogenbreite: **{rsc_blank['blank_width_mm']:.1f}** mm")
        st.write(f"- Zuschnittfläche: **{rsc_blank['area_m2']:.4f}** m²")
        st.write(f"- Klappenhoehe: {rsc_blank['flap_height_mm']:.0f} mm (= max(L,B)/2)")
        st.write(f"- Klebelasche: {rsc_blank['mfg_flap_mm']:.0f} mm")
        st.code(
            f"Bogenlänge = 2*{length} + 2*{width} + 4*{t} + 25 + 20 + 4*{score_allow}\n"
            f"           = {rsc_blank['blank_length_mm']:.1f} mm\n"
            f"Bogenbreite = {max(length,width)/2:.0f} + {height} + {width} + {height} + {max(length,width)/2:.0f}"
            f" + 4*{t} + 20 + 2*{score_allow}\n"
            f"            = {rsc_blank['blank_width_mm']:.1f} mm"
        )

    with col2:
        st.subheader("Wrap-Around (FEFCO 0409)")
        st.write(f"- Bogenlänge: **{wa_blank['blank_length_mm']:.1f}** mm")
        st.write(f"- Bogenbreite: **{wa_blank['blank_width_mm']:.1f}** mm")
        st.write(f"- Zuschnittfläche: **{wa_blank['area_m2']:.4f}** m²")
        st.write(f"- Überlappung: {wa_overlap:.0f} mm")
        st.code(
            f"Bogenlänge = 2*{length} + 2*{width} + {wa_overlap:.0f} + 4*{score_allow}\n"
            f"           = {wa_blank['blank_length_mm']:.1f} mm\n"
            f"Bogenbreite = {width} + 2*{height}\n"
            f"            = {wa_blank['blank_width_mm']:.1f} mm"
        )

    st.divider()
    st.subheader("Klebekosten-Details")
    col1, col2 = st.columns(2)
    with col1:
        st.write("**RSC Tape:**")
        st.write(f"- Bandlänge/Box: {rsc_tape['tape_m']:.3f} m ({tape_pattern})")
        st.write(f"- Kosten/Box: {rsc_tape['cost_per_box']:.4f} EUR")
        st.write("**RSC Hotmelt (Alternative):**")
        st.write(f"- Nahtstrecke: {rsc_seam:.3f} m")
        st.write(f"- Verbrauch: {rsc_hm['kg']*1000:.2f} g")
        st.write(f"- Kosten/Box: {rsc_hm['cost_per_box']:.4f} EUR")
    with col2:
        st.write("**Wrap-Around Hotmelt:**")
        st.write(f"- Nahtstrecke: {wa_seam:.3f} m")
        st.write(f"  - Laengsnaht: {height/1000:.3f} m")
        st.write(f"  - Endverklebung: {2*(length+width)/1000:.3f} m")
        st.write(f"- Verbrauch: {wa_hm['kg']*1000:.2f} g")
        st.write(f"- Kosten/Box: {wa_hm['cost_per_box']:.4f} EUR")


# --- Tab 2: Maschine & Linie ---
with tabs[2]:
    st.header("Maschinen- & Linienperspektive")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("RSC-Linie (Top-Loader / Case Erector)")
        st.metric("Taktleistung", f"{rsc_cpm} Kartons/min")
        st.metric("Kartons/Tag (netto)", f"{rsc_machine['cartons_per_day']:,.0f}".replace(",", "."))
        st.metric("Kartons/Jahr", f"{rsc_machine['cartons_per_year']:,.0f}".replace(",", "."))
        st.metric("Verfuegbarkeit", f"{rsc_machine['availability_pct']:.1f} %")
        st.write(f"- Bediener: {rsc_operators}")
        st.write(f"- Investition: {rsc_invest:,.0f} EUR".replace(",", "."))
    with col2:
        st.subheader("Wrap-Around-Linie (Meypack)")
        st.metric("Taktleistung", f"{wa_cpm} Kartons/min")
        st.metric("Kartons/Tag (netto)", f"{wa_machine['cartons_per_day']:,.0f}".replace(",", "."))
        st.metric("Kartons/Jahr", f"{wa_machine['cartons_per_year']:,.0f}".replace(",", "."))
        st.metric("Verfuegbarkeit", f"{wa_machine['availability_pct']:.1f} %")
        st.write(f"- Bediener: {wa_operators}")
        st.write(f"- Investition: {wa_invest:,.0f} EUR".replace(",", "."))

    st.divider()
    st.subheader("Vergleich: Maschinenkonzepte")
    machine_comp = pd.DataFrame({
        "Kriterium": [
            "Taktleistung (K/min)",
            "Zuschnittzufuhr",
            "Magazin-Kapazitaet",
            "Automatisierungsgrad",
            "Typischer Umruestaufwand",
            "Bediener (typisch)",
            "Investitionshoehe",
        ],
        "RSC (Top-Loader)": [
            f"{rsc_cpm}", "Aufgerichtet (3D)", "Begrenzt (vorgeklebt)",
            "Mittel", "15-30 min", f"{rsc_operators}", f"{rsc_invest:,.0f} EUR",
        ],
        "Wrap-Around (Meypack)": [
            f"{wa_cpm}", "Flachzuschnitt (2D)", "Hoch (2x Kapazitaet, flach)",
            "Hoch", "10-20 min (Servomotoren)", f"{wa_operators}", f"{wa_invest:,.0f} EUR",
        ],
    })
    st.dataframe(machine_comp, use_container_width=True, hide_index=True)

    # Kapazitätsvergleich
    st.subheader("Jahreskapazitaet vs. Bedarf")
    fig_cap = go.Figure()
    fig_cap.add_trace(go.Bar(
        name="RSC Kapazitaet",
        x=["Kapazitaet/Jahr", "Bedarf/Jahr"],
        y=[rsc_machine["cartons_per_year"], production_volume],
        marker_color="#4A90D9",
    ))
    fig_cap.add_trace(go.Bar(
        name="WA Kapazitaet",
        x=["Kapazitaet/Jahr", "Bedarf/Jahr"],
        y=[wa_machine["cartons_per_year"], production_volume],
        marker_color="#E07B54",
    ))
    fig_cap.update_layout(barmode="group", height=400, yaxis_title="Kartons")
    st.plotly_chart(fig_cap, use_container_width=True)


# --- Tab 3: TCO ---
with tabs[3]:
    st.header("Total Cost of Ownership (TCO) – jaehrlich")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("RSC")
        for k, lbl in [
            ("depreciation", "Abschreibung"),
            ("energy", "Energie"),
            ("personnel", "Personal"),
            ("maintenance", "Wartung"),
            ("spares", "Ersatzteile"),
            ("material", "Material+Kleber"),
        ]:
            st.write(f"- {lbl}: **{rsc_tco[k]:,.0f}** EUR".replace(",", "."))
        st.metric("TCO Gesamt/Jahr", f"{rsc_tco['total']:,.0f} EUR".replace(",", "."))
        st.metric("TCO pro Box", f"{rsc_tco['per_box']:.4f} EUR")
    with col2:
        st.subheader("Wrap-Around")
        for k, lbl in [
            ("depreciation", "Abschreibung"),
            ("energy", "Energie"),
            ("personnel", "Personal"),
            ("maintenance", "Wartung"),
            ("spares", "Ersatzteile"),
            ("material", "Material+Kleber"),
        ]:
            st.write(f"- {lbl}: **{wa_tco[k]:,.0f}** EUR".replace(",", "."))
        st.metric("TCO Gesamt/Jahr", f"{wa_tco['total']:,.0f} EUR".replace(",", "."))
        st.metric("TCO pro Box", f"{wa_tco['per_box']:.4f} EUR")

    st.divider()
    tco_diff = rsc_tco["total"] - wa_tco["total"]
    st.metric(
        "TCO-Differenz/Jahr (RSC minus WA)",
        f"{tco_diff:,.0f} EUR".replace(",", "."),
        delta=f"{'Vorteil WA' if tco_diff > 0 else 'Vorteil RSC'}",
    )

    # TCO Wasserfall
    categories = ["Abschreibung", "Energie", "Personal", "Wartung", "Ersatzteile", "Material"]
    rsc_vals = [rsc_tco["depreciation"], rsc_tco["energy"], rsc_tco["personnel"],
                rsc_tco["maintenance"], rsc_tco["spares"], rsc_tco["material"]]
    wa_vals = [wa_tco["depreciation"], wa_tco["energy"], wa_tco["personnel"],
               wa_tco["maintenance"], wa_tco["spares"], wa_tco["material"]]

    fig_tco = go.Figure()
    fig_tco.add_trace(go.Bar(name="RSC", x=categories, y=rsc_vals, marker_color="#4A90D9"))
    fig_tco.add_trace(go.Bar(name="Wrap-Around", x=categories, y=wa_vals, marker_color="#E07B54"))
    fig_tco.update_layout(barmode="group", title="TCO-Aufschluesselung (jaehrlich)",
                          yaxis_title="EUR", height=450)
    st.plotly_chart(fig_tco, use_container_width=True)

    # Break-Even
    st.subheader("Break-Even-Analyse")
    if tco_diff != 0:
        invest_diff = wa_invest - rsc_invest
        annual_saving = tco_diff - (wa_tco["depreciation"] - rsc_tco["depreciation"])
        if annual_saving > 0 and invest_diff > 0:
            break_even_years = invest_diff / annual_saving
            st.write(
                f"Die hoehere WA-Investition ({invest_diff:,.0f} EUR) amortisiert sich "
                f"in **{break_even_years:.1f} Jahren** durch niedrigere Betriebskosten."
            )
        elif invest_diff <= 0:
            st.write("Wrap-Around erfordert keine Mehrinvestition gegenueber RSC.")
        else:
            st.write("Kein Break-Even: RSC hat niedrigere Betriebskosten in diesem Szenario.")


# --- Tab 4: Sensitivitaet ---
with tabs[4]:
    st.header("Sensitivitaetsanalyse")
    st.write("Wie veraendert sich die Kostenersparnis bei Variation eines Parameters?")

    sens_param = st.selectbox("Parameter variieren:", [
        "Produktionsvolumen",
        "RSC Preis/1000",
        "WA Preis/1000",
        "Hotmelt Preis/kg",
    ])

    if sens_param == "Produktionsvolumen":
        x_vals = [v for v in range(10_000, 2_000_001, 50_000)]
        y_rsc = [rsc_total_per_box * v for v in x_vals]
        y_wa = [wa_total_per_box * v for v in x_vals]
        y_diff = [cost_diff * v for v in x_vals]
        x_label = "Produktionsvolumen (Stk)"
    elif sens_param == "RSC Preis/1000":
        x_vals = [p for p in range(300, 1201, 50)]
        y_rsc = [(p / 1000 + rsc_adhesive_cost) * production_volume for p in x_vals]
        y_wa = [wa_total_per_box * production_volume] * len(x_vals)
        y_diff = [yr - yw for yr, yw in zip(y_rsc, y_wa)]
        x_label = "RSC Preis/1000 (EUR)"
    elif sens_param == "WA Preis/1000":
        x_vals = [p for p in range(300, 1201, 50)]
        y_rsc = [rsc_total_per_box * production_volume] * len(x_vals)
        y_wa = [(p / 1000 + wa_hm["cost_per_box"]) * production_volume for p in x_vals]
        y_diff = [yr - yw for yr, yw in zip(y_rsc, y_wa)]
        x_label = "WA Preis/1000 (EUR)"
    else:  # Hotmelt
        x_vals = [p / 10 for p in range(10, 201, 5)]
        y_rsc = [rsc_total_per_box * production_volume] * len(x_vals)
        y_wa = [(wa_mat + calc_hotmelt_cost(wa_seam, p, hm_g_per_m)["cost_per_box"]) * production_volume
                for p in x_vals]
        y_diff = [yr - yw for yr, yw in zip(y_rsc, y_wa)]
        x_label = "Hotmelt Preis (EUR/kg)"

    fig_sens = make_subplots(specs=[[{"secondary_y": True}]])
    fig_sens.add_trace(go.Scatter(x=x_vals, y=y_rsc, name="RSC Gesamt", line=dict(color="#4A90D9")))
    fig_sens.add_trace(go.Scatter(x=x_vals, y=y_wa, name="WA Gesamt", line=dict(color="#E07B54")))
    fig_sens.add_trace(
        go.Scatter(x=x_vals, y=y_diff, name="Differenz (RSC-WA)",
                   line=dict(color="green", dash="dash"), fill="tozeroy"),
        secondary_y=True,
    )
    fig_sens.update_layout(title=f"Sensitivitaet: {sens_param}", height=500,
                           xaxis_title=x_label)
    fig_sens.update_yaxes(title_text="Gesamtkosten (EUR)", secondary_y=False)
    fig_sens.update_yaxes(title_text="Differenz (EUR)", secondary_y=True)
    st.plotly_chart(fig_sens, use_container_width=True)

    # Cross-over Punkt
    crossover_idx = None
    for i in range(1, len(y_diff)):
        if (y_diff[i - 1] > 0 and y_diff[i] <= 0) or (y_diff[i - 1] < 0 and y_diff[i] >= 0):
            crossover_idx = i
            break
    if crossover_idx:
        st.info(f"Crossover-Punkt bei ca. **{x_vals[crossover_idx]:,.0f}** {x_label.split('(')[-1].replace(')', '')}")
    elif all(d > 0 for d in y_diff):
        st.success("Wrap-Around ist im gesamten Bereich guenstiger.")
    elif all(d < 0 for d in y_diff):
        st.warning("RSC ist im gesamten Bereich guenstiger.")


# --- Tab 5: Nachhaltigkeit ---
with tabs[5]:
    st.header("Nachhaltigkeit & CO2-Bilanz")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("RSC")
        st.write(f"- Gewicht/Box: {rsc_sust['weight_kg_per_box']:.3f} kg")
        st.write(f"- Gesamtgewicht: {rsc_sust['total_weight_t']:.1f} t")
        st.write(f"- CO2 Material: {rsc_sust['co2_material_kg']:.0f} kg")
        st.write(f"- CO2 Transport: {rsc_sust['co2_transport_kg']:.0f} kg")
        st.metric("CO2 Gesamt", f"{rsc_sust['co2_total_kg']:.0f} kg CO2")
    with col2:
        st.subheader("Wrap-Around")
        st.write(f"- Gewicht/Box: {wa_sust['weight_kg_per_box']:.3f} kg")
        st.write(f"- Gesamtgewicht: {wa_sust['total_weight_t']:.1f} t")
        st.write(f"- CO2 Material: {wa_sust['co2_material_kg']:.0f} kg")
        st.write(f"- CO2 Transport: {wa_sust['co2_transport_kg']:.0f} kg")
        st.metric("CO2 Gesamt", f"{wa_sust['co2_total_kg']:.0f} kg CO2")

    co2_diff = rsc_sust["co2_total_kg"] - wa_sust["co2_total_kg"]
    st.metric("CO2-Einsparung mit Wrap-Around", f"{co2_diff:.0f} kg CO2/Jahr",
              delta=f"{co2_diff / rsc_sust['co2_total_kg'] * 100:.1f} %" if rsc_sust["co2_total_kg"] > 0 else "")

    st.divider()
    st.subheader("Detailvergleich")
    sust_df = pd.DataFrame({
        "Kennzahl": [
            "Materialflaeche/Box (m2)",
            "Gewicht/Box (kg)",
            "Zuschnitte/Palette (relativ)",
            "CO2 Material (kg/Jahr)",
            "CO2 Transport (kg/Jahr)",
            "CO2 Gesamt (kg/Jahr)",
            "Recyclingfaehigkeit",
        ],
        "RSC": [
            f"{rsc_blank['area_m2']:.4f}",
            f"{rsc_sust['weight_kg_per_box']:.3f}",
            "1.0x (Basis)",
            f"{rsc_sust['co2_material_kg']:.0f}",
            f"{rsc_sust['co2_transport_kg']:.0f}",
            f"{rsc_sust['co2_total_kg']:.0f}",
            "Vollstaendig (mono-material)",
        ],
        "Wrap-Around": [
            f"{wa_blank['area_m2']:.4f}",
            f"{wa_sust['weight_kg_per_box']:.3f}",
            "1.4x (flach)",
            f"{wa_sust['co2_material_kg']:.0f}",
            f"{wa_sust['co2_transport_kg']:.0f}",
            f"{wa_sust['co2_total_kg']:.0f}",
            "Vollstaendig (mono-material)",
        ],
    })
    st.dataframe(sust_df, use_container_width=True, hide_index=True)


# --- Tab 6: Dieline ---
with tabs[6]:
    st.header("Zuschnitt-Visualisierung (Dieline)")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("RSC FEFCO 0201")
        rsc_svg = make_rsc_svg(length, width, height, rsc_blank)
        st.components.v1.html(rsc_svg, height=500, scrolling=True)

    with col2:
        st.subheader("Wrap-Around FEFCO 0409")
        wa_svg = make_wa_svg(length, width, height, wa_blank)
        st.components.v1.html(wa_svg, height=500, scrolling=True)

    st.caption(
        "Schwarz = Schnitt | Blau gestrichelt = Rilllinien | "
        "Darstellung vereinfacht, nicht massstabsgetreu."
    )


# --- Tab 7: Empfehlung ---
with tabs[7]:
    st.header("Bewertung & Empfehlung")

    if winner == "Wrap-Around":
        st.success(f"Gesamtbewertung: **Wrap-Around** ist fuer dieses Szenario vorteilhaft.")
    elif winner == "RSC":
        st.warning(f"Gesamtbewertung: **RSC** ist fuer dieses Szenario vorteilhaft.")
    else:
        st.info("Kein klarer Vorteil – Detailprüfung erforderlich.")

    for i, r in enumerate(recommendations):
        if "EMPFEHLUNG:" in r:
            st.markdown(f"**{r}**")
        else:
            st.write(f"- {r}")

    st.divider()
    st.subheader("Bedingte Entscheidungsmatrix")
    matrix = pd.DataFrame({
        "Wenn…": [
            "Grossserie (>500k/Jahr), stabile Formate",
            "Kleinserie (<50k), viele Formatwechsel",
            "Bestandsanlage (RSC Top-Loader vorhanden)",
            "Neuinvestition, hohe Linienleistung noetig",
            "Nachhaltigkeit / CO2-Reduktion priorisiert",
            "Niedriges Budget, schneller ROI noetig",
            "Hohe Produktvielfalt, kurze Serien",
        ],
        "Dann empfohlen": [
            "Wrap-Around",
            "RSC",
            "RSC (Retrofit pruefen)",
            "Wrap-Around (Meypack)",
            "Wrap-Around",
            "RSC",
            "RSC (flexibler bei Wechsel)",
        ],
        "Begruendung": [
            "Material- und Stueckkostenvorteil skaliert stark",
            "Einfacheres Handling, geringere Fixkosten",
            "Keine Neuinvestition noetig, TCO dominiert",
            "Hoehere Taktleistung, weniger Bediener, OEE-Vorteil",
            "Weniger Material, bessere Transporteffizienz",
            "Niedrigere Maschinenkosten, schnelle Amortisation",
            "Kuerzere Umruestzeiten bei einfacheren Formaten",
        ],
    })
    st.dataframe(matrix, use_container_width=True, hide_index=True)


# --- Tab 8: Export ---
with tabs[8]:
    st.header("Export")

    def create_excel():
        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            # Parameter
            param_df = pd.DataFrame({
                "Parameter": [
                    "Laenge (mm)", "Breite (mm)", "Hoehe (mm)", "Wellentyp",
                    "RSC Preis/1000", "WA Preis/1000", "Volumen/Jahr",
                    "RSC Invest", "WA Invest", "Nutzungsdauer",
                ],
                "Wert": [
                    length, width, height, flute_name,
                    rsc_price_per_1000, wa_price_per_1000, production_volume,
                    rsc_invest, wa_invest, machine_life,
                ],
            })
            param_df.to_excel(writer, sheet_name="Parameter", index=False)

            # Kostenvergleich
            cost_df = pd.DataFrame({
                "Kennzahl": [
                    "Zuschnittflaeche (m2)", "Materialkosten/Box (EUR)",
                    "Klebekosten/Box (EUR)", "Gesamtkosten/Box (EUR)",
                    "Gesamtkosten/Jahr (EUR)", "TCO/Jahr (EUR)", "TCO/Box (EUR)",
                    "CO2/Jahr (kg)",
                ],
                "RSC": [
                    rsc_blank["area_m2"], rsc_mat, rsc_adhesive_cost,
                    rsc_total_per_box, rsc_total_per_box * production_volume,
                    rsc_tco["total"], rsc_tco["per_box"], rsc_sust["co2_total_kg"],
                ],
                "Wrap-Around": [
                    wa_blank["area_m2"], wa_mat, wa_hm["cost_per_box"],
                    wa_total_per_box, wa_total_per_box * production_volume,
                    wa_tco["total"], wa_tco["per_box"], wa_sust["co2_total_kg"],
                ],
            })
            cost_df["Differenz"] = cost_df["RSC"] - cost_df["Wrap-Around"]
            cost_df.to_excel(writer, sheet_name="Kostenvergleich", index=False)

            # TCO Detail
            tco_df = pd.DataFrame({
                "Position": ["Abschreibung", "Energie", "Personal", "Wartung",
                             "Ersatzteile", "Material+Kleber", "GESAMT"],
                "RSC (EUR)": [rsc_tco["depreciation"], rsc_tco["energy"], rsc_tco["personnel"],
                              rsc_tco["maintenance"], rsc_tco["spares"], rsc_tco["material"],
                              rsc_tco["total"]],
                "WA (EUR)": [wa_tco["depreciation"], wa_tco["energy"], wa_tco["personnel"],
                             wa_tco["maintenance"], wa_tco["spares"], wa_tco["material"],
                             wa_tco["total"]],
            })
            tco_df.to_excel(writer, sheet_name="TCO", index=False)

            # Empfehlung
            rec_df = pd.DataFrame({"Empfehlung": recommendations})
            rec_df.to_excel(writer, sheet_name="Empfehlung", index=False)

        return output.getvalue()

    excel_data = create_excel()

    col1, col2 = st.columns(2)
    with col1:
        st.download_button(
            "Excel herunterladen",
            data=excel_data,
            file_name=f"karton_vergleich_{length}x{width}x{height}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    with col2:
        # Markdown-Report
        report = f"""# Karton-Kostenvergleich Report
## {length} x {width} x {height} mm | {flute_name}

### Stueckkosten
| | RSC | Wrap-Around | Differenz |
|---|---|---|---|
| Zuschnittflaeche | {rsc_blank['area_m2']:.4f} m2 | {wa_blank['area_m2']:.4f} m2 | {area_savings_pct:.1f}% |
| Material/Box | {rsc_mat:.4f} EUR | {wa_mat:.4f} EUR | {rsc_mat - wa_mat:.4f} EUR |
| Kleber/Box | {rsc_adhesive_cost:.4f} EUR | {wa_hm['cost_per_box']:.4f} EUR | {rsc_adhesive_cost - wa_hm['cost_per_box']:.4f} EUR |
| Gesamt/Box | {rsc_total_per_box:.4f} EUR | {wa_total_per_box:.4f} EUR | {cost_diff:.4f} EUR |

### TCO (jaehrlich)
| | RSC | Wrap-Around |
|---|---|---|
| Gesamt | {rsc_tco['total']:,.0f} EUR | {wa_tco['total']:,.0f} EUR |
| Pro Box | {rsc_tco['per_box']:.4f} EUR | {wa_tco['per_box']:.4f} EUR |

### CO2
| | RSC | Wrap-Around |
|---|---|---|
| Gesamt/Jahr | {rsc_sust['co2_total_kg']:.0f} kg | {wa_sust['co2_total_kg']:.0f} kg |

### Empfehlung
"""
        for r in recommendations:
            report += f"- {r}\n"

        st.download_button(
            "Markdown-Report herunterladen",
            data=report.encode("utf-8"),
            file_name=f"report_{length}x{width}x{height}.md",
            mime="text/markdown",
        )


# =========================================================================
# FOOTER
# =========================================================================
st.divider()
st.markdown(
    '<div style="text-align:center;color:gray;font-size:0.85em;">'
    "Karton-Kostenrechner | Engineering Tool fuer Meypack & Kunden | "
    "RSC = FEFCO 0201 | Wrap-Around = FEFCO 0409"
    "</div>",
    unsafe_allow_html=True,
)
