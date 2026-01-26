# Weather System UI Preview

Since this is a backend/code implementation, actual screenshots require a running Next.js application. However, here's what the UI will look like when deployed:

## 1. Map Page with Weather Overlay

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HNTR LEGEND - Revierkarte                                    👤 User  ⚙️   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🏞️ Revier: [Alle Reviere ▼]  🗺️ Alle  🎯 Anschuss  🟢 Fundort  📷 Kameras │
│  📍 GPS    🖊️ Zeichnen    ➕ Marker                                          │
│                                                                              │
├───────────────────────────────────────────┬─────────────────────────────────┤
│                                           │  ┌─────────────────────────┐   │
│   ┌─────────────────────────────────┐   │  │  Wetter      🔄          │   │
│   │  🌦️  Map Area                   │   │  ├─────────────────────────┤   │
│   │                                  │   │  │  12°C                   │   │
│   │     ➜  ➜   ➜                    │   │  │  Humidity: 65%          │   │
│   │  ➜      ➜     ➜                 │   │  │  Visibility: 5km        │   │
│   │       ➜                          │   │  │                         │   │
│   │                                  │   │  │        N                │   │
│   │  ┌─────────────────────┐        │   │  │      ┌───┐             │   │
│   │  │ 🌬️ Duftverlauf      │        │   │  │   W  │ ▲ │  E          │   │
│   │  │ Wind carries scent  │        │   │  │      │   │             │   │
│   │  │ up to 225m in NE    │        │   │  │      └───┘             │   │
│   │  │ Quality: excellent  │        │   │  │        S                │   │
│   │  └─────────────────────┘        │   │  │                         │   │
│   │                                  │   │  │  NE 45°                │   │
│   │                                  │   │  │  3 Bft (4.5 m/s)      │   │
│   │                                  │   │  │  Gusts: 6.2 m/s       │   │
│   │                                  │   │  │                         │   │
│   │  [Reviergrenzen polygon]         │   │  │  🌙 Mondphase          │   │
│   │  [🎯 Anschuss markers]           │   │  │  full (100%)           │   │
│   │  [📷 Camera markers]             │   │  │                         │   │
│   │                                  │   │  │  ☁️ Bewölkung          │   │
│   │                                  │   │  │  scattered - cumulus   │   │
│   │  ┌─────────────────┐            │   │  │                         │   │
│   │  │ Wetter-Layer    │            │   │  │  openmeteo • 90%       │   │
│   │  │ ☑ Windanimation │            │   │  └─────────────────────────┘   │
│   │  │ ☑ Duftverlauf   │            │   │                                 │
│   │  │ ☑ Unwetter-Warn.│            │   │  ┌─────────────────────────┐   │
│   │  └─────────────────┘            │   │  │  📋 Legende             │   │
│   │                                  │   │  │  🔴 Anschuss            │   │
│   └─────────────────────────────────┘   │  │  🟢 Fundort             │   │
│   Map (leaflet)                          │  │  🟣 Wildkamera          │   │
│                                           │  │  🔵 POI                 │   │
│                                           │  └─────────────────────────┘   │
│                                           │                                 │
│                                           │  ┌─────────────────────────┐   │
│                                           │  │  🗺️ Reviere             │   │
│                                           │  │  • Revier Nord          │   │
│                                           │  │  • Revier Süd           │   │
│                                           │  └─────────────────────────┘   │
│                                           │                                 │
│                                           │  ┌─────────────────────────┐   │
│                                           │  │  📍 Letzte Einträge     │   │
│                                           │  │  🎯 Rehbock - Hochsitz  │   │
│                                           │  │  🟢 Fundort Rehbock     │   │
│                                           │  │  📷 Wildkamera 1        │   │
│                                           │  └─────────────────────────┘   │
└───────────────────────────────────────────┴─────────────────────────────────┘
```

## 2. Wind Indicator Detail

```
┌─────────────────────────────┐
│                             │
│           N                 │
│         ┌───┐              │
│     W   │ ▲ │   E          │  ← Compass rose
│         │   │              │
│         └───┘              │
│           S                 │
│                             │
│     NE 45°                 │  ← Direction
│   3 Bft (4.5 m/s)         │  ← Wind speed
│   Gusts: 6.2 m/s          │  ← Gusts
│                             │
│  [████████░░] 95%          │  ← Confidence
│                             │
└─────────────────────────────┘

Color key:
- Green arrow (0-1 Bft): Calm
- Yellow arrow (2-5 Bft): Moderate  
- Orange arrow (6-7 Bft): Strong
- Red arrow (8+ Bft): Very strong
```

## 3. Animated Wind Particles

```
The map shows green arrows (➜) that:
- Point in the wind direction (e.g., NE = 45°)
- Move continuously across the screen
- Fade out as they travel
- Reset and repeat every 3 seconds
- Appear randomly across the map (100 particles)

