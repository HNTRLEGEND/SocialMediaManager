import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from io import BytesIO
import base64

# Seitenkonfiguration
st.set_page_config(
    page_title="Karton-Kostenrechner",
    page_icon="📦",
    layout="wide"
)

# Titel und Beschreibung
st.title("📦 Karton-Kostenvergleich: RSC vs. Wrap-Around")
st.markdown("""
Diese Anwendung berechnet automatisch die Kostenunterschiede zwischen **RSC-Kartons (FEFCO 0201)**
und **Wrap-Around-Kartons (FEFCO 0409)** basierend auf Ihren spezifischen Abmessungen und Kostenparametern.
""")

# Sidebar für Eingaben
st.sidebar.header("Eingabeparameter")

# Kartonabmessungen
st.sidebar.subheader("📏 Kartonabmessungen")
length = st.sidebar.number_input("Länge (mm)", min_value=50, max_value=2000, value=400, step=10)
width = st.sidebar.number_input("Breite (mm)", min_value=50, max_value=2000, value=300, step=10)
height = st.sidebar.number_input("Höhe (mm)", min_value=20, max_value=1000, value=200, step=10)

# Materialstärke
st.sidebar.subheader("🔧 Material-Spezifikationen")
material_thickness = st.sidebar.selectbox(
    "Wellpappe-Typ",
    options=[
        ("B-Welle (2.5mm)", 2.5),
        ("C-Welle (3.5mm)", 3.5),
        ("E-Welle (1.5mm)", 1.5),
        ("BC-Welle (6.0mm)", 6.0)
    ],
    format_func=lambda x: x[0],
    index=1
)[1]

# Kostenparameter
st.sidebar.subheader("💰 Kostenparameter")
col1, col2 = st.sidebar.columns(2)
rsc_price_per_1000 = col1.number_input("RSC Preis/1000 (€)", min_value=100.0, max_value=2000.0, value=610.0, step=10.0)
wa_price_per_1000 = col2.number_input("WA Preis/1000 (€)", min_value=100.0, max_value=2000.0, value=555.0, step=10.0)

# Klebekosten RSC
st.sidebar.subheader("🔹 RSC Klebekosten (Tape)")
tape_price_per_roll = st.sidebar.number_input("Preis pro Rolle (€)", min_value=0.5, max_value=20.0, value=2.5, step=0.1)
tape_length_per_roll = st.sidebar.number_input("Meter pro Rolle", min_value=10, max_value=200, value=66, step=1)
tape_pattern = st.sidebar.selectbox("Verschlussmuster", ["H-Muster (empfohlen)", "Einfach"])

# Klebekosten Wrap-Around
st.sidebar.subheader("🔸 Wrap-Around Klebekosten (Hotmelt)")
hotmelt_price_per_kg = st.sidebar.number_input("Preis pro kg (€)", min_value=1.0, max_value=30.0, value=3.0, step=0.5)
hotmelt_bead_width = st.sidebar.selectbox(
    "Raupenbreite",
    options=[
        ("1.5mm (0.50 g/m)", 1.5, 0.50),
        ("3mm (2.0 g/m)", 3.0, 2.0),
        ("5mm (6.67 g/m)", 5.0, 6.67)
    ],
    format_func=lambda x: x[0],
    index=1
)
hotmelt_usage = hotmelt_bead_width[2]  # g/m

# Produktionsvolumen
st.sidebar.subheader("📊 Produktionsvolumen")
production_volume = st.sidebar.selectbox(
    "Auflage",
    options=[1000, 10000, 100000, 1000000],
    format_func=lambda x: f"{x:,}".replace(",", ".")
)

