---
name: Precision CNC Workshop IDE
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393d'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e7'
  on-surface-variant: '#d8c3ad'
  inverse-surface: '#e2e2e7'
  inverse-on-surface: '#2e3035'
  outline: '#a08e7a'
  outline-variant: '#534434'
  surface-tint: '#ffb95f'
  primary: '#ffc174'
  on-primary: '#472a00'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#855300'
  secondary: '#95ccff'
  on-secondary: '#003352'
  secondary-container: '#0070ac'
  on-secondary-container: '#dfeeff'
  tertiary: '#add98d'
  on-tertiary: '#163800'
  tertiary-container: '#92bd74'
  on-tertiary-container: '#284c10'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#95ccff'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#004a75'
  tertiary-fixed: '#c3f0a1'
  tertiary-fixed-dim: '#a7d387'
  on-tertiary-fixed: '#0a2100'
  on-tertiary-fixed-variant: '#2b5013'
  background: '#111317'
  on-background: '#e2e2e7'
  surface-variant: '#333539'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  code-editor-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: 0em
  code-editor-base:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: 0em
  code-editor-dense:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: 0em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1rem
  margin: 0.75rem
  margin-desktop: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for industrial reliability in high-interference shop-floor environments—specifically supporting CNC operators and machinists programming multi-axis milling centers such as the Mikron Mill P900 with FANUC 31i-MB/B controls. 

The aesthetic is functional brutalism fused with high-contrast ergonomics:
- **Atmosphere:** Deep, non-reflective matte surfaces that reject glare under harsh fluorescent shop lighting and oil mist.
- **Target User:** Precision CNC machinists, setup technicians, and manufacturing engineers who work while wearing nitrile or leather gloves, operating industrial ruggedized tablets, touch pendants, or workstation panels.
- **Emotional Response:** Absolute predictability, physical assurance, zero cognitive ambiguity, and mechanical precision. 

The interface eschews decorative flourishes, soft gradients, and atmospheric drop shadows. Instead, it relies on structural line-work, high-visibility state indicators, clear spatial separation, and oversized touch targets capable of resisting miss-clicks in vibrating, fast-paced manufacturing conditions.

## Colors

The palette is tuned specifically for low-fatigue prolonged editing alongside high-luminance shop machinery. The contrast ratios strictly meet WCAG AAA standards for critical controls and syntax tokens.

### Base Surfaces & Infrastructure
- **Base Canvas (`#121316`):** Deep matte charcoal for the editor canvas and document root; limits OLED/LCD backlight glare.
- **Panel Surface (`#1A1C20`):** Secondary container color for side drawers, modals, header toolbars, and file trees.
- **Elevated Control (`#22252A`):** Interactive inputs, active tab headers, and card containers.
- **High-Contrast Border (`#343841`):** 1px structural framing for all split panes, inputs, and touch affordances.

### Primary Accents & Workshop Indicators
- **Primary / Active Focus (`#F59E0B`):** Industrial Amber. Used exclusively for active machine focus, selected tools, modified files, cursor accent, and tactile focus outlines.
- **Secondary / G-M Codes (`#61AFEF`):** Crisp industrial cyan-blue. Commands, motion functions, and modal operational badges.
- **Tertiary / Coordinates (`#98C379`):** Technical sage green. Axis vectors (X, Y, Z, A, B, C), feed rates (F), spindle speeds (S), and tool indexes (T).
- **Status Validated / Sync (`#10B981`):** Emerald green for synchronized post-processed states and verified NC programs ("Salvato").
- **Status Local / Offline (`#38BDF8`):** Cool steel blue representing direct serial/RS232 or local DNC memory buffers ("Locale / Offline").
- **Status Hazard / Linter Warning (`#EF4444` / `#F97316`):** Pure non-ambiguous signal red and safety orange for syntax discrepancies, missing macros (`END1 mancante`), or out-of-boundary software limit flags.

