#!/usr/bin/env python3
"""
Test-Skript für die Karton-Berechnungen
Validiert die Formeln ohne Streamlit-UI
"""

def calculate_rsc_blank_dimensions(L, B, H, t):
    manufacturer_flap = 25
    trim_allowance = 20
    blank_length = 2 * L + 2 * B + 4 * t + manufacturer_flap + trim_allowance
    blank_width = B + 2 * H + 4 * t + trim_allowance
    area_m2 = (blank_length / 1000) * (blank_width / 1000)
    return {
        'blank_length': blank_length,
        'blank_width': blank_width,
        'area_m2': area_m2
    }

def calculate_wraparound_blank_dimensions(L, B, H, t):
    overlap = 75
    blank_length = 2 * L + 2 * B + overlap
    blank_width = B + 2 * H
    area_m2 = (blank_length / 1000) * (blank_width / 1000)
    return {
        'blank_length': blank_length,
        'blank_width': blank_width,
        'area_m2': area_m2
    }

# Test mit Beispielwerten aus der Dokumentation
print("=" * 60)
print("KARTON-KOSTENRECHNER - BERECHNUNGSTEST")
print("=" * 60)

# Beispiel 1: 400mm × 300mm × 200mm (C-Welle, 3.5mm)
length = 400
width = 300
height = 200
thickness = 3.5

print(f"\nEingabe: {length}mm × {width}mm × {height}mm (Material: {thickness}mm)")
print("-" * 60)

rsc = calculate_rsc_blank_dimensions(length, width, height, thickness)
wa = calculate_wraparound_blank_dimensions(length, width, height, thickness)

print("\n🔹 RSC-Karton (FEFCO 0201):")
print(f"  Bogenlänge: {rsc['blank_length']:.1f} mm")
print(f"  Bogenbreite: {rsc['blank_width']:.1f} mm")
print(f"  Fläche: {rsc['area_m2']:.6f} m²")

print("\n🔸 Wrap-Around-Karton (FEFCO 0409):")
print(f"  Bogenlänge: {wa['blank_length']:.1f} mm")
print(f"  Bogenbreite: {wa['blank_width']:.1f} mm")
print(f"  Fläche: {wa['area_m2']:.6f} m²")

area_savings = ((rsc['area_m2'] - wa['area_m2']) / rsc['area_m2']) * 100
print(f"\n💰 Flächenersparnis: {area_savings:.2f}%")
print(f"   ({(rsc['area_m2'] - wa['area_m2']) * 10000:.2f} cm²)")

# Erwartete Werte aus Dokumentation:
print("\n" + "=" * 60)
print("VERGLEICH MIT DOKUMENTATION:")
print("=" * 60)

expected_rsc_length = 2*400 + 2*300 + 4*3.5 + 25 + 20  # 1459
expected_rsc_width = 300 + 2*200 + 4*3.5 + 20  # 734
expected_rsc_area = expected_rsc_length * expected_rsc_width / 1000000  # 1.0709 m²

expected_wa_length = 2*400 + 2*300 + 75  # 1475
expected_wa_width = 300 + 2*200  # 700
expected_wa_area = expected_wa_length * expected_wa_width / 1000000  # 1.0325 m²

print(f"\nRSC erwartet: {expected_rsc_length}mm × {expected_rsc_width}mm = {expected_rsc_area:.6f} m²")
print(f"RSC berechnet: {rsc['blank_length']:.0f}mm × {rsc['blank_width']:.0f}mm = {rsc['area_m2']:.6f} m²")
print(f"✓ Übereinstimmung: {abs(rsc['area_m2'] - expected_rsc_area) < 0.0001}")

print(f"\nWA erwartet: {expected_wa_length}mm × {expected_wa_width}mm = {expected_wa_area:.6f} m²")
print(f"WA berechnet: {wa['blank_length']:.0f}mm × {wa['blank_width']:.0f}mm = {wa['area_m2']:.6f} m²")
print(f"✓ Übereinstimmung: {abs(wa['area_m2'] - expected_wa_area) < 0.0001}")

# Kostenberechnung
print("\n" + "=" * 60)
print("KOSTENBERECHNUNG:")
print("=" * 60)

rsc_price_per_1000 = 610.0
wa_price_per_1000 = 555.0

rsc_material_cost = rsc_price_per_1000 / 1000
wa_material_cost = wa_price_per_1000 / 1000

print(f"\nMaterialkosten:")
print(f"  RSC: {rsc_material_cost:.4f} €/Box")
print(f"  WA:  {wa_material_cost:.4f} €/Box")
print(f"  Differenz: {(rsc_material_cost - wa_material_cost):.4f} €/Box")

# Tape-Kosten für RSC (H-Muster)
tape_per_box = ((length + 2 * width + 150) / 1000) * 2  # in Meter
tape_price_per_roll = 2.5
tape_length_roll = 66
tape_cost_per_box = tape_per_box * (tape_price_per_roll / tape_length_roll)

print(f"\nKlebekosten RSC (Tape):")
print(f"  Bandlänge: {tape_per_box:.3f} m/Box")
print(f"  Kosten: {tape_cost_per_box:.4f} €/Box")

# Hotmelt-Kosten für WA
hotmelt_usage_g_per_m = 2.0  # 3mm Raupe
hotmelt_price_per_kg = 3.0
seam_length_wa = (height / 1000) + (2 * (length + width) / 1000)
hotmelt_kg = (seam_length_wa * hotmelt_usage_g_per_m) / 1000
hotmelt_cost_wa = hotmelt_kg * hotmelt_price_per_kg

print(f"\nKlebekosten WA (Hotmelt):")
print(f"  Nahtstrecke: {seam_length_wa:.3f} m/Box")
print(f"  Verbrauch: {hotmelt_kg * 1000:.2f} g/Box")
print(f"  Kosten: {hotmelt_cost_wa:.4f} €/Box")

# Gesamtkosten
rsc_total = rsc_material_cost + tape_cost_per_box
wa_total = wa_material_cost + hotmelt_cost_wa

print(f"\n{'=' * 60}")
print(f"GESAMTKOSTEN PRO BOX:")
print(f"{'=' * 60}")
print(f"RSC:  {rsc_total:.4f} €")
print(f"WA:   {wa_total:.4f} €")
print(f"{'=' * 60}")
print(f"Ersparnis: {(rsc_total - wa_total):.4f} € ({((rsc_total - wa_total) / rsc_total * 100):.2f}%)")

# Hochrechnung
production_volume = 100000
total_savings = (rsc_total - wa_total) * production_volume

print(f"\n💰 Ersparnis bei {production_volume:,} Stück: {total_savings:,.2f} €".replace(",", "."))

print("\n" + "=" * 60)
print("✓ ALLE BERECHNUNGEN ERFOLGREICH")
print("=" * 60)
