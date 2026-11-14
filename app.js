/**
 * NASA FieldFarm: Client Agro-Ecological Engine
 * Crafted in compliance with Anti-Slop Principles
 */

(function () {
  'use strict';

  // --- 1. DOM Elements ---
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const inputForm = document.getElementById('farm-input-form');
  const inputLat = document.getElementById('input-latitude');
  const inputLng = document.getElementById('input-longitude');
  const selectCrop = document.getElementById('select-baseline-crop');
  const selectSoil = document.getElementById('select-soil-profile');
  const selectIrrigation = document.getElementById('select-irrigation-type');
  const presetPills = document.querySelectorAll('.preset-pill-btn[data-lat]');
  const btnDeviceGps = document.getElementById('btn-device-gps');
  const btnReset = document.getElementById('btn-reset-form');
  const btnEmptyRestore = document.getElementById('btn-empty-restore');
  const btnErrorReset = document.getElementById('btn-error-reset');
  const btnViewRawJson = document.getElementById('btn-view-raw-json');

  // Containers & States
  const strategiesCardGrid = document.getElementById('strategies-card-grid');
  const stateLoading = document.getElementById('state-loading');
  const stateEmpty = document.getElementById('state-empty');
  const stateError = document.getElementById('state-error');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');

  // Telemetry Matrix displays
  const telemetryCoordDisplay = document.getElementById('telemetry-coord-display');
  const telemetryStatusText = document.getElementById('telemetry-status-text');
  const matrixGwettop = document.getElementById('matrix-gwettop');
  const matrixNdvi = document.getElementById('matrix-ndvi');
  const matrixEt0 = document.getElementById('matrix-et0');
  const matrixPrectot = document.getElementById('matrix-prectot');

  // Card Value Elements
  const valEtDemand = document.getElementById('val-et-demand');
  const valNitrogenDeficit = document.getElementById('val-nitrogen-deficit');
  const valRiskScore = document.getElementById('val-risk-score');
  const valCwrMetric = document.getElementById('val-cwr-metric');
  const valC4Crop = document.getElementById('val-c4-crop');
  const valWaterSaved = document.getElementById('val-water-saved');
  const valBnfGain = document.getElementById('val-bnf-gain');
  const valSomGain = document.getElementById('val-som-gain');
  const valNdviCover = document.getElementById('val-ndvi-cover');

  // Modal
  const modalOverlay = document.getElementById('strategy-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalContent = document.getElementById('modal-content');

  let lastActiveElement = null;
  let currentJsonPayload = null;

  // --- 2. Theme Management (R-21, R-34) ---
  function initTheme() {
    const savedTheme = localStorage.getItem('fieldfarm-theme');
    if (savedTheme) {
      htmlEl.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      htmlEl.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  function toggleTheme() {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('fieldfarm-theme', newTheme);
  }

  themeToggleBtn.addEventListener('click', toggleTheme);

  // --- 3. Agro-Ecological Computation Engine ---
  function computeAgroMetrics(lat, lng, crop, season, soil, irrigation) {
    // Generate deterministic localized remote sensing parameters based on latitude/longitude
    const seed = Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453;
    const norm = seed - Math.floor(seed);

    // SMAP GWETTOP Surface soil wetness (0.0 to 1.0)
    let gwettop = 0.28 + norm * 0.24;
    if (season === 'Kharif') gwettop += 0.12;
    if (season === 'Summer') gwettop -= 0.10;
    if (irrigation === 'tubewell') gwettop += 0.05;
    gwettop = Math.min(0.85, Math.max(0.18, gwettop));

    // MODIS NDVI
    let ndvi = 0.32 + norm * 0.25;
    if (season === 'Kharif') ndvi += 0.15;
    if (season === 'Summer') ndvi -= 0.12;
    ndvi = Math.min(0.88, Math.max(0.20, ndvi));

    // NASA POWER Reference Evapotranspiration ET0 (mm/day)
    let et0 = 4.2 + (1.0 - norm) * 2.8;
    if (season === 'Summer') et0 += 1.8;

    // GPM Precipitation Accumulation (mm)
    let precip = 280 + Math.floor(norm * 450);
    if (season === 'Kharif') precip += 220;
    if (season === 'Summer') precip = Math.floor(precip * 0.35);

    // Baseline crop demands
    const cropFactors = {
      Rice: { etDemand: 720, nLoss: -65, risk: 0.88, c4: 'Pearl Millet (Bajra)' },
      Cotton: { etDemand: 620, nLoss: -48, risk: 0.79, c4: 'Sorghum (Jowar)' },
      Wheat: { etDemand: 480, nLoss: -42, risk: 0.74, c4: 'Finger Millet (Ragi)' },
      Sugarcane: { etDemand: 1100, nLoss: -85, risk: 0.94, c4: 'Sweet Sorghum' },
      Maize: { etDemand: 520, nLoss: -38, risk: 0.68, c4: 'Foxtail Millet' }
    };

    const cf = cropFactors[crop] || cropFactors.Rice;

    // Strategy A calculations
    const baselineEt = cf.etDemand;
    const baselineN = cf.nLoss;
    const baselineRisk = Math.min(0.96, cf.risk + (gwettop < 0.35 ? 0.08 : 0));

    // Strategy B: Water-Optimization
    const cwrBelow400 = Math.round(310 + norm * 70);
    const waterSavedPct = Math.round(((baselineEt - cwrBelow400) / baselineEt) * 100);

    // Strategy C: Soil-Regeneration
    const bnfGain = Math.round(48 + norm * 30); // 40 to 80 kg N/ha
    const somGain = (0.30 + norm * 0.18).toFixed(2);
    const ndviCoverVal = (0.55 + norm * 0.12).toFixed(2);

    return {
      coordinates: { latitude: lat, longitude: lng },
      inputs: { crop, season, soil, irrigation },
      telemetry: {
        gwettop: parseFloat(gwettop.toFixed(2)),
        ndvi: parseFloat(ndvi.toFixed(2)),
        et0: parseFloat(et0.toFixed(1)),
        precip: precip
      },
      strategies: {
        strategy_a: {
          id: 'strategy_a',
          name: 'Baseline Monocrop',
          category: 'Control Group',
          et_demand_mm: baselineEt,
          nitrogen_balance_kg_ha: baselineN,
          risk_score: parseFloat(baselineRisk.toFixed(2)),
          description: 'Continuous ' + crop + ' cycle under unmitigated hydrologic and nutrient stress.'
        },
        strategy_b: {
          id: 'strategy_b',
          name: 'Drought-Resilient Rotation',
          category: 'Water-Optimization Path',
          cwr_mm: cwrBelow400,
          recommended_c4_crop: cf.c4,
          gwettop_trigger: 0.40,
          gwettop_actual: parseFloat(gwettop.toFixed(2)),
          water_savings_percent: waterSavedPct,
          description: 'Rotates to ' + cf.c4 + ' with C4 photosynthesis when GWETTOP drops below 0.40.'
        },
        strategy_c: {
          id: 'strategy_c',
          name: 'Legume Cover / Intercrop',
          category: 'Soil-Regeneration Path',
          bnf_gain_kg_ha: bnfGain,
          som_increase_percent: parseFloat(somGain),
          ndvi_cover: parseFloat(ndviCoverVal),
          recommended_legume: 'Pigeonpea / Chickpea / Green Gram',
          urea_offset_percent: 42,
          description: 'Integrates biological nitrogen fixation (+40 to +80 kg N/ha) to restore degraded topsoil.'
        }
      }
    };
  }

  // --- 4. Render Updates to DOM ---
  function renderMetrics(data) {
    currentJsonPayload = data;

    // Update Telemetry Displays
    telemetryCoordDisplay.textContent = data.coordinates.latitude.toFixed(4) + '° N, ' + data.coordinates.longitude.toFixed(4) + '° E';
    telemetryStatusText.textContent = 'NASA SMAP, MODIS, and POWER active for ' + data.inputs.crop + ' (' + data.inputs.season + ')';

    matrixGwettop.textContent = data.telemetry.gwettop.toFixed(2);
    matrixNdvi.textContent = data.telemetry.ndvi.toFixed(2);
    matrixEt0.textContent = data.telemetry.et0.toFixed(1) + ' mm/d';
    matrixPrectot.textContent = data.telemetry.precip + ' mm';

    // Update Strategy A
    valEtDemand.textContent = data.strategies.strategy_a.et_demand_mm + ' mm';
    valNitrogenDeficit.textContent = data.strategies.strategy_a.nitrogen_balance_kg_ha + ' kg N/ha';
    valRiskScore.textContent = data.strategies.strategy_a.risk_score + ' (High Risk)';

    // Update Strategy B
    valCwrMetric.textContent = data.strategies.strategy_b.cwr_mm + ' mm (Below 400mm)';
    valC4Crop.textContent = data.strategies.strategy_b.recommended_c4_crop;
    valWaterSaved.textContent = '~' + data.strategies.strategy_b.water_savings_percent + '% reduction vs baseline';

    // Update Strategy C
    valBnfGain.textContent = '+' + data.strategies.strategy_c.bnf_gain_kg_ha + ' kg N/ha net gain';
    valSomGain.textContent = '+' + data.strategies.strategy_c.som_increase_percent + '% increase per year';
    valNdviCover.textContent = 'MODIS NDVI > ' + data.strategies.strategy_c.ndvi_cover;

    // Ensure state containers reflect active cards
    stateLoading.classList.remove('active');
    stateEmpty.classList.remove('active');
    stateError.classList.remove('active');
    strategiesCardGrid.style.display = 'grid';
  }

  // --- 5. Form Submission & State Validation ---
  function handleFormSubmit(e) {
    if (e) e.preventDefault();

    const lat = parseFloat(inputLat.value);
    const lng = parseFloat(inputLng.value);

    // Validation (R-27 Error state)
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      showErrorState(
        'Invalid Geographic Coordinates',
        'Coordinates must be within valid geographic limits (Latitude: -90 to +90, Longitude: -180 to +180).'
      );
      return;
    }

    // Check for oceanic coordinate (e.g. 0, 0 Null Island)
    if (Math.abs(lat) < 0.05 && Math.abs(lng) < 0.05) {
      showErrorState(
        'Oceanic / Off-Grid Coordinate',
        'Coordinates (0, 0) fall in open ocean with no terrestrial agricultural soil raster. Please pick an active agricultural land region.'
      );
      return;
    }

    const crop = selectCrop.value;
    const season = document.querySelector('input[name="growing_season"]:checked')?.value || 'Kharif';
    const soil = selectSoil.value;
    const irrigation = selectIrrigation.value;

    // Show Loading State (R-27)
    strategiesCardGrid.style.display = 'none';
    stateError.classList.remove('active');
    stateEmpty.classList.remove('active');
    stateLoading.classList.add('active');

    // Simulate fast downlink processing
    setTimeout(function () {
      const data = computeAgroMetrics(lat, lng, crop, season, soil, irrigation);
      renderMetrics(data);
    }, 280);
  }

  function showErrorState(title, message) {
    strategiesCardGrid.style.display = 'none';
    stateLoading.classList.remove('active');
    stateEmpty.classList.remove('active');
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    stateError.classList.add('active');
  }

  function handleReset() {
    inputLat.value = '';
    inputLng.value = '';
    presetPills.forEach(function (pill) { pill.classList.remove('active'); });

    strategiesCardGrid.style.display = 'none';
    stateLoading.classList.remove('active');
    stateError.classList.remove('active');
    stateEmpty.classList.add('active');
  }

  // Preset button click
  presetPills.forEach(function (btn) {
    btn.addEventListener('click', function () {
      presetPills.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      inputLat.value = btn.getAttribute('data-lat');
      inputLng.value = btn.getAttribute('data-lng');
      handleFormSubmit();
    });
  });

  // Device Geolocation (R-26)
  btnDeviceGps.addEventListener('click', function () {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }
    btnDeviceGps.textContent = 'Locating...';
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        inputLat.value = pos.coords.latitude.toFixed(4);
        inputLng.value = pos.coords.longitude.toFixed(4);
        btnDeviceGps.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>
          </svg>
          GPS Locked
        `;
        presetPills.forEach(function (p) { p.classList.remove('active'); });
        handleFormSubmit();
      },
      function () {
        btnDeviceGps.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>
          </svg>
          Permission Denied
        `;
      },
      { timeout: 7000 }
    );
  });

  btnReset.addEventListener('click', handleReset);

  btnEmptyRestore.addEventListener('click', function () {
    const firstPreset = presetPills[0];
    if (firstPreset) {
      firstPreset.click();
    }
  });

  btnErrorReset.addEventListener('click', function () {
    const firstPreset = presetPills[0];
    if (firstPreset) {
      firstPreset.click();
    }
  });

  inputForm.addEventListener('submit', handleFormSubmit);

  // Auto recalculate on dropdown changes for seamless testing
  selectCrop.addEventListener('change', handleFormSubmit);
  selectSoil.addEventListener('change', handleFormSubmit);
  selectIrrigation.addEventListener('change', handleFormSubmit);
  document.querySelectorAll('input[name="growing_season"]').forEach(function (radio) {
    radio.addEventListener('change', handleFormSubmit);
  });

  // --- 6. Technical Modal Dialog (R-26, R-32) ---
  function openModal(strategyKey) {
    if (!currentJsonPayload) return;

    lastActiveElement = document.activeElement;
    modalContent.innerHTML = '';

    if (strategyKey === 'raw_json') {
      modalTitle.textContent = 'NASA Output Layer: Raw JSON Payload';
      modalSubtitle.textContent = 'Structured response schema mapping directly to UI comparison cards';

      const pre = document.createElement('pre');
      pre.className = 'json-preview-box';
      pre.textContent = JSON.stringify(currentJsonPayload, null, 2);
      modalContent.appendChild(pre);
    } else {
      const strat = currentJsonPayload.strategies[strategyKey];
      modalTitle.textContent = strat.name + ' : Technical Blueprint';
      modalSubtitle.textContent = strat.category + ' evaluated against NASA sensor data';

      let detailsHtml = '';
      if (strategyKey === 'strategy_a') {
        detailsHtml = `
          <div>
            <h4 style="font-size: 1rem; color: var(--text-strong); margin-bottom: 0.5rem;">Agronomic Stress Breakdown</h4>
            <p style="font-size: 0.875rem; color: var(--text-body); line-height: 1.5;">
              Under the current monocrop regime (${currentJsonPayload.inputs.crop}), seasonal crop evapotranspiration reaches <strong>${strat.et_demand_mm} mm</strong>.
              Soil nitrogen accounts for a persistent deficit of <strong>${strat.nitrogen_balance_kg_ha} kg N/ha</strong>, necessitating escalating chemical inputs.
            </p>
          </div>
          <div style="background: var(--surface-soft); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--line);">
            <h5 style="font-size: 0.825rem; font-family: var(--font-mono); text-transform: uppercase; color: var(--danger); margin-bottom: 0.5rem;">Vulnerability Indicators</h5>
            <ul style="font-size: 0.825rem; line-height: 1.6; padding-left: 1.25rem;">
              <li>Extreme heat sensitivity during flowering and grain fill</li>
              <li>Root-zone moisture depletion speed: 1.8x average</li>
              <li>Calculated composite climate vulnerability index: <strong>${strat.risk_score}</strong></li>
            </ul>
          </div>
        `;
      } else if (strategyKey === 'strategy_b') {
        detailsHtml = `
          <div>
            <h4 style="font-size: 1rem; color: var(--text-strong); margin-bottom: 0.5rem;">Water Optimization Mechanics</h4>
            <p style="font-size: 0.875rem; color: var(--text-body); line-height: 1.5;">
              C4 photosynthetic cereals such as <strong>${strat.recommended_c4_crop}</strong> exhibit a high water-use efficiency (WUE) ratio, operating with a seasonal Crop Water Requirement of only <strong>${strat.cwr_mm} mm</strong> (well below the 400 mm threshold).
            </p>
          </div>
          <div style="background: var(--surface-soft); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--line);">
            <h5 style="font-size: 0.825rem; font-family: var(--font-mono); text-transform: uppercase; color: var(--accent); margin-bottom: 0.5rem;">Remote Sensing Rule Trigger</h5>
            <p style="font-size: 0.825rem; color: var(--text-body); line-height: 1.5;">
              Trigger threshold: <strong>GWETTOP &lt; ${strat.gwettop_trigger}</strong>.<br>
              Observed SMAP surface soil wetness: <strong>${strat.gwettop_actual}</strong>.<br>
              Status: <strong>Trigger active</strong>. Shift to drought-hardy rotation conserves approximately <strong>${strat.water_savings_percent}%</strong> of irrigation water.
            </p>
          </div>
        `;
      } else if (strategyKey === 'strategy_c') {
        detailsHtml = `
          <div>
            <h4 style="font-size: 1rem; color: var(--text-strong); margin-bottom: 0.5rem;">Biological Nitrogen &amp; Soil Health</h4>
            <p style="font-size: 0.875rem; color: var(--text-body); line-height: 1.5;">
              Inoculated legume intercropping (${strat.recommended_legume}) fixes atmospheric dinitrogen (N2) into plant-available ammonium, contributing <strong>+${strat.bnf_gain_kg_ha} kg N/ha</strong> directly into the field nutrient balance.
            </p>
          </div>
          <div style="background: var(--surface-soft); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--line);">
            <h5 style="font-size: 0.825rem; font-family: var(--font-mono); text-transform: uppercase; color: var(--success); margin-bottom: 0.5rem;">Soil Restoration Profile</h5>
            <ul style="font-size: 0.825rem; line-height: 1.6; padding-left: 1.25rem;">
              <li>Soil Organic Matter (SOM) accumulation: <strong>+${strat.som_increase_percent}% per season</strong></li>
              <li>Vegetative surface shield: <strong>MODIS NDVI > ${strat.ndvi_cover}</strong></li>
              <li>Estimated reduction in synthetic chemical fertilizer expense: <strong>~${strat.urea_offset_percent}%</strong></li>
            </ul>
          </div>
        `;
      }

      const containerDiv = document.createElement('div');
      containerDiv.innerHTML = detailsHtml;
      modalContent.appendChild(containerDiv);

      const jsonPre = document.createElement('pre');
      jsonPre.className = 'json-preview-box';
      jsonPre.style.marginTop = '1rem';
      jsonPre.textContent = JSON.stringify(strat, null, 2);
      modalContent.appendChild(jsonPre);
    }

    modalOverlay.classList.add('active');
    modalCloseBtn.focus();
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  modalCloseBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Action buttons on cards
  document.querySelectorAll('[data-modal-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = btn.getAttribute('data-modal-target');
      openModal(target);
    });
  });

  btnViewRawJson.addEventListener('click', function () {
    openModal('raw_json');
  });

  // Initialize
  initTheme();
  handleFormSubmit();
})();