### G-Code & Macro B Syntax Engine
- **Program & Block Numbers (`O`, `N`):** `#E5C07B` (Warm Gold)
- **G & M Motion Codes (`G00`-`G04`, `M03`-`M30`):** `#61AFEF` (Industrial Cyan)
- **Axes, Spindle, Feeds (`X`, `Y`, `Z`, `F`, `S`, `T`):** `#98C379` (Technical Sage)
- **Macro Variables (`#100`-`#999`, `#1000+`):** `#E06C75` (Coral Pink)
- **Macro B Logic (`WHILE`, `DO`, `END`, `IF`, `THEN`, `GOTO`, `AND`, `OR`):** `#D19A66` (Deep Industrial Amber)
- **Operators & Brackets (`=`, `+`, `-`, `*`, `/`, `[`, `]`):** `#ABB2BF` (Bright Metallic Grey)
- **Comments (`(...)`, `;`):** `#7F848E` (Muted Slate Grey, forced italic)

## Typography

Typography bifurcates into two dedicated engines:
1. **Interface & Controls (Inter):** Clean grotesque sans-serif with high x-height, engineered for structural menus, telemetry sidebars, modal confirmation prompts, and parameter dialogs.
2. **Editor & Numerical Indicators (JetBrains Mono):** Monospaced, zero-ambiguity font with distinct glyph disambiguation (slashed zero `0`, distinguishable `1`, `l`, and `I`). All NC code, coordinate tables, M-code triggers, and macro registers render in this typeface.

### Scaling & Readability Rules
- The base editor font is fixed at `16px` (`code-editor-base`) to enable rapid inspection from a 70–90 cm viewing distance while standing at the machine door.
- Operators may step zoom via a hard toggle (`Ctrl` + `Scroll` or on-screen `+ / -` steppers) between `14px` (dense macro inspection), `16px` (standard run mode), and `18px` (high-visibility monitor mode).
- Block sequence numbers (`N100`, `N110`) and Program IDs (`O0001`) use tabular numerals to maintain absolute vertical alignment across lines.

## Layout & Spacing

The layout is an uncompromising fixed-dock grid designed to match industrial multi-panel monitors and rugged tablets (e.g., 10" to 24" touch consoles).

### Layout Geometry
- **Global Structure:** Top utility navigation bar (48px fixed height), persistent status footer (32px fixed height), collapsable sidebar (280px default width for DNC files/macros/tools), and the primary central Code Workspace.
- **Split Modes:** Vertical or horizontal split panes for comparing active buffer code against subroutine libraries or tool wear tables.
- **Touch Safe Zones:** Interactive action buttons and toolbar toggles enforce a minimum touch bounding box of `48px × 48px`. Secondary inline action targets must never fall below `44px × 44px`.

### G-Code Editor Gutter Architecture
The editor gutter consists of three fixed-width monospaced zones:
1. **Line Number Zone:** 3 characters wide (`120`), right-aligned, muted grey `#7F848E`.
2. **Breakpoint / Safety Flag Zone:** 24px wide dedicated target area for conditional stops (`M01`), block delete slashes (`/`), and linter warning markers.
3. **Block Number Separation:** A strict `3ch` gap (`1.5rem`) between the physical gutter and code lines, ensuring operator-entered `N` codes (e.g., `N1020`) never visually collide with editor line numbers.

## Elevation & Depth

In a workshop setting, subtle drop shadows disappear completely on industrial monitors operated under harsh ceiling lights. Depth is communicated strictly through **structural tone layering** and **high-contrast outlines**:

- **Layer 0 (Canvas):** Editor viewport (`#121316`).
- **Layer 1 (Panels & Shell):** Toolbars, file trees, status dock (`#1A1C20`) bordered by `#343841` 1px solid edges.
- **Layer 2 (Inputs, Tabs, Floating Bars):** Active tabs, code snippets, tool inspection cards (`#22252A`).
- **Layer 3 (Modals, Overlays, Warnings):** Popovers and warning banners anchored with a `2px solid #343841` border and an ambient 0-blur hard offset (`box-shadow: 0 4px 0 0 #000000`).