Example animation sequence:
Frame 1: ➜ (opacity 70%, x=10, y=10)
Frame 2: ➜ (opacity 50%, x=50, y=50)
Frame 3: ➜ (opacity 30%, x=100, y=100)
Frame 4: ➜ (opacity 10%, x=150, y=150)
Frame 5: [hidden] (opacity 0%, x=200, y=200)
[Reset to Frame 1]
```

## 4. Scent Carry Information Box

```
┌─────────────────────────────────┐
│  🌬️ Duftverlauf                │
│                                 │
│  Wind carries scent up to       │
│  225m in NE direction          │
│                                 │
│  Quality: excellent             │
│                                 │
│  [Visualization shows arrow     │
│   extending 225m from hunter's  │
│   position in NE direction]     │
└─────────────────────────────────┘
```

## 5. Mobile View (Responsive)

```
┌──────────────────────┐
│  HNTR LEGEND    ☰   │
├──────────────────────┤
│                      │
│  [Map - Full Width] │
│                      │
│  🌦️  🎛️             │
│                      │
│  [Wind particles]   │
│                      │
│  ┌────────────────┐ │
│  │ Duftverlauf    │ │
│  │ 225m NE        │ │
│  │ excellent      │ │
│  └────────────────┘ │
│                      │
└──────────────────────┘

[Swipe up for weather panel]

┌──────────────────────┐
│  Wetter       🔄     │
├──────────────────────┤
│  12°C | 65% | 5km   │
│                      │
│  [Wind indicator]   │
│  NE 45° • 3 Bft     │
│                      │
│  🌙 full (100%)     │
│  ☁️ scattered       │
└──────────────────────┘
```

## 6. Weather Toggle States

**Weather Visible (🌦️):**
- Wind particles animated
- Scent carry box shown
- Weather panel visible
- Layer controls active

**Weather Hidden (🌤️):**
- No wind particles
- No scent carry box
- Weather panel minimized to icon
- Clean map view

## 7. Layer Configuration Panel

```
┌─────────────────────┐
│  Wetter-Layer       │
├─────────────────────┤
│  ☑ Windanimation   │  ← Toggles wind particles
│  ☑ Duftverlauf     │  ← Toggles scent carry box
│  ☑ Unwetter-Warn.  │  ← Toggles precipitation warnings
└─────────────────────┘

Unchecked (☐) = Feature disabled
Checked (☑) = Feature enabled
Changes apply immediately
```

## Color Palette

### Wind Strength Colors
- **#4CAF50** (Green): 0-1 Bft - Calm/Light
- **#8BC34A** (Light Green): 2-3 Bft - Light breeze
- **#FFC107** (Yellow): 4-5 Bft - Moderate
- **#FF9800** (Orange): 6-7 Bft - Fresh/Strong
- **#F44336** (Red): 8+ Bft - Gale

### UI Colors
- **#3b82f6** (Blue): POI markers
- **#ef4444** (Red): Anschuss markers
- **#22c55e** (Green): Fundort markers
- **#a855f7** (Purple): Wildkamera markers
- **#ffffff** (White): Panel backgrounds
- **#f3f4f6** (Gray): Secondary backgrounds

## Typography

- **Headings**: Bold, 1.25rem - 2rem
- **Body**: Regular, 0.875rem - 1rem
- **Small text**: Regular, 0.75rem
- **Numbers**: Bold for emphasis (temperature, degrees)

## Spacing

- **Panel padding**: 1rem (16px)
- **Section spacing**: 0.75rem - 1rem
- **Element gaps**: 0.5rem (8px)
- **Icon size**: 1.25rem - 1.5rem

## Animations

### Wind Particle
- **Duration**: 3s
- **Timing**: linear
- **Iteration**: infinite
- **Transform**: translate(200px, 200px)
- **Opacity**: 0.7 → 0

### Transitions
- **Opacity changes**: 0.3s ease
- **Transform changes**: 0.2s ease-out
- **Color changes**: 0.2s ease

---

## To See the Actual UI

1. Start the development server:
   ```bash
   cd jagdlog-web
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/map`

3. The weather overlay will load automatically with:
   - Animated wind particles
   - Real weather data from OpenMeteo
   - Interactive controls
   - Responsive layout

---

**Note**: This document provides ASCII art representations of the UI. The actual implementation uses React components with Tailwind CSS and Leaflet maps for a modern, responsive interface.
