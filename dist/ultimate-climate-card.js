/**
 * Ultimate Climate Card
 * A custom Lovelace card for Home Assistant
 * Three display modes: Thermostat & Humidity, Thermostat, Temperature sensor
 *
 * Version: 1.0.1
 */

/* ============================================================
   EDITOR
   ============================================================ */
class UltimateClimateCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this.attachShadow({ mode: "open" });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._buildDOM();
    } else {
      // Only update hass on pickers, never rebuild DOM
      const pickers = this.shadowRoot.querySelectorAll("ha-entity-picker");
      pickers.forEach((p) => (p.hass = hass));
    }
  }

  setConfig(config) {
    this._config = { ...config };
    if (this._rendered) {
      this._updateValues();
    }
  }

  _val(key, fallback) {
    return this._config[key] || fallback || "";
  }

  _buildDOM() {
    if (!this._hass) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .row { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
        .row.hidden { display:none; }
        label { font-size:13px; font-weight:500; color:var(--primary-text-color); }
        ha-entity-picker, ha-textfield { display:block; width:100%; }
        .mode-select {
          display:block; width:100%; padding:10px 12px;
          background: var(--card-background-color, #1c1c1c);
          color: var(--primary-text-color, #fff);
          border: 1px solid var(--divider-color, #444);
          border-radius: 8px;
          font-size: 14px;
          font-family: var(--primary-font-family, sans-serif);
          cursor: pointer;
          -webkit-appearance: none;
          appearance: none;
          outline: none;
        }
        .mode-select option {
          background: var(--card-background-color, #1c1c1c);
          color: var(--primary-text-color, #fff);
        }
      </style>

      <div class="row" id="row-mode">
        <label>Card mode</label>
        <select id="mode" class="mode-select">
          <option value="full">Thermostat &amp; Humidity</option>
          <option value="climate">Thermostat</option>
          <option value="temperature">Temperature sensor</option>
        </select>
      </div>

      <div class="row" id="row-name">
        <label>Name</label>
        <ha-textfield id="name" placeholder="e.g. Living room"></ha-textfield>
      </div>

      <div class="row" id="row-climate">
        <label>Climate entity</label>
        <ha-entity-picker id="climate_entity" allow-custom-entity></ha-entity-picker>
      </div>

      <div class="row" id="row-humidity">
        <label>Humidity sensor</label>
        <ha-entity-picker id="humidity_entity" allow-custom-entity></ha-entity-picker>
      </div>

      <div class="row" id="row-temperature">
        <label>Temperature sensor</label>
        <ha-entity-picker id="temperature_entity" allow-custom-entity></ha-entity-picker>
      </div>
    `;

    // --- Set initial values ---
    const mode = this._val("mode", "full");

    const modeSelect = this.shadowRoot.getElementById("mode");
    modeSelect.value = mode;

    const nameField = this.shadowRoot.getElementById("name");
    nameField.value = this._val("name");

    const climatePicker = this.shadowRoot.getElementById("climate_entity");
    climatePicker.hass = this._hass;
    climatePicker.value = this._val("climate_entity");
    climatePicker.includeDomains = ["climate"];

    const humidityPicker = this.shadowRoot.getElementById("humidity_entity");
    humidityPicker.hass = this._hass;
    humidityPicker.value = this._val("humidity_entity");
    humidityPicker.includeDomains = ["sensor"];

    const tempPicker = this.shadowRoot.getElementById("temperature_entity");
    tempPicker.hass = this._hass;
    tempPicker.value = this._val("temperature_entity");
    tempPicker.includeDomains = ["sensor"];

    this._toggleFields(mode);

    // --- Wire events ---
    modeSelect.addEventListener("change", () => {
      const v = modeSelect.value;
      if (v !== this._val("mode", "full")) {
        this._config = { ...this._config, mode: v };
        this._toggleFields(v);
        this._fireChanged();
      }
    });

    nameField.addEventListener("change", (ev) => {
      const v = ev.target.value;
      if (v !== this._val("name")) {
        this._config = { ...this._config, name: v };
        this._fireChanged();
      }
    });

    climatePicker.addEventListener("value-changed", (ev) => {
      const v = ev.detail.value;
      if (v !== this._val("climate_entity")) {
        this._config = { ...this._config, climate_entity: v };
        this._fireChanged();
      }
    });

    humidityPicker.addEventListener("value-changed", (ev) => {
      const v = ev.detail.value;
      if (v !== this._val("humidity_entity")) {
        this._config = { ...this._config, humidity_entity: v };
        this._fireChanged();
      }
    });

    tempPicker.addEventListener("value-changed", (ev) => {
      const v = ev.detail.value;
      if (v !== this._val("temperature_entity")) {
        this._config = { ...this._config, temperature_entity: v };
        this._fireChanged();
      }
    });

    this._rendered = true;
  }

  _toggleFields(mode) {
    const show = (id, visible) => {
      const el = this.shadowRoot.getElementById(id);
      if (el) el.classList.toggle("hidden", !visible);
    };
    show("row-climate", mode === "full" || mode === "climate");
    show("row-humidity", mode === "full");
    show("row-temperature", mode === "temperature");
  }

  _updateValues() {
    const mode = this._val("mode", "full");
    const modeSelect = this.shadowRoot.getElementById("mode");
    if (modeSelect) modeSelect.value = mode;
    const nameField = this.shadowRoot.getElementById("name");
    if (nameField) nameField.value = this._val("name");
    const cp = this.shadowRoot.getElementById("climate_entity");
    if (cp) cp.value = this._val("climate_entity");
    const hp = this.shadowRoot.getElementById("humidity_entity");
    if (hp) hp.value = this._val("humidity_entity");
    const tp = this.shadowRoot.getElementById("temperature_entity");
    if (tp) tp.value = this._val("temperature_entity");
    this._toggleFields(mode);
  }

  _fireChanged() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }
}
customElements.define("ultimate-climate-card-editor", UltimateClimateCardEditor);

/* ============================================================
   MAIN CARD
   ============================================================ */
class UltimateClimateCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
  }

  static getConfigElement() {
    return document.createElement("ultimate-climate-card-editor");
  }

  static getStubConfig() {
    return { mode: "full", name: "", climate_entity: "", humidity_entity: "", temperature_entity: "" };
  }

  setConfig(config) {
    const mode = config.mode || "full";
    if (mode === "full" || mode === "climate") {
      if (!config.climate_entity) throw new Error("Select a climate entity");
    }
    if (mode === "full" && !config.humidity_entity) {
      throw new Error("Select a humidity sensor");
    }
    if (mode === "temperature" && !config.temperature_entity) {
      throw new Error("Select a temperature sensor");
    }
    this._config = {
      mode: "full",
      min_temp: 5,
      max_temp: 30,
      temp_step: 0.5,
      ...config,
    };
    this._buildStructure();
    if (this._hass) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  getCardSize() {
    return this._config.mode === "temperature" ? 1 : 2;
  }

  /* --- Build DOM --- */
  _buildStructure() {
    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="cl" id="root">
          <div class="cl-name" id="cardName"></div>
          <div class="cl-status" id="status"></div>
          <div id="content"></div>
        </div>
      </ha-card>
      ${this._styles()}
    `;
    this._els = {
      root: this.shadowRoot.getElementById("root"),
      cardName: this.shadowRoot.getElementById("cardName"),
      status: this.shadowRoot.getElementById("status"),
      content: this.shadowRoot.getElementById("content"),
    };
  }

  _styles() {
    return `<style>
      :host { display:block; }
      ha-card {
        background: none;
        border-radius: 28px;
        overflow: hidden;
        backdrop-filter: blur(3px) saturate(120%);
        -webkit-backdrop-filter: blur(3px) saturate(120%);
        box-shadow:
          inset 0 1px 2px rgba(255,255,255,0.35),
          inset 0 2px 4px rgba(0,0,0,0.15),
          0 2px 6px rgba(0,0,0,0.45);
        padding: 0 !important;
      }
      .cl {
        padding: 7px 10px;
        font-family: var(--primary-font-family, sans-serif);
        color: #fff;
        box-sizing: border-box;
        background: transparent;
      }
      .cl-name {
        font-size: 12px;
        font-weight: 700;
        color: rgba(255,255,255,.92);
        margin-bottom: 0;
      }
      .cl-status {
        font-size: 9.5px;
        font-weight: 600;
        letter-spacing: .02em;
        margin-bottom: 5px;
      }
      .cl-blocks {
        display: flex;
        gap: 5px;
        margin-bottom: 5px;
      }
      .cl-row {
        display: flex;
        gap: 5px;
      }
      .cl-block {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 8px;
        padding: 5px 4px 4px;
      }
      .cl-set {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255,255,255,.06);
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 8px;
        padding: 4px 8px;
      }
      .cl-setval {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .cl-bval {
        font-size: 14px;
        font-weight: 700;
        color: rgba(255,255,255,.9);
        line-height: 1;
      }
      .cl-blbl {
        font-size: 8.5px;
        color: rgba(255,255,255,.35);
        letter-spacing: .03em;
        margin-top: 1px;
      }
      .cl-btn {
        width: 22px;
        height: 22px;
        border-radius: 5px;
        border: 1px solid rgba(255,255,255,.13);
        background: rgba(255,255,255,.07);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background .15s, transform .1s;
        padding: 0;
        flex-shrink: 0;
      }
      .cl-btn:hover { background: rgba(255,255,255,.14); }
      .cl-btn:active { transform: scale(.88); }
      .cl-minus { color: rgba(79,195,247,.9); }
      .cl-plus { color: rgba(255,112,67,.9); }

      /* temperature-only: no bottom margin on status */
      .cl-status.no-margin { margin-bottom: 5px; }
    </style>`;
  }

  /* --- Update --- */
  _update() {
    if (!this._els || !this._hass) return;
    const mode = this._config.mode || "full";

    // Name
    this._els.cardName.textContent = this._config.name || this._getEntityName() || "?";

    if (mode === "temperature") {
      this._renderTemperatureOnly();
    } else if (mode === "climate") {
      this._renderClimate(false);
    } else {
      this._renderClimate(true);
    }
  }

  /* --- Mode: Temperature sensor only --- */
  _renderTemperatureOnly() {
    const entity = this._config.temperature_entity;
    const stateObj = this._hass.states[entity];

    if (!stateObj) {
      this._els.status.textContent = "";
      this._els.status.style.display = "none";
      this._els.content.innerHTML = `<div class="cl-block"><span class="cl-bval">--</span><span class="cl-blbl">Unavailable</span></div>`;
      return;
    }

    const temp = parseFloat(stateObj.state) || 0;

    // No status for temperature-only mode
    this._els.status.textContent = "";
    this._els.status.style.display = "none";

    this._els.content.innerHTML = `
      <div class="cl-block">
        <span class="cl-bval">${temp.toFixed(1)}°</span>
        <span class="cl-blbl">Temperature</span>
      </div>
    `;
  }

  /* --- Mode: Climate (with or without humidity) --- */
  _renderClimate(showHumidity) {
    const climateEntity = this._config.climate_entity;
    const stateObj = this._hass.states[climateEntity];

    if (!stateObj) {
      this._els.status.textContent = "Unavailable";
      this._els.status.style.color = "rgba(255,255,255,0.38)";
      this._els.status.style.display = "";
      this._els.content.innerHTML = "";
      return;
    }

    const targetTemp = parseFloat(stateObj.attributes.temperature) || 0;
    const curTemp = parseFloat(stateObj.attributes.current_temperature) || 0;
    const hvacAction = stateObj.attributes.hvac_action;
    const hvacMode = stateObj.state;

    // Status
    let sc, acLbl;
    if (hvacAction === "heating") {
      sc = "#ff7043"; acLbl = "Heating";
    } else if (hvacAction === "cooling") {
      sc = "#4fc3f7"; acLbl = "Cooling";
    } else if (hvacMode === "off") {
      sc = "rgba(255,255,255,0.28)"; acLbl = "Off";
    } else {
      sc = "rgba(255,255,255,0.38)"; acLbl = "Idle";
    }
    this._els.status.textContent = acLbl;
    this._els.status.style.color = sc;
    this._els.status.style.display = "";

    const minT = this._config.min_temp;
    const maxT = this._config.max_temp;
    const step = this._config.temp_step;

    if (showHumidity) {
      // Full mode: temp block + humidity block (stacked), then set row below
      const humEntity = this._config.humidity_entity;
      const humObj = this._hass.states[humEntity];
      const humidity = humObj ? Math.round(parseFloat(humObj.state) || 0) : "--";

      this._els.content.innerHTML = `
        <div class="cl-blocks">
          <div class="cl-block">
            <span class="cl-bval">${curTemp.toFixed(1)}°</span>
            <span class="cl-blbl">Temperature</span>
          </div>
          <div class="cl-block">
            <span class="cl-bval">${humidity}%</span>
            <span class="cl-blbl">Humidity</span>
          </div>
        </div>
        <div class="cl-set">
          <button class="cl-btn cl-minus" id="btnMinus">
            <ha-icon icon="mdi:minus" style="--mdc-icon-size:12px;color:inherit;display:block;"></ha-icon>
          </button>
          <div class="cl-setval">
            <span class="cl-bval">${targetTemp.toFixed(1)}°</span>
            <span class="cl-blbl">Set</span>
          </div>
          <button class="cl-btn cl-plus" id="btnPlus">
            <ha-icon icon="mdi:plus" style="--mdc-icon-size:12px;color:inherit;display:block;"></ha-icon>
          </button>
        </div>
      `;
    } else {
      // Climate mode: temp block + set block side by side
      this._els.content.innerHTML = `
        <div class="cl-row">
          <div class="cl-block">
            <span class="cl-bval">${curTemp.toFixed(1)}°</span>
            <span class="cl-blbl">Temperature</span>
          </div>
          <div class="cl-set">
            <button class="cl-btn cl-minus" id="btnMinus">
              <ha-icon icon="mdi:minus" style="--mdc-icon-size:12px;color:inherit;display:block;"></ha-icon>
            </button>
            <div class="cl-setval">
              <span class="cl-bval">${targetTemp.toFixed(1)}°</span>
              <span class="cl-blbl">Set</span>
            </div>
            <button class="cl-btn cl-plus" id="btnPlus">
              <ha-icon icon="mdi:plus" style="--mdc-icon-size:12px;color:inherit;display:block;"></ha-icon>
            </button>
          </div>
        </div>
      `;
    }

    // Wire buttons
    const btnMinus = this.shadowRoot.getElementById("btnMinus");
    const btnPlus = this.shadowRoot.getElementById("btnPlus");
    if (btnMinus) {
      btnMinus.onclick = (e) => {
        e.stopPropagation();
        const cur = parseFloat(this._hass.states[climateEntity].attributes.temperature) || 0;
        const newTemp = Math.max(minT, +(cur - step).toFixed(1));
        this._hass.callService("climate", "set_temperature", {
          entity_id: climateEntity,
          temperature: newTemp,
        });
      };
    }
    if (btnPlus) {
      btnPlus.onclick = (e) => {
        e.stopPropagation();
        const cur = parseFloat(this._hass.states[climateEntity].attributes.temperature) || 0;
        const newTemp = Math.min(maxT, +(cur + step).toFixed(1));
        this._hass.callService("climate", "set_temperature", {
          entity_id: climateEntity,
          temperature: newTemp,
        });
      };
    }
  }

  _getEntityName() {
    const mode = this._config.mode || "full";
    const entityId =
      mode === "temperature"
        ? this._config.temperature_entity
        : this._config.climate_entity;
    if (!entityId || !this._hass) return "";
    const obj = this._hass.states[entityId];
    return obj ? obj.attributes.friendly_name : entityId;
  }
}

customElements.define("ultimate-climate-card", UltimateClimateCard);

/* ============================================================
   REGISTER WITH HA
   ============================================================ */
window.customCards = window.customCards || [];
window.customCards.push({
  type: "ultimate-climate-card",
  name: "Ultimate Climate Card",
  description:
    "A versatile climate card with three modes: thermostat with humidity, thermostat, or temperature sensor only.",
  preview: true,
  documentationURL: "https://github.com/Sven2410/ultimate-climate-card",
});

console.info(
  "%c ULTIMATE-CLIMATE-CARD %c v1.0.1 ",
  "color:#fff;background:#ff7043;font-weight:bold;padding:2px 6px;border-radius:4px 0 0 4px;",
  "color:#ff7043;background:#f0f0f0;font-weight:bold;padding:2px 6px;border-radius:0 4px 4px 0;"
);