# Berechnungsfunktionen
def calculate_rsc_blank_dimensions(L, B, H, t):
    """
    Berechnet die RSC-Zuschnittmaße
    L = Länge (innen), B = Breite (innen), H = Höhe
    t = Materialstärke
    """
    manufacturer_flap = 25  # mm
    trim_allowance = 20  # mm

    # Bogenlänge = 2L + 2B + 4t + Klebelasche + Verschnitt
    blank_length = 2 * L + 2 * B + 4 * t + manufacturer_flap + trim_allowance

    # Bogenbreite = B + 2H + 4t + Verschnitt
    blank_width = B + 2 * H + 4 * t + trim_allowance

    # Fläche in m²
    area_m2 = (blank_length / 1000) * (blank_width / 1000)

    return {
        'blank_length': blank_length,
        'blank_width': blank_width,
        'area_m2': area_m2
    }

def calculate_wraparound_blank_dimensions(L, B, H, t):
    """
    Berechnet die Wrap-Around-Zuschnittmaße
    """
    overlap = 75  # mm Standard-Überlappung

    # Bogenlänge = 2L + 2B + Überlappung
    blank_length = 2 * L + 2 * B + overlap

    # Bogenbreite = B + 2H
    blank_width = B + 2 * H

    # Fläche in m²
    area_m2 = (blank_length / 1000) * (blank_width / 1000)

    return {
        'blank_length': blank_length,
        'blank_width': blank_width,
        'area_m2': area_m2
    }

def calculate_tape_cost_rsc(L, B, H, tape_price, tape_length_roll, pattern):
    """
    Berechnet Klebeband-Kosten für RSC
    """
    if pattern == "H-Muster (empfohlen)":
        # H-Muster: L + 2B + Überstand pro Seite
        tape_per_box = (L + 2 * B + 150) / 1000  # in Meter
        tape_per_box *= 2  # Oben und unten
    else:
        # Einfaches Muster
        tape_per_box = (B + 100) / 1000  # in Meter
        tape_per_box *= 2  # Oben und unten

    cost_per_meter = tape_price / tape_length_roll
    cost_per_box = tape_per_box * cost_per_meter

    return {
        'tape_length_m': tape_per_box,
        'cost_per_box': cost_per_box
    }

def calculate_hotmelt_cost_wa(L, B, H, hotmelt_price_kg, hotmelt_usage_g_per_m):
    """
    Berechnet Hotmelt-Kosten für Wrap-Around
    3 Klebestellen: beide Enden + Längsnaht
    """
    # Längsnaht entlang der Höhe
    seam_length_1 = H / 1000  # m

    # Beide Enden
    seam_length_2 = (2 * (L + B)) / 1000  # m

    total_seam_length = seam_length_1 + seam_length_2

    # Hotmelt-Verbrauch in kg
    hotmelt_kg = (total_seam_length * hotmelt_usage_g_per_m) / 1000

    cost_per_box = hotmelt_kg * hotmelt_price_kg

    return {
        'seam_length_m': total_seam_length,
        'hotmelt_kg': hotmelt_kg,
        'cost_per_box': cost_per_box
    }

def calculate_hotmelt_cost_rsc(L, B, H, hotmelt_price_kg, hotmelt_usage_g_per_m):
    """
    Berechnet Hotmelt-Kosten für RSC (alternative zu Tape)
    Herstellernaht + Klappenverschluss
    """
    # Herstellernaht
    manufacturer_seam = H / 1000  # m

    # Klappenverschluss (H-Muster)
    flap_seams = 2 * (B + B) / 1000  # m (oben und unten)

    total_seam_length = manufacturer_seam + flap_seams

    # Hotmelt-Verbrauch in kg
    hotmelt_kg = (total_seam_length * hotmelt_usage_g_per_m) / 1000

    cost_per_box = hotmelt_kg * hotmelt_price_kg

    return {
        'seam_length_m': total_seam_length,
        'hotmelt_kg': hotmelt_kg,
        'cost_per_box': cost_per_box
    }

# Berechnungen durchführen
rsc_blank = calculate_rsc_blank_dimensions(length, width, height, material_thickness)
wa_blank = calculate_wraparound_blank_dimensions(length, width, height, material_thickness)