### Interactive States & Focus Outlines
- **No Blurs:** Gaussian blurs are forbidden on inputs and alerts to preserve edge clarity on low-spec industrial touch PCs.
- **Focus Rings:** High-visibility double rings: `2px solid #F59E0B` with `2px` offset separation using the base background tone (`#121316`).
- **Linter Flags:** Floating inline syntax diagnostic banners sit directly underneath the flagged block with a hard `1px solid #EF4444` containment boundary and `#1A1C20` solid surface fill.

## Shapes

This design system uses **Soft / Industrial Machine** geometry (`roundedness: 1`):
- All basic controls, tool buttons, tabs, and input fields use a tight `0.25rem` (`4px`) corner radius.
- Cards, dialog panels, and editor container windows use `0.5rem` (`8px`) (`rounded-lg`).
- **Zero Pill Shapes:** Pill or rounded-full buttons are prohibited; CNC interfaces require rigid, deliberate visual frames that mirror physical mechanical buttons on FANUC machine control panels (MDI keys).
- Badges and status pills use a clipped rectangular profile with a strict `2px` border radius (`rounded-xs`) to emphasize technical telemetry over consumer software tropes.

## Components

### Buttons & Action Triggers
- **Industrial Button (Primary):** Solid `#F59E0B` background, `#121316` bold text (`JetBrains Mono`, uppercase). Minimum height `48px`. Active state shifts down `1px` with a darker amber fill (`#D97706`).
- **Panel Button (Secondary):** `#22252A` surface, `#343841` 1px border, `#E5C07B` or `#ABB2BF` text. Minimum height `48px`. Focus ring: `2px solid #F59E0B`.
- **E-Stop / Destructive Action:** High-saturation `#EF4444` border, `#22252A` background, text in `#EF4444`. On press, fills `#EF4444` with `#FFFFFF` text.

### Status Indicators & Badges
- Display explicit textual status next to an illuminated 8px indicator square:
  * **Unsaved Changes:** `#22252A` pill container, `#F59E0B` border and dot, text: `"MODIFICHE NON SALVATE"` (JetBrains Mono 11px uppercase).
  * **Synchronized / Post-Processed:** `#10B981` border and dot, text: `"SALVATO"`.
  * **Direct DNC / Offline:** `#38BDF8` border and dot, text: `"LOCALE (OFFLINE)"`.
  * **Macro Logic Error:** `#EF4444` border, warning triangle icon, text: `"ERRORE SINTASSI"`.

### Linter & Syntax Warning Banners
- Sits inline inside the code space directly beneath the erroneous line.
- Left-accented with a thick `4px solid #EF4444` vertical bar.
- Background is `#1A1C20` (opaque; never translucent).
- Typography contains exact syntax message in monospaced format: e.g., `END1 mancante per blocco WHILE [DO1] aperto a N120`.
- Includes a prominent dismiss/repair touch target (`44px` height).

### Inputs & Number Steppers
- G-Code parameter inputs (e.g., Feed override, Spindle speed, Work Coordinate Offset values) feature distinct numeric keypad steppers (`-`, `+`) pinned to the ends of the input field.
- Background `#121316`, border `1px solid #343841`. On focus: `1px solid #F59E0B`.
- Font: `JetBrains Mono` 16px to prevent accidental mobile browser zoom.

### Checkboxes & Segmented Toggles
- Custom high-contrast square targets (`24px × 24px` box centered inside a `48px` touch region).
- Checked state uses `#F59E0B` background with a solid `#121316` bold checkmark graphic.
- Segmented switches (e.g., `MDI / EDIT / AUTO` modes) use rectangular blocks with solid `#343841` dividers; active mode is highlighted with `#22252A` surface and `#F59E0B` bottom highlight strip (3px).

### Code Editor Canvas & Line Highlighting
- **Active Line:** Highlighted with `#1A1C20` solid background spanning 100% of editor width, framed by a soft vertical left bar (`2px solid #F59E0B`).
- **Selection Box:** High-contrast tint `#264F78` with sharp corners.
- **Search & Replace Hits:** Solid `#D19A66` highlight with dark `#121316` text.