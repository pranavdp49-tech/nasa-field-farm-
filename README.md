# NASA FieldFarm

Agro-ecological decision intelligence interface connecting NASA Earth Observation datasets with farm-level crop rotation planning.

Designed in accordance with **Anti-Slop Craftsmanship Guidelines** and inspired by the technical card architecture of **AMX App** (`amxapp.com/#apps`).

---

## Architecture Overview

1. **Problem Diagnosis Layer** (Farmer Crisis Diagnostics)
   - Volatile Weather: Heat waves and unpredictable monsoon timing (NASA POWER 2m Air Temp & GPM IMERG)
   - Vanishing Water: Groundwater and topsoil drying up (NASA SMAP L4_SM GWETTOP surface wetness)
   - Tired Soil: Continuous monoculture nutrient and carbon mining (MODIS NDVI vegetative cover)

2. **User Input Layer** (Frontend Client)
   - GPS coordinate inputs with device geolocation detection and regional presets (Deccan Plateau, Punjab Plain, Gangetic Basin, Gujarat Coast)
   - Baseline crop selector (Rice, Cotton, Wheat, Sugarcane, Maize)
   - Target growing season selector (Kharif, Rabi, Summer)
   - Soil texture and irrigation infrastructure parameters

3. **Output Layer** (UI Comparison Cards)
   - **Strategy A: Baseline Monocrop (Control Group)**: High ET demand, negative nitrogen balance, high vulnerability index.
   - **Strategy B: Drought-Resilient Rotation (Water-Optimization Path)**: Low crop water requirement (CWR < 400 mm), C4 photosynthetic cereal match (Sorghum / Pearl Millet) triggered when GWETTOP < 0.40.
   - **Strategy C: Legume Cover / Intercrop (Soil-Regeneration Path)**: Biological nitrogen fixation (BNF +40 to +80 kg N/ha), soil organic matter boost, continuous living green cover.

4. **Remote Sensing Telemetry Matrix**
   - Live localized sensor streams for SMAP GWETTOP, MODIS NDVI, NASA POWER ET0, and GPM IMERG precipitation.

---

## Running the Application

Open `index.html` directly in any modern browser, or launch a local web server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```

Then visit `http://localhost:8080`.

---

## Anti-Slop Implementation Notes
- **Zero Em Dashes (R-02)**: Strict punctuation hygiene using colons, commas, and parentheses.
- **Card Architecture (AMX style)**: Top hairline accent gradient, subtle radial ambient glow on hover, squircle icon badges, monospace spec footers.
- **Color Contrast (R-25)**: All text meets or exceeds WCAG AA (4.5:1 for body text, >16:1 for headings).
- **Accessibility (R-32, R-39)**: Keyboard navigable, skip link, accessible dialog focus trapping, Escape key listener, visible `focus-visible` indicators.
- **Complete UI States (R-27)**: Loading state, Empty state, and Error state with cause and recovery actions.
- **Light & Dark Theme (R-21, R-34)**: Fully functional, high-contrast theme toggle persisted across sessions.