rsc_tape_cost = calculate_tape_cost_rsc(length, width, height, tape_price_per_roll, tape_length_per_roll, tape_pattern)
rsc_hotmelt_cost = calculate_hotmelt_cost_rsc(length, width, height, hotmelt_price_per_kg, hotmelt_usage)
wa_hotmelt_cost = calculate_hotmelt_cost_wa(length, width, height, hotmelt_price_per_kg, hotmelt_usage)

# Materialkosten pro Box
rsc_material_cost = rsc_price_per_1000 / 1000
wa_material_cost = wa_price_per_1000 / 1000

# Gesamtkosten pro Box (RSC mit Tape)
rsc_total_cost_tape = rsc_material_cost + rsc_tape_cost['cost_per_box']
# Gesamtkosten pro Box (RSC mit Hotmelt)
rsc_total_cost_hotmelt = rsc_material_cost + rsc_hotmelt_cost['cost_per_box']
# Gesamtkosten pro Box (Wrap-Around mit Hotmelt)
wa_total_cost = wa_material_cost + wa_hotmelt_cost['cost_per_box']

# Hauptbereich mit Tabs
tab1, tab2, tab3, tab4 = st.tabs(["📊 Kostenvergleich", "📐 Technische Details", "📈 Visualisierung", "💾 Export"])

with tab1:
    st.header("Kostenvergleich")

    # Zwei Spalten für RSC und Wrap-Around
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("🔹 RSC-Karton (FEFCO 0201)")
        st.metric("Zuschnittsläche", f"{rsc_blank['area_m2']:.4f} m²")
        st.metric("Materialkosten/Box", f"{rsc_material_cost:.4f} €")
        st.metric("Klebekosten/Box (Tape)", f"{rsc_tape_cost['cost_per_box']:.4f} €")
        st.metric("Gesamtkosten/Box (Tape)", f"{rsc_total_cost_tape:.4f} €")

    with col2:
        st.subheader("🔸 Wrap-Around (FEFCO 0409)")
        st.metric("Zuschnittsläche", f"{wa_blank['area_m2']:.4f} m²")
        st.metric("Materialkosten/Box", f"{wa_material_cost:.4f} €")
        st.metric("Klebekosten/Box (Hotmelt)", f"{wa_hotmelt_cost['cost_per_box']:.4f} €")
        st.metric("Gesamtkosten/Box", f"{wa_total_cost:.4f} €")

    st.divider()

    # Einsparungen
    st.header("💰 Einsparungen")

    # Flächenersparnis
    area_savings_pct = ((rsc_blank['area_m2'] - wa_blank['area_m2']) / rsc_blank['area_m2']) * 100
    cost_diff_per_box = rsc_total_cost_tape - wa_total_cost
    cost_diff_pct = (cost_diff_per_box / rsc_total_cost_tape) * 100

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Flächenersparnis", f"{area_savings_pct:.2f} %",
                  delta=f"{(rsc_blank['area_m2'] - wa_blank['area_m2'])*1000:.1f} cm²")
    with col2:
        st.metric("Kostenersparnis/Box", f"{cost_diff_per_box:.4f} €",
                  delta=f"{cost_diff_pct:.2f} %")
    with col3:
        st.metric(f"Ersparnis bei {production_volume:,} Stück".replace(",", "."),
                  f"{cost_diff_per_box * production_volume:.2f} €")

    # Detaillierte Vergleichstabelle
    st.subheader("📋 Detaillierter Vergleich")

    comparison_data = {
        'Parameter': [
            'Materialkosten/1000',
            'Materialkosten/Box',
            'Zuschnittsläche',
            'Klebekosten/Box',
            'Gesamtkosten/Box',
            f'Gesamtkosten/{production_volume:,}'.replace(",", ".")
        ],
        'Einheit': ['€', '€', 'm²', '€', '€', '€'],
        'RSC': [
            f"{rsc_price_per_1000:.2f}",
            f"{rsc_material_cost:.4f}",
            f"{rsc_blank['area_m2']:.4f}",
            f"{rsc_tape_cost['cost_per_box']:.4f}",
            f"{rsc_total_cost_tape:.4f}",
            f"{rsc_total_cost_tape * production_volume:.2f}"
        ],
        'Wrap-Around': [
            f"{wa_price_per_1000:.2f}",
            f"{wa_material_cost:.4f}",
            f"{wa_blank['area_m2']:.4f}",
            f"{wa_hotmelt_cost['cost_per_box']:.4f}",
            f"{wa_total_cost:.4f}",
            f"{wa_total_cost * production_volume:.2f}"
        ],
        'Differenz €': [
            f"{rsc_price_per_1000 - wa_price_per_1000:.2f}",
            f"{rsc_material_cost - wa_material_cost:.4f}",
            f"{(rsc_blank['area_m2'] - wa_blank['area_m2'])*10000:.2f} cm²",
            f"{rsc_tape_cost['cost_per_box'] - wa_hotmelt_cost['cost_per_box']:.4f}",
            f"{cost_diff_per_box:.4f}",
            f"{cost_diff_per_box * production_volume:.2f}"
        ],
        'Differenz %': [
            f"{((rsc_price_per_1000 - wa_price_per_1000) / rsc_price_per_1000 * 100):.1f}%",
            f"{((rsc_material_cost - wa_material_cost) / rsc_material_cost * 100):.1f}%",
            f"{area_savings_pct:.2f}%",
            f"{((rsc_tape_cost['cost_per_box'] - wa_hotmelt_cost['cost_per_box']) / rsc_tape_cost['cost_per_box'] * 100):.1f}%",
            f"{cost_diff_pct:.2f}%",
            f"{cost_diff_pct:.2f}%"
        ]
    }

    df_comparison = pd.DataFrame(comparison_data)
    st.dataframe(df_comparison, use_container_width=True, hide_index=True)

    # Hochrechnung verschiedener Volumina
    st.subheader("📊 Hochrechnung bei verschiedenen Produktionsvolumina")

    volumes = [1000, 10000, 100000, 1000000]
    volume_data = {
        'Volumen': [f"{v:,}".replace(",", ".") for v in volumes],
        'RSC Gesamtkosten (€)': [f"{rsc_total_cost_tape * v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") for v in volumes],
        'WA Gesamtkosten (€)': [f"{wa_total_cost * v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") for v in volumes],
        'Ersparnis (€)': [f"{cost_diff_per_box * v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".") for v in volumes],
        'Ersparnis (%)': [f"{cost_diff_pct:.2f}%" for _ in volumes]
    }

    df_volumes = pd.DataFrame(volume_data)
    st.dataframe(df_volumes, use_container_width=True, hide_index=True)

