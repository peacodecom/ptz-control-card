import { styles } from "./styles.js";

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const defaults = {
  title: "PTZ Control", hold_mode: true, show_zoom: true, show_preset: true, show_center: true,
  zoom_button_step: 10, zoom_button_step_percent: null,
  icon_up: "mdi:pan-up", icon_right: "mdi:pan-right", icon_down: "mdi:pan-down", icon_left: "mdi:pan-left", icon_stop: "mdi:stop", icon_center: null, text_center: null,
  color_ring_outer_bg: "transparent", color_ring_outer_border: "transparent",
  color_ring_inner_bg: "rgba(255, 255, 255, 0.6)", color_ring_inner_border: "rgba(120, 130, 145, 0.35)", color_ring_divider: "rgba(120, 130, 145, 0.26)",
  color_button_bg: "linear-gradient(180deg, #f7f8fa 0%, #e9edf2 100%)", color_button_hover_bg: "linear-gradient(180deg, #eef2f6 0%, #e2e7ed 100%)", color_button_active_bg: "#dce2e9", color_button_border: "rgba(120, 130, 145, 0.35)", color_button_icon: "#6c737d",
  color_button_up_border: null, color_button_right_border: null, color_button_down_border: null, color_button_left_border: null,
  color_button_up_bg: "linear-gradient(180deg, #f2f7ff 0%, #e3edff 100%)", color_button_right_bg: null, color_button_down_bg: null, color_button_left_bg: null,
  color_center_bg: "#8a8d92", color_center_border: "rgba(63, 127, 170, 0.7)", color_center_preset_bg: "#3f7faa", color_center_icon: "#fff", color_center_label: "#fff",
  color_preset_button_bg: "rgba(120, 130, 145, 0.12)", color_preset_button_border: "rgba(120, 130, 145, 0.28)", color_preset_button_text: "var(--primary-text-color)", color_preset_button_active_bg: "rgba(79, 143, 183, 0.2)", color_preset_button_active_border: "rgba(79, 143, 183, 0.55)", color_preset_button_active_text: "var(--primary-text-color)",
  color_zoom_panel_bg: "transparent", color_zoom_panel_border: "transparent", color_zoom_button_bg: "linear-gradient(180deg, #f7f8fa 0%, #e9edf2 100%)", color_zoom_button_hover_bg: "linear-gradient(180deg, #eef2f6 0%, #e2e7ed 100%)", color_zoom_button_active_bg: "#dce2e9", color_zoom_button_border: "rgba(120, 130, 145, 0.35)", color_zoom_button_icon: "#3f7faa", color_zoom_slider_accent: "#3f7faa",
};
const directions = ["up", "right", "down", "left"];

