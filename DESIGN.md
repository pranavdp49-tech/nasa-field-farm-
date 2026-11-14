# NASA FieldFarm: Design Direction & Technical Specification

## 1. Product Identity & Purpose
NASA FieldFarm is an agro-ecological decision intelligence interface. It bridges NASA Earth Observation datasets (SMAP soil moisture, MODIS NDVI, NASA POWER evapotranspiration) with farm-level crop rotation planning to help farmers transition from vulnerable monocultures to climate-resilient farming systems.

## 2. Design Dials
- **ENERGY: 2 (Balanced)**. Professional, clean, utilitarian scientific instrument. High information density without visual clutter or generic marketing hype.
- **RHYTHM: 2 (Consistent with purposeful breaks)**. Structured flow moving from problem diagnostics, to farmer input coordinates, into comparative strategy analysis cards.
- **MOTION: 1 (Calm & functional)**. Subtle micro-interactions, card hover lifts, smooth theme cross-fades, and accessible transitions. All animations respect `prefers-reduced-motion`.

## 3. AMX App Design Adaptation
Inspired by the technical card architecture of amxapp.com/#apps:
- Precision dark/light surface tokens (`--surface`, `--surface-soft`, `--line`, `--text-strong`, `--text-body`).
- Per-card dual-accent system (`--accent-a` and `--accent-b`) creating a top hairline gradient and subtle radial ambient glow on hover.
- Squircle icon containment (`rounded-[22%]`) with border ring insets.
- Monospace metadata summary chips (`font-mono text-[11px] uppercase tracking-wider`).
- Tabular metric footers with bullet separation for rapid parameter scanning.

## 4. Color Palette & Purpose (R-01, R-29)
- **Base Neutrals (Light Theme)**:
  - Surface: `#ffffff`
  - Soft Surface: `#fafafa` / `#f5f5f5`
  - Lines / Borders: `#ebebeb`
  - Text Strong: `#171717` (Contrast 16.1:1 on white - PASS AA/AAA)
  - Text Body: `#4d4d4d` (Contrast 7.1:1 on white - PASS AA/AAA)
  - Text Mute: `#737373` (Contrast 4.6:1 on white - PASS AA)
- **Base Neutrals (Dark Theme)**:
  - Surface: `#0a0a0a`
  - Soft Surface: `#111111` / `#171717`
  - Lines / Borders: `#232323`
  - Text Strong: `#ededed` (Contrast 14.8:1 on dark - PASS AA/AAA)
  - Text Body: `#a1a1a1` (Contrast 6.8:1 on dark - PASS AA/AAA)
  - Text Mute: `#888888` (Contrast 4.7:1 on dark - PASS AA)
- **Strategy Card Color Accents**:
  - **Strategy A (Monocrop Control - Thermal & Drought Risk)**:
    - `--accent-a: #ef4444` (Crimson Warning)
    - `--accent-b: #f59e0b` (Amber Alert)
    - *Purpose*: Visually flags high evapotranspiration demand and negative soil nitrogen depletion.
  - **Strategy B (Drought-Resilient Rotation - Water Path)**:
    - `--accent-a: #06b6d4` (Hydrological Cyan)
    - `--accent-b: #0df2bd` (Aerated Aquamarine)
    - *Purpose*: Communicates water conservation, C4 photosynthetic efficiency, and low CWR.
  - **Strategy C (Legume Intercrop - Soil Regeneration Path)**:
    - `--accent-a: #10b981` (Chlorophyll Emerald)
    - `--accent-b: #84cc16` (Bioactive Lime)
    - *Purpose*: Signifies biological nitrogen fixation, soil organic matter restoration, and living vegetative cover.

## 5. Typography (R-06)
- **Sans-serif stack**: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
  - *Purpose*: Crisp readability, instant loading, native feel across operating systems.
- **Monospace stack**: `ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace`
  - *Purpose*: Precise tabular alignment for coordinates (lat/long), numerical metrics (GWETTOP, BNF, CWR), and satellite data readings.

## 6. One-Line Reasons for Core Decisions (R-31)
- *Why AMX card layout?* The 3-column card architecture with top hairline gradient and spec footer provides immediate side-by-side technical comparison of agro-ecological paths.
- *Why dark mode default with working toggle?* Agronomists and field researchers require low-glare visibility in both indoor labs and high-contrast daylight conditions.
- *Why interactive coordinate presets?* Enables instant verification of divergent agricultural climate zones (Punjab canal plain vs Deccan drylands vs Gangetic basin) without requiring manual GPS typing.
- *Why explicit empty, loading, and error states?* Satellite data pipelines can encounter missing granules or connection delays, requiring clear operational feedback.
- *Why real NASA variables (GWETTOP, NDVI, CWR, BNF)?* Farmers and extension agents need verifiable scientific metrics, not vague AI recommendations.