with tab2:
    st.header("Technische Details")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("🔹 RSC-Karton (FEFCO 0201)")
        st.write("**Zuschnittmaße:**")
        st.write(f"- Bogenlänge: {rsc_blank['blank_length']:.1f} mm")
        st.write(f"- Bogenbreite: {rsc_blank['blank_width']:.1f} mm")
        st.write(f"- Zuschnittsläche: {rsc_blank['area_m2']:.4f} m²")

        st.write("\n**Berechnungsformel:**")
        st.code(f"""
Bogenlänge = 2L + 2B + 4t + 25mm + 20mm
           = 2×{length} + 2×{width} + 4×{material_thickness} + 45
           = {rsc_blank['blank_length']:.1f} mm

Bogenbreite = B + 2H + 4t + 20mm
            = {width} + 2×{height} + 4×{material_thickness} + 20
            = {rsc_blank['blank_width']:.1f} mm
        """)

        st.write("\n**Klebedetails (Tape):**")
        st.write(f"- Bandlänge pro Box: {rsc_tape_cost['tape_length_m']:.3f} m")
        st.write(f"- Kosten pro Meter: {tape_price_per_roll/tape_length_per_roll:.4f} €/m")
        st.write(f"- Verschlussmuster: {tape_pattern}")

        st.write("\n**Alternative: Hotmelt statt Tape:**")
        st.write(f"- Nahtstrecke: {rsc_hotmelt_cost['seam_length_m']:.3f} m")
        st.write(f"- Verbrauch: {rsc_hotmelt_cost['hotmelt_kg']*1000:.2f} g")
        st.write(f"- Kosten: {rsc_hotmelt_cost['cost_per_box']:.4f} €/Box")
        st.info(f"💡 Ersparnis mit Hotmelt: {(rsc_tape_cost['cost_per_box'] - rsc_hotmelt_cost['cost_per_box']):.4f} €/Box")

    with col2:
        st.subheader("🔸 Wrap-Around (FEFCO 0409)")
        st.write("**Zuschnittmaße:**")
        st.write(f"- Bogenlänge: {wa_blank['blank_length']:.1f} mm")
        st.write(f"- Bogenbreite: {wa_blank['blank_width']:.1f} mm")
        st.write(f"- Zuschnittsläche: {wa_blank['area_m2']:.4f} m²")

        st.write("\n**Berechnungsformel:**")
        st.code(f"""
Bogenlänge = 2L + 2B + Überlappung
           = 2×{length} + 2×{width} + 75
           = {wa_blank['blank_length']:.1f} mm

Bogenbreite = B + 2H
            = {width} + 2×{height}
            = {wa_blank['blank_width']:.1f} mm
        """)

        st.write("\n**Klebedetails (Hotmelt):**")
        st.write(f"- Nahtstrecke gesamt: {wa_hotmelt_cost['seam_length_m']:.3f} m")
        st.write(f"  • Längsnaht: {height/1000:.3f} m")
        st.write(f"  • Beide Enden: {2*(length+width)/1000:.3f} m")
        st.write(f"- Verbrauch: {wa_hotmelt_cost['hotmelt_kg']*1000:.2f} g")
        st.write(f"- Raupenbreite: {hotmelt_bead_width[0]}")

    st.divider()

    # Material-Effizienz
    st.subheader("📊 Material-Effizienz")

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Flächenersparnis",
                  f"{area_savings_pct:.2f} %",
                  help="Wrap-Around benötigt weniger Material")
    with col2:
        # Logistik-Vorteil (komplett flach vs. einfach gefaltet)
        pallet_efficiency = 40  # typisch 40% mehr Zuschnitte pro Palette
        st.metric("Paletten-Effizienz",
                  f"+{pallet_efficiency} %",
                  help="Mehr Zuschnitte pro Palette bei Wrap-Around")
    with col3:
        # Magazin-Kapazität
        st.metric("Magazin-Kapazität",
                  "≈ 2×",
                  help="Doppelte Kapazität bei Wrap-Around-Maschinen")

    st.info("""
    **Zusätzliche Vorteile von Wrap-Around:**
    - 20-60% mehr Zuschnitte pro Palette (komplett flach)
    - 10-30% niedrigere Transportkosten für Rohkartonage
    - 50% weniger Lagerraum beim Verpackungsbetrieb
    - Keine Vorklebung nötig (weitere Kostenersparnis)
    - Enganliegende Verpackung minimiert Füllmaterial
    """)

