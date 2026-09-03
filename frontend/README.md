# SLICKWATCH — Maritime Forensics Instrumentation Platform
## "Graphite Bridge" Skeuomorphic Design System

An analog maritime instrument console interface for satellite SAR oil spill detection, OpenDrift hydrodynamic back-casting, and 7.28M-record AIS vessel attribution.

Designed for precision maritime operations by Coast Guard commands, Port Authorities, and Marine Insurers.

---

## 1. Design Language & The Three Material Families

The interface is built around tactile, physical instrumentation reminiscent of a research vessel or coastal defense bridge:

### A. Metal (Panels, Bars, Controls)
- **Texture & Finish**: Dark warm graphite metal panels (`--ink-900` `#1D1A16` to `--ink-800` `#26221C`) held with 4 corner screw rivets.
- **Engraved Labels**: Uppercase typography in `Barlow Condensed` (`--fg-dim` `#A89F8C` with `0 1px 0 rgba(255,255,255,0.07)` shadow).
- **Physical Caps**: Tactile push-button caps (`.btn-cap`) with bevels and physical active states:
  - `--primary`: Amber cap with ink text (`#F5B23C` → `#C87F0A`).
  - `--ghost`: Graphite cap with cream text.
  - `--alarm`: Alarm red cap with paper text (`#D9533C` → `#A83320`).

### B. Paper (Data Tapes, Suspect Lists, Dossiers)
- **Texture & Finish**: Warm cream paper panels (`--paper` `#EDE4D3`, `--paper-dim` `#C9BFA9`) with perforated tear-off headers and dashed row dividers (`#B7AC93`).
- **Typography**: Precision data readouts in `IBM Plex Mono` (`--ink-text` `#201B14`).
- **Physicality**: Container has a subtle `-0.4deg` rotational offset and paper drop shadow.

### C. Screen (CRT Radar & Gauges)
- **Texture & Finish**: Deep near-black screen wells (`--ink-950` `#131110`) inset behind beveled borders with inner radial shadows.
- **Display**: Map canvas with warm sepia filtering, SVG arc confidence gauge (`Dial`), and reticle corner brackets.

---

## 2. Design Tokens (`src/design/tokens.css`)

### Color Palette (Audited: Zero Blue • Zero Purple • Zero Emojis)
```css
--ink-950:     #131110;   /* Page base, CRT wells */
--ink-900:     #1D1A16;   /* Panel body */
--ink-800:     #26221C;   /* Raised panel / cap top */
--line:        #3A342B;   /* Hairlines, borders, engravings */
--paper:       #EDE4D3;   /* Paper surfaces */
--paper-dim:   #C9BFA9;   /* Perforations, dividers */
--ink-text:    #201B14;   /* Text on paper / amber caps */
--signal:      #F0A11B;   /* Primary amber */
--signal-deep: #C87F0A;   /* Pressed amber */
--ok:          #7CB342;   /* Phosphor green status lamps */
--alarm:       #C9452F;   /* Alarm red (culprit, errors, export) */
--fg:          #E8E0D0;   /* Primary text on dark */
--fg-dim:      #A89F8C;   /* Secondary text on dark */
--fg-mute:     #6E6656;   /* Disabled / tertiary on dark */
```

### Typography
- **Display**: `Barlow Condensed` 500/600/700 (Uppercase, tracking 0.10em–0.16em)
- **Body**: `IBM Plex Sans` 400/500
- **Data / Mono**: `IBM Plex Mono` 400/500/600 (Coordinates, scores, timestamps, stats)

### 4px Spacing Grid
`4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px`.

---

## 3. Skeuomorphic UI Primitives (`src/components/primitives/`)

| Component | Description |
| :--- | :--- |
| `MetalPanel` | Brushed graphite panel with 4 corner screw rivets and engraved header. |
| `BtnCap` | Tactile push-button with primary amber, ghost graphite, and alarm red variants. |
| `Lamp` | 10px LED signal lamp (`idle`, blinking `run`, steady `complete`, `error`). |
| `Toggle` | Physical 44×24 metal toggle switch with amber ON state. |
| `BezelScreen` | Inset CRT monitor well with inner depth shadow. |
| `PaperTape` | Perforated teleprinter cream paper tape with dashed dividers. |
| `Stamp` | -6deg rotated rubber stamps (`DETECTED`, `PRIME SUSPECT`, `COMPLETE`, `RUNNING`). |
| `Dial` | 240° SVG arc confidence gauge with spring needle animation. |
| `Plaque` | Toast notification plaque with status lamp. |

---

## 4. React Bits Custom Implementations

1. `SplitText` — Staggered character reveal on landing hero H1.
2. `CountUp` — Smooth numeric interpolation on stats band and confidence dial.
3. `Particles` — Amber-tinted 6% opacity background particle field behind hero.
4. `SpotlightCard` — 2×3 feature cards with cursor-following radial amber spotlight.
5. `AnimatedContent` — Viewport entrance animations with 60ms stagger.

---

## 5. Console Keyboard Navigation

- `R` — Run Live Analysis (when idle or error)
- `U` — Upload SAR GeoTIFF (.tif)
- `E` — Export Evidence Dossier (PDF)
- `L` — Toggle sidebar drawer
- `Esc` — Cancel analysis / Close dossier modal
- `+` / `−` — Zoom map canvas in / out

---

## 6. Verification & Constraint Auditing

- **Zero Blue / Violet / Purple Hex Audit**:
  ```bash
  grep -riE "#(0[0-9a-f]|1[0-9a-f]|2[0-9a-f]|3[0-9a-f])(8|9|a|b|c|d|e|f)[0-9a-f]{3}|#3b82f6|#8b5cf6|#a855f7|#6366f1" src/
  ```
  Returns **0 occurrences**.

- **Zero Emoji Scan**: Verified using Unicode emoji range parser. All icons originate from `lucide-react`.
