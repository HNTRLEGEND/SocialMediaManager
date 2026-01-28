#!/usr/bin/env python3
"""
Test-Skript fuer den erweiterten Karton-Kostenrechner.
Validiert Zuschnitt-, Klebe-, TCO- und Nachhaltigkeitsberechnungen.
"""

import sys
import math

# ---------------------------------------------------------------------------
# Berechnungsfunktionen (identisch mit app.py)
# ---------------------------------------------------------------------------

def calc_rsc_blank(L, B, H, t, mfg_flap_mm=25.0, trim_mm=20.0, score_allow=2.0):
    blank_length = 2 * L + 2 * B + 4 * t + mfg_flap_mm + trim_mm + 4 * score_allow
    flap_top = max(L, B) / 2.0
    flap_bottom = max(L, B) / 2.0
    blank_width = flap_bottom + H + B + H + flap_top + 4 * t + trim_mm + 2 * score_allow
    area_mm2 = blank_length * blank_width
    return {
        "blank_length_mm": blank_length,
        "blank_width_mm": blank_width,
        "area_m2": area_mm2 / 1e6,
        "area_mm2": area_mm2,
        "flap_height_mm": flap_top,
        "mfg_flap_mm": mfg_flap_mm,
    }


def calc_wa_blank(L, B, H, t, overlap_mm=35.0, score_allow=2.0):
    blank_length = 2 * L + 2 * B + overlap_mm + 4 * score_allow
    blank_width = B + 2 * H
    area_mm2 = blank_length * blank_width
    return {
        "blank_length_mm": blank_length,
        "blank_width_mm": blank_width,
        "area_m2": area_mm2 / 1e6,
        "area_mm2": area_mm2,
        "overlap_mm": overlap_mm,
    }


def calc_tape_cost(L, B, H, tape_price_roll, tape_length_roll_m, pattern):
    if pattern == "H-Muster":
        tape_m = ((L + 2 * B + 150) / 1000) * 2
    else:
        tape_m = ((B + 100) / 1000) * 2
    cost_per_m = tape_price_roll / tape_length_roll_m
    return {"tape_m": tape_m, "cost_per_box": tape_m * cost_per_m}


def calc_hotmelt_cost(seam_length_m, hm_price_kg, hm_g_per_m):
    kg = seam_length_m * hm_g_per_m / 1000
    return {"seam_m": seam_length_m, "kg": kg, "cost_per_box": kg * hm_price_kg}


def calc_rsc_seam_length(L, B, H):
    return H / 1000 + 2 * (2 * B) / 1000


def calc_wa_seam_length(L, B, H):
    return H / 1000 + 2 * (L + B) / 1000


def calc_tco(
    carton_cost_per_box, production_volume, machine_invest, machine_life_years,
    energy_kw, energy_price_kwh, operating_hours_year,
    operators, operator_cost_hour, maintenance_pct_invest,
    spare_parts_year,
):
    dep = machine_invest / machine_life_years if machine_life_years > 0 else 0
    energy = energy_kw * operating_hours_year * energy_price_kwh
    personnel = operators * operator_cost_hour * operating_hours_year
    maint = machine_invest * maintenance_pct_invest / 100
    material = carton_cost_per_box * production_volume
    total = dep + energy + personnel + maint + material + spare_parts_year
    per_box = total / production_volume if production_volume > 0 else 0
    return {"total": total, "per_box": per_box, "depreciation": dep,
            "energy": energy, "personnel": personnel, "maintenance": maint,
            "material": material, "spares": spare_parts_year}


def calc_sustainability(area_m2, weight_gsm, production_volume, transport_km, pallet_factor):
    weight_kg = area_m2 * weight_gsm / 1000
    total_t = weight_kg * production_volume / 1000
    co2_mat = total_t * 0.7
    co2_trans = total_t * transport_km * 0.062 / 1000
    co2_trans_adj = co2_trans / pallet_factor if pallet_factor > 0 else co2_trans
    return {"weight_kg_per_box": weight_kg, "total_weight_t": total_t,
            "co2_material_kg": co2_mat, "co2_transport_kg": co2_trans_adj,
            "co2_total_kg": co2_mat + co2_trans_adj}


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------
def approx(a, b, tol=0.01):
    return abs(a - b) < tol


def test_rsc_blank():
    r = calc_rsc_blank(400, 300, 200, 3.5, score_allow=2.0)
    # Bogenlänge: 2*400+2*300+4*3.5+25+20+4*2 = 800+600+14+25+20+8 = 1467
    assert approx(r["blank_length_mm"], 1467.0), f"RSC length: {r['blank_length_mm']}"
    # Bogenbreite: 200+200+300+200+200 + 4*3.5+20+2*2 = 1100+14+20+4 = 1138
    assert approx(r["blank_width_mm"], 1138.0), f"RSC width: {r['blank_width_mm']}"
    assert r["flap_height_mm"] == 200.0
    print(f"  RSC blank: {r['blank_length_mm']:.1f} x {r['blank_width_mm']:.1f} mm "
          f"= {r['area_m2']:.4f} m2  OK")