export class PtzControlCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._selectedPreset = null;
    this._zoomDraft = null;
    this._zoomEditing = false;
    this._activeStopHandler = null;
    this._stopTimer = null;
    this._lastDirectionReleaseAt = 0;
    this._lastRenderSignature = "";
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Card configuration is required");
    const cfg = { ...defaults, ...config };
    for (const direction of directions) {
      if (!cfg[`ptz_${direction}`]) throw new Error(`Missing required config key: ptz_${direction}`);
    }
    if ((cfg.hold_mode || (cfg.show_center && !cfg.preset_entity)) && !cfg.ptz_stop) {
      throw new Error("Missing required config key: ptz_stop (required for hold mode or stop center button)");
    }
    for (const key of [...directions.map((d) => `ptz_${d}`), "ptz_stop", "preset_go_entity", "preset_entity", "zoom_entity"]) {
      if (!cfg[key]) continue;
      const allowed = key === "preset_entity" ? ["select", "input_select"] : key === "zoom_entity" ? ["number", "input_number"] : ["button", "input_button", "script"];
      if (typeof cfg[key] !== "string" || !allowed.some((domain) => new RegExp(`^${domain}\\.[a-z0-9_]+$`).test(cfg[key]))) {
        throw new Error(`${key} must be an entity in: ${allowed.join(", ")}`);
      }
    }
    this._activeStopHandler?.();
    this._config = cfg;
    this._selectedPreset = null;
    this._zoomDraft = null;
    this._lastRenderSignature = "";
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._signature() !== this._lastRenderSignature) this._render();
  }

  connectedCallback() { this._render(); }
  disconnectedCallback() {
    this._activeStopHandler?.();
    this._zoomEditing = false;
  }
  getCardSize() { return 4; }

  _state(id) { return this._hass?.states?.[id]; }
  _isUnavailable(id) {
    const state = this._state(id);
    if (!state || state.state === "unavailable") return true;
    // Button state is its last-pressed timestamp: unknown can mean never pressed.
    return state.state === "unknown" && !["button", "input_button"].includes(id.split(".")[0]);
  }
  _signature() {
    if (!this._config || !this._hass) return "";
    return JSON.stringify(Object.entries(this._config).filter(([key]) => key.startsWith("ptz_") || key.endsWith("_entity")).map(([, id]) => {
      const st = this._state(id);
      return [id, st?.state, st?.attributes?.options, st?.attributes?.min, st?.attributes?.max, st?.attributes?.step];
    }));
  }

  async _call(domain, service, data) {
    if (!this._hass) return false;
    try {
      await this._hass.callService(domain, service, data);
      const error = this.shadowRoot.querySelector(".error");
      if (error) error.textContent = "";
      return true;
    } catch {
      const message = `Unable to call ${domain}.${service}. Check the entity and Home Assistant permissions.`;
      const error = this.shadowRoot.querySelector(".error");
      if (error) error.textContent = message;
      this.dispatchEvent(new CustomEvent("ptz-control-error", { detail: { message, domain, service }, bubbles: true, composed: true }));
      return false;
    }
  }

  _press(id) {
    if (!id || this._isUnavailable(id)) return Promise.resolve(false);
    const domain = id.split(".")[0];
    return this._call(domain, domain === "script" ? "turn_on" : "press", { entity_id: id });
  }

  _pressStopReliable() {
    const id = this._config?.ptz_stop;
    if (!id) return;
    void this._press(id);
    clearTimeout(this._stopTimer);
    this._stopTimer = setTimeout(() => {
      if (!this._activeStopHandler) void this._press(id);
    }, 120);
  }

  _setPreset(option) {
    const id = this._config.preset_entity;
    if (!option || this._isUnavailable(id)) return Promise.resolve(false);
    return this._call(id.split(".")[0], "select_option", { entity_id: id, option });
  }

  _setZoom(value) {
    const id = this._config.zoom_entity;
    if (!Number.isFinite(value) || this._isUnavailable(id)) return;
    void this._call(id.split(".")[0], "set_value", { entity_id: id, value });
  }

  _centerLabel() { return this._config.text_center ?? (this._config.preset_entity ? this._config.center_preset || this._selectedPreset || "" : ""); }
  async _centerAction() {
    if (!this._config.preset_entity) return this._press(this._config.ptz_stop);
    if (await this._setPreset(this._config.center_preset || this._selectedPreset)) {
      if (this._config.preset_go_entity) await this._press(this._config.preset_go_entity);
    }
  }

  _bindMove(button, id) {
    const cfg = this._config;
    button.disabled = this._isUnavailable(id) || (cfg.hold_mode && this._isUnavailable(cfg.ptz_stop));
    if (!cfg.hold_mode) {
      button.onclick = (ev) => { ev.stopPropagation(); void this._press(id); };
      return;
    }
    let pressed = false;
    let pointer = null;
    const end = (ev) => {
      if (!pressed) return;
      if (ev?.type?.startsWith("pointer") && pointer !== null && ev.pointerId !== pointer) return;
      if (ev?.cancelable) ev.preventDefault();
      pressed = false;
      for (const [target, type, handler] of listeners) target.removeEventListener(type, handler);
      this._activeStopHandler = null;
      try { if (pointer !== null) button.releasePointerCapture?.(pointer); } catch { /* Capture may already be lost. */ }
      pointer = null;
      this._lastDirectionReleaseAt = Date.now();
      this._pressStopReliable();
      queueMicrotask(() => { if (this.isConnected) this._render(); });
    };
    const visibility = () => { if (document.visibilityState !== "visible") end(); };
    const listeners = [[window, "pointerup", end], [window, "pointercancel", end], [window, "mouseup", end], [window, "touchend", end], [window, "touchcancel", end], [window, "blur", end], [document, "visibilitychange", visibility]];
    const start = (ev) => {
      if (button.disabled || pressed || (ev.button !== undefined && ev.button !== 0)) return;
      ev.preventDefault(); ev.stopPropagation();
      this._activeStopHandler?.();
      clearTimeout(this._stopTimer);
      pressed = true;
      pointer = ev.pointerId ?? null;
      this._activeStopHandler = end;
      try { if (pointer !== null) button.setPointerCapture?.(pointer); } catch { /* Global listeners provide a fallback. */ }
      for (const [target, type, handler] of listeners) target.addEventListener(type, handler, { passive: false });
      void this._press(id);
    };
    button.onpointerdown = start;
    button.onpointerup = end;
    button.onpointercancel = end;
    button.onlostpointercapture = end;
    button.onkeydown = (ev) => { if ([" ", "Enter"].includes(ev.key) && !ev.repeat) start(ev); };
    button.onkeyup = (ev) => { if ([" ", "Enter"].includes(ev.key)) end(ev); };
    button.onblur = () => end();
    button.ondragstart = (ev) => ev.preventDefault();
    button.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
  }

  _render() {
    if (!this._config || this._activeStopHandler || this._zoomEditing) return;
    const cfg = this._config;
    const preset = this._state(cfg.preset_entity);
    const options = Array.isArray(preset?.attributes?.options) ? preset.attributes.options.map(String) : [];
    if (!options.includes(this._selectedPreset)) this._selectedPreset = options.includes(preset?.state) ? preset.state : options[0] || null;
    const zoom = this._state(cfg.zoom_entity);
    const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const min = finite(zoom?.attributes?.min, 0);
    const max = Math.max(min, finite(zoom?.attributes?.max, 100));
    const step = Math.max(Number.EPSILON, finite(zoom?.attributes?.step, 1));
    this._zoomDraft = Math.min(max, Math.max(min, finite(zoom?.state, min)));
    for (const [key, value] of Object.entries(cfg)) {
      if (!key.startsWith("color_")) continue;
      let suffix = key.slice(6).replaceAll("_", "-");
      if (suffix.startsWith("button-")) suffix = suffix.replace("button-", "btn-");
      const fallback = key.match(/^color_button_(up|right|down|left)_(bg|border)$/)?.[2];
      this.style.setProperty(`--ptz-${suffix}`, String(value || (fallback ? cfg[`color_button_${fallback}`] : "transparent")));
    }
    const icon = (value) => `<ha-icon icon="${escapeHtml(value)}"></ha-icon>`;
    const label = this._centerLabel();
    const presetUnavailable = this._isUnavailable(cfg.preset_entity);
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <ha-card>
        <div class="title">${escapeHtml(cfg.title)}</div>
        <div class="control-layout ${cfg.zoom_entity && cfg.show_zoom ? "with-zoom" : ""}">
          <div class="ptz-pane"><div class="ring">
            <div class="diag d1"></div><div class="diag d2"></div>
            ${directions.map((d) => `<button type="button" class="dir-btn ${d}" id="ptz-${d}" aria-label="Move ${d}">${icon(cfg[`icon_${d}`])}</button>`).join("")}
            ${cfg.show_center ? `<button type="button" class="center-btn ${cfg.preset_entity ? "preset" : ""}" id="ptz-center" aria-label="${escapeHtml(cfg.preset_entity ? `Go to preset ${label}` : "Stop")}"><span class="center-inner">${icon(cfg.icon_center || (cfg.preset_entity ? "mdi:crosshairs-gps" : cfg.icon_stop))}${label ? `<span class="center-label">${escapeHtml(label)}</span>` : ""}</span></button>` : ""}
          </div></div>
          ${cfg.zoom_entity && cfg.show_zoom ? `<div class="zoom-pane"><div class="zoom-control">
            <button type="button" class="zoom-btn" id="zoom-plus" aria-label="Zoom in">${icon("mdi:magnify-plus-outline")}</button>
            <input id="zoom-range" class="zoom-slider" aria-label="Zoom" type="range" min="${min}" max="${max}" step="${step}" value="${this._zoomDraft}">
            <button type="button" class="zoom-btn" id="zoom-minus" aria-label="Zoom out">${icon("mdi:magnify-minus-outline")}</button>
          </div></div>` : ""}
        </div>
        ${cfg.preset_entity && cfg.show_preset ? `<div class="row"><div class="label">Preset</div><div class="preset-buttons">${options.map((opt, index) => `<button type="button" class="preset-btn ${opt === this._selectedPreset ? "active" : ""}" data-index="${index}" aria-pressed="${opt === this._selectedPreset}" ${presetUnavailable ? "disabled" : ""}>${escapeHtml(opt)}</button>`).join("")}</div></div>` : ""}
        <div class="error" role="status" aria-live="polite"></div>
      </ha-card>`;
    for (const d of directions) this._bindMove(this.shadowRoot.getElementById(`ptz-${d}`), cfg[`ptz_${d}`]);
    const center = this.shadowRoot.getElementById("ptz-center");
    if (center) {
      center.disabled = cfg.preset_entity ? presetUnavailable || !options.includes(cfg.center_preset || this._selectedPreset) || Boolean(cfg.preset_go_entity && this._isUnavailable(cfg.preset_go_entity)) : this._isUnavailable(cfg.ptz_stop);
      center.onclick = (ev) => { ev.stopPropagation(); if (Date.now() - this._lastDirectionReleaseAt >= 350) void this._centerAction(); };
    }
    for (const button of this.shadowRoot.querySelectorAll(".preset-btn")) {
      button.onclick = async (ev) => {
        ev.stopPropagation();
        const option = options[Number(button.dataset.index)];
        if (await this._setPreset(option)) {
          this._selectedPreset = option;
          this._render();
        }
      };
    }
    const range = this.shadowRoot.getElementById("zoom-range");
    if (range) {
      const apply = (value) => {
        const snapped = min + Math.round((value - min) / step) * step;
        this._zoomDraft = Number(Math.min(max, Math.max(min, snapped)).toPrecision(12));
        range.value = String(this._zoomDraft);
      };
      range.disabled = this._isUnavailable(cfg.zoom_entity);
      range.oninput = (ev) => { this._zoomEditing = true; apply(Number(ev.target.value)); };
      range.onchange = (ev) => { apply(Number(ev.target.value)); this._zoomEditing = false; this._setZoom(this._zoomDraft); };
      range.onblur = () => { this._zoomEditing = false; };
      const percent = Number(cfg.zoom_button_step_percent);
      const increment = Math.max(step, percent > 0 && Number.isFinite(percent) ? (max - min) * percent / 100 : finite(cfg.zoom_button_step, 10) > 0 ? finite(cfg.zoom_button_step, 10) : 10);
      for (const [id, delta] of [["zoom-plus", increment], ["zoom-minus", -increment]]) {
        const button = this.shadowRoot.getElementById(id);
        button.disabled = range.disabled;
        button.onclick = (ev) => { ev.stopPropagation(); apply(this._zoomDraft + delta); this._setZoom(this._zoomDraft); };
      }
    }
    this._lastRenderSignature = this._signature();
  }
}

if (!customElements.get("ptz-control-card")) customElements.define("ptz-control-card", PtzControlCard);
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "ptz-control-card")) {
  window.customCards.push({ type: "ptz-control-card", name: "PTZ Control Card", description: "Ring PTZ controls with hold-to-move, auto-stop, presets and zoom. Published by peacode.", preview: false });
}