with tab3:
    st.header("Visualisierung")

    # Kostenvergleich Balkendiagramm
    st.subheader("Kostenvergleich pro Box")

    fig_cost = go.Figure(data=[
        go.Bar(name='Materialkosten', x=['RSC', 'Wrap-Around'],
               y=[rsc_material_cost, wa_material_cost],
               marker_color='lightblue'),
        go.Bar(name='Klebekosten', x=['RSC', 'Wrap-Around'],
               y=[rsc_tape_cost['cost_per_box'], wa_hotmelt_cost['cost_per_box']],
               marker_color='lightcoral')
    ])

    fig_cost.update_layout(
        barmode='stack',
        title='Kostenaufschlüsselung pro Box',
        xaxis_title='Karton-Typ',
        yaxis_title='Kosten (€)',
        height=400
    )

    st.plotly_chart(fig_cost, use_container_width=True)

    # Einsparungen bei verschiedenen Volumina
    st.subheader("Kumulierte Ersparnis nach Produktionsvolumen")

    volumes_chart = list(range(0, production_volume + 1, max(1, production_volume // 10)))
    savings_chart = [cost_diff_per_box * v for v in volumes_chart]

    fig_savings = go.Figure()
    fig_savings.add_trace(go.Scatter(
        x=volumes_chart,
        y=savings_chart,
        mode='lines',
        fill='tozeroy',
        name='Ersparnis',
        line=dict(color='green', width=3)
    ))

    fig_savings.update_layout(
        title=f'Kumulierte Ersparnis bis {production_volume:,} Kartons'.replace(",", "."),
        xaxis_title='Anzahl Kartons',
        yaxis_title='Ersparnis (€)',
        height=400
    )

    st.plotly_chart(fig_savings, use_container_width=True)

    # Flächenvergleich
    st.subheader("Flächenvergleich der Zuschnitte")

    fig_area = go.Figure(data=[
        go.Bar(
            x=['RSC', 'Wrap-Around'],
            y=[rsc_blank['area_m2'], wa_blank['area_m2']],
            marker_color=['#FF6B6B', '#4ECDC4'],
            text=[f"{rsc_blank['area_m2']:.4f} m²", f"{wa_blank['area_m2']:.4f} m²"],
            textposition='auto',
        )
    ])

    fig_area.update_layout(
        title='Zuschnittsläche im Vergleich',
        xaxis_title='Karton-Typ',
        yaxis_title='Fläche (m²)',
        height=400
    )

    st.plotly_chart(fig_area, use_container_width=True)

    # Kosten-Breakdown Pie Chart
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("RSC Kostenverteilung")
        fig_pie_rsc = go.Figure(data=[go.Pie(
            labels=['Material', 'Klebeband'],
            values=[rsc_material_cost, rsc_tape_cost['cost_per_box']],
            hole=.3
        )])
        fig_pie_rsc.update_layout(height=300)
        st.plotly_chart(fig_pie_rsc, use_container_width=True)

    with col2:
        st.subheader("Wrap-Around Kostenverteilung")
        fig_pie_wa = go.Figure(data=[go.Pie(
            labels=['Material', 'Hotmelt'],
            values=[wa_material_cost, wa_hotmelt_cost['cost_per_box']],
            hole=.3
        )])
        fig_pie_wa.update_layout(height=300)
        st.plotly_chart(fig_pie_wa, use_container_width=True)

with tab4:
    st.header("Export")

    st.write("Exportieren Sie die Berechnungsergebnisse als Excel-Datei oder PDF-Report.")

    # Excel Export vorbereiten
    def create_excel_export():
        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            # Übersicht
            df_overview = pd.DataFrame({
                'Parameter': ['Länge (mm)', 'Breite (mm)', 'Höhe (mm)', 'Materialstärke (mm)',
                             'RSC Preis/1000 (€)', 'WA Preis/1000 (€)', 'Produktionsvolumen'],
                'Wert': [length, width, height, material_thickness,
                        rsc_price_per_1000, wa_price_per_1000, production_volume]
            })
            df_overview.to_excel(writer, sheet_name='Parameter', index=False)

            # Vergleichstabelle
            df_comparison.to_excel(writer, sheet_name='Kostenvergleich', index=False)

            # Volumenhochrechnung
            df_volumes.to_excel(writer, sheet_name='Volumenhochrechnung', index=False)

            # Technische Details
            tech_data = {
                'Parameter': [
                    'RSC Bogenlänge (mm)', 'RSC Bogenbreite (mm)', 'RSC Fläche (m²)',
                    'RSC Tape-Länge (m)', 'RSC Hotmelt Nahtlänge (m)',
                    'WA Bogenlänge (mm)', 'WA Bogenbreite (mm)', 'WA Fläche (m²)',
                    'WA Hotmelt Nahtlänge (m)', 'Flächenersparnis (%)'
                ],
                'Wert': [
                    rsc_blank['blank_length'], rsc_blank['blank_width'], rsc_blank['area_m2'],
                    rsc_tape_cost['tape_length_m'], rsc_hotmelt_cost['seam_length_m'],
                    wa_blank['blank_length'], wa_blank['blank_width'], wa_blank['area_m2'],
                    wa_hotmelt_cost['seam_length_m'], area_savings_pct
                ]
            }
            df_tech = pd.DataFrame(tech_data)
            df_tech.to_excel(writer, sheet_name='Technische Details', index=False)

        return output.getvalue()

    excel_data = create_excel_export()

    col1, col2 = st.columns(2)

    with col1:
        st.download_button(
            label="📥 Excel-Datei herunterladen",
            data=excel_data,
            file_name=f"karton_kostenvergleich_{length}x{width}x{height}.xlsx",
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    with col2:
        # CSV Export als Alternative
        csv_data = df_comparison.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="📥 CSV-Datei herunterladen",
            data=csv_data,
            file_name=f"karton_kostenvergleich_{length}x{width}x{height}.csv",
            mime="text/csv"
        )

    st.divider()

    # Zusammenfassung für Report
    st.subheader("📄 Zusammenfassung")

    summary = f"""
    # Karton-Kostenvergleich Report

    ## Eingabeparameter
    - **Abmessungen**: {length} × {width} × {height} mm
    - **Material**: {[t for t in [("B-Welle (2.5mm)", 2.5), ("C-Welle (3.5mm)", 3.5), ("E-Welle (1.5mm)", 1.5), ("BC-Welle (6.0mm)", 6.0)] if t[1] == material_thickness][0][0]}
    - **Produktionsvolumen**: {production_volume:,} Stück

    ## Ergebnisse

    ### RSC-Karton (FEFCO 0201)
    - Zuschnittsläche: {rsc_blank['area_m2']:.4f} m²
    - Materialkosten: {rsc_material_cost:.4f} €/Box
    - Klebekosten (Tape): {rsc_tape_cost['cost_per_box']:.4f} €/Box
    - **Gesamtkosten: {rsc_total_cost_tape:.4f} €/Box**

    ### Wrap-Around-Karton (FEFCO 0409)
    - Zuschnittsläche: {wa_blank['area_m2']:.4f} m²
    - Materialkosten: {wa_material_cost:.4f} €/Box
    - Klebekosten (Hotmelt): {wa_hotmelt_cost['cost_per_box']:.4f} €/Box
    - **Gesamtkosten: {wa_total_cost:.4f} €/Box**

    ## Einsparungen durch Wrap-Around
    - **Flächenersparnis**: {area_savings_pct:.2f}%
    - **Kostenersparnis pro Box**: {cost_diff_per_box:.4f} € ({cost_diff_pct:.2f}%)
    - **Gesamtersparnis bei {production_volume:,} Stück**: {cost_diff_per_box * production_volume:.2f} €

    ## Empfehlung
    {"✅ Wrap-Around ist wirtschaftlicher für diese Anwendung!" if cost_diff_per_box > 0 else "⚠️ RSC ist in diesem Fall günstiger."}

    ---
    *Erstellt mit Karton-Kostenrechner*
    """

    st.markdown(summary)

    # Text-Report Download
    st.download_button(
        label="📥 Text-Report herunterladen",
        data=summary.encode('utf-8'),
        file_name=f"report_{length}x{width}x{height}.md",
        mime="text/markdown"
    )

# Footer
st.divider()
st.markdown("""
<div style='text-align: center; color: gray; font-size: 0.9em;'>
    <p>📦 Karton-Kostenrechner | Basierend auf FEFCO-Standards</p>
    <p>RSC = Regular Slotted Container (FEFCO 0201) | Wrap-Around = Five Panel Folder (FEFCO 0409)</p>
</div>
""", unsafe_allow_html=True)