def test_wa_blank():
    w = calc_wa_blank(400, 300, 200, 3.5, overlap_mm=35.0, score_allow=2.0)
    # Bogenlänge: 2*400+2*300+35+4*2 = 800+600+35+8 = 1443
    assert approx(w["blank_length_mm"], 1443.0), f"WA length: {w['blank_length_mm']}"
    # Bogenbreite: 300+2*200 = 700
    assert approx(w["blank_width_mm"], 700.0), f"WA width: {w['blank_width_mm']}"
    print(f"  WA blank:  {w['blank_length_mm']:.1f} x {w['blank_width_mm']:.1f} mm "
          f"= {w['area_m2']:.4f} m2  OK")


def test_area_savings():
    r = calc_rsc_blank(400, 300, 200, 3.5)
    w = calc_wa_blank(400, 300, 200, 3.5, overlap_mm=35.0)
    pct = (r["area_m2"] - w["area_m2"]) / r["area_m2"] * 100
    assert pct > 0, "WA should use less material than RSC for standard dims"
    print(f"  Area savings: {pct:.2f}%  OK (WA smaller)")


def test_tape_cost():
    tc = calc_tape_cost(400, 300, 200, 2.50, 66, "H-Muster")
    assert tc["tape_m"] > 0
    assert tc["cost_per_box"] > 0
    # H-Muster: (400+600+150)/1000*2 = 2.3m
    assert approx(tc["tape_m"], 2.3, 0.01), f"Tape length: {tc['tape_m']}"
    print(f"  Tape cost: {tc['cost_per_box']:.4f} EUR/box  OK")


def test_hotmelt_cost():
    seam = calc_wa_seam_length(400, 300, 200)
    # 0.2 + 2*(0.4+0.3) = 0.2+1.4 = 1.6
    assert approx(seam, 1.6, 0.01), f"WA seam: {seam}"
    hm = calc_hotmelt_cost(seam, 3.0, 2.0)
    assert hm["cost_per_box"] > 0
    print(f"  WA hotmelt: {hm['cost_per_box']:.4f} EUR/box (seam={seam:.3f}m)  OK")


def test_tco():
    tco = calc_tco(0.60, 500_000, 450_000, 10, 15, 0.25, 4000, 0.5, 40, 3.0, 5000)
    assert tco["total"] > 0
    assert tco["per_box"] > 0
    assert tco["depreciation"] == 45000.0
    assert tco["energy"] == 15000.0
    print(f"  TCO: {tco['total']:,.0f} EUR/year, {tco['per_box']:.4f} EUR/box  OK")


def test_sustainability():
    s = calc_sustainability(0.5, 550, 100_000, 200, 1.0)
    assert s["weight_kg_per_box"] > 0
    assert s["co2_total_kg"] > 0
    print(f"  Sustainability: {s['co2_total_kg']:.0f} kg CO2  OK")


def test_rsc_seam():
    seam = calc_rsc_seam_length(400, 300, 200)
    # H/1000 + 2*(2*B)/1000 = 0.2 + 2*0.6 = 1.4
    assert approx(seam, 1.4, 0.01), f"RSC seam: {seam}"
    print(f"  RSC seam: {seam:.3f} m  OK")


# ---------------------------------------------------------------------------
# Runner
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print("=" * 60)
    print("KARTON-KOSTENRECHNER – ERWEITERTE BERECHNUNGSTESTS")
    print("=" * 60)

    tests = [
        ("RSC Zuschnitt", test_rsc_blank),
        ("WA Zuschnitt", test_wa_blank),
        ("Flaechenersparnis", test_area_savings),
        ("Tape-Kosten", test_tape_cost),
        ("Hotmelt-Kosten", test_hotmelt_cost),
        ("RSC Nahtlaenge", test_rsc_seam),
        ("TCO-Berechnung", test_tco),
        ("Nachhaltigkeit", test_sustainability),
    ]

    passed = 0
    failed = 0
    for name, fn in tests:
        try:
            print(f"\n[TEST] {name}")
            fn()
            passed += 1
        except Exception as e:
            print(f"  FAILED: {e}")
            failed += 1

    print(f"\n{'=' * 60}")
    print(f"ERGEBNIS: {passed}/{passed + failed} Tests bestanden")
    if failed:
        print(f"  {failed} Tests fehlgeschlagen!")
        sys.exit(1)
    else:
        print("  ALLE TESTS ERFOLGREICH")
    print("=" * 60)
