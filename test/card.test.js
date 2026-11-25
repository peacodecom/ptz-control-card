import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Window } from "happy-dom";

const window = new Window();
for (const name of ["window", "document", "customElements", "HTMLElement", "CustomEvent"]) {
  globalThis[name] = name === "window" ? window : window[name];
}
const { PtzControlCard } = await import("../src/ptz-control-card.js");
const cfg = { ptz_left: "button.camera_left", ptz_right: "button.camera_right", ptz_up: "button.camera_up", ptz_down: "button.camera_down", ptz_stop: "button.camera_stop" };
const cards = [];
const tick = () => new Promise((resolve) => setImmediate(resolve));
function make(extra = {}, states = {}) {
  const card = new PtzControlCard();
  const calls = [];
  card.setConfig({ ...cfg, ...extra });
  const entities = Object.fromEntries([...Object.values(cfg), ...Object.values(extra)].filter((id) => typeof id === "string" && /^(button|input_button|script)\./.test(id)).map((id) => [id, { state: "off", attributes: {} }]));
  card.hass = { states: { ...entities, ...states }, callService: async (...args) => { calls.push(args); } };
  document.body.append(card);
  cards.push(card);
  return { card, calls, get: (id) => card.shadowRoot.getElementById(id) };
}
function pointer(target, type, pointerId = 1, button = 0) {
  target.dispatchEvent(new window.PointerEvent(type, { pointerId, button, bubbles: true, cancelable: true }));
}
afterEach(() => {
  for (const card of cards.splice(0)) { card.remove(); clearTimeout(card._stopTimer); }
});

test("validates required controls and stop requirements", () => {
  const card = new PtzControlCard();
  assert.throws(() => card.setConfig(null), /configuration/);
  assert.throws(() => card.setConfig({}), /ptz_up/);
  assert.throws(() => card.setConfig({ ...cfg, ptz_stop: null }), /ptz_stop/);
  assert.doesNotThrow(() => card.setConfig({ ...cfg, ptz_stop: null, hold_mode: false, show_center: false }));
});
test("rejects unsupported entity domains", () => {
  assert.throws(() => new PtzControlCard().setConfig({ ...cfg, ptz_left: "switch.motor" }), /ptz_left/);
  assert.throws(() => new PtzControlCard().setConfig({ ...cfg, zoom_entity: "sensor.zoom" }), /zoom_entity/);
});
test("registers the card and picker metadata", () => {
  assert.equal(customElements.get("ptz-control-card"), PtzControlCard);
  assert.equal(window.customCards.filter((card) => card.type === "ptz-control-card").length, 1);
});
test("renders safe labels and attributes without injected HTML", () => {
  const malicious = '"><img src=x onerror=alert(1)>';
  const { card } = make({ title: malicious, icon_up: malicious, preset_entity: "select.camera_preset" }, { "select.camera_preset": { state: malicious, attributes: { options: [malicious] } } });
  assert.equal(card.shadowRoot.querySelectorAll("img").length, 0);
  assert.equal(card.shadowRoot.querySelector(".title").textContent, malicious);
  assert.equal(card.shadowRoot.querySelector(".preset-btn").textContent, malicious);
  assert.equal(card.shadowRoot.querySelector("ha-icon").getAttribute("icon"), malicious);
});
test("hold starts once and global release sends stop", () => {
  const { get, calls } = make();
  pointer(get("ptz-left"), "pointerdown");
  pointer(get("ptz-left"), "pointerdown");
  pointer(window, "pointerup");
  assert.deepEqual(calls.map((c) => c[2].entity_id), [cfg.ptz_left, cfg.ptz_stop]);
});
test("state changes while held preserve the active DOM and stop handler", async () => {
  const { card, get, calls } = make();
  const button = get("ptz-left");
  pointer(button, "pointerdown");
  card.hass = { ...card._hass, states: { ...card._hass.states, [cfg.ptz_left]: { state: "on" } } };
  assert.equal(get("ptz-left"), button);
  pointer(window, "pointerup");
  await tick();
  assert.equal(calls.at(-1)[2].entity_id, cfg.ptz_stop);
  assert.notEqual(get("ptz-left"), button);
});
for (const type of ["pointercancel", "blur"]) {
  test(`${type} stops movement`, () => {
    const { get, calls } = make();
    pointer(get("ptz-up"), "pointerdown");
    if (type === "blur") window.dispatchEvent(new window.Event(type));
    else pointer(window, type);
    assert.equal(calls.at(-1)[2].entity_id, cfg.ptz_stop);
  });
}
test("unrelated pointer release does not stop the active pointer", () => {
  const { card, get } = make();
  pointer(get("ptz-left"), "pointerdown", 1);
  pointer(window, "pointerup", 2);
  assert.ok(card._activeStopHandler);
  pointer(window, "pointerup", 1);
  assert.equal(card._activeStopHandler, null);
});
test("right mouse button does not start movement", () => {
  const { get, calls } = make();
  pointer(get("ptz-up"), "pointerdown", 1, 2);
  assert.equal(calls.length, 0);
});
test("switching direction stops the old move and cancels its delayed stop", async () => {
  const { card, get, calls } = make();
  pointer(get("ptz-left"), "pointerdown");
  pointer(get("ptz-right"), "pointerdown", 2);
  await tick();
  assert.ok(card._activeStopHandler);
  assert.equal(calls.at(-1)[2].entity_id, cfg.ptz_right);
  assert.equal(get("ptz-right").isConnected, true);
  pointer(window, "pointerup", 2);
});
test("disconnect stops motion and cleans up global listeners", () => {
  const { card, get, calls } = make();
  pointer(get("ptz-down"), "pointerdown");
  card.remove();
  const count = calls.length;
  pointer(window, "pointerup");
  assert.equal(card._activeStopHandler, null);
  assert.equal(calls.length, count);
  assert.equal(calls.at(-1)[2].entity_id, cfg.ptz_stop);
});
test("reconfiguration stops with the original stop entity", () => {
  const { card, get, calls } = make();
  pointer(get("ptz-up"), "pointerdown");
  card.setConfig({ ...cfg, ptz_stop: "button.other_stop" });
  assert.equal(calls.at(-1)[2].entity_id, cfg.ptz_stop);
});
test("keyboard activation supports hold and release", () => {
  const { get, calls } = make();
  const button = get("ptz-up");
  button.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", cancelable: true }));
  button.dispatchEvent(new window.KeyboardEvent("keyup", { key: "Enter", cancelable: true }));
  assert.deepEqual(calls.map((c) => c[2].entity_id), [cfg.ptz_up, cfg.ptz_stop]);
});
test("tap mode invokes scripts using script.turn_on", () => {
  const { get, calls } = make({ hold_mode: false, ptz_left: "script.camera_left" });
  get("ptz-left").click();
  assert.deepEqual(calls[0], ["script", "turn_on", { entity_id: "script.camera_left" }]);
});
test("input_button controls use input_button.press", () => {
  const { get, calls } = make({ hold_mode: false, ptz_left: "input_button.camera_left" });
  get("ptz-left").click();
  assert.equal(calls[0][0], "input_button");
});
for (const state of ["unavailable"]) {
  test(`${state} controls are disabled`, () => {
    const { get, calls } = make({}, { [cfg.ptz_left]: { state } });
    assert.equal(get("ptz-left").disabled, true);
    pointer(get("ptz-left"), "pointerdown");
    assert.equal(calls.length, 0);
  });
}
test("never-pressed buttons remain usable with an unknown timestamp", () => {
  const { get, calls } = make({ hold_mode: false }, { [cfg.ptz_left]: { state: "unknown" }, [cfg.ptz_stop]: { state: "unknown" } });
  assert.equal(get("ptz-left").disabled, false);
  get("ptz-left").click();
  assert.equal(calls.at(-1)[2].entity_id, cfg.ptz_left);
});
test("unknown zoom values are disabled", () => {
  const { get } = make({ zoom_entity: "number.camera_zoom" }, { "number.camera_zoom": { state: "unknown", attributes: { min: 0, max: 100 } } });
  assert.equal(get("zoom-range").disabled, true);
});
test("hold movement is disabled when stop is unavailable", () => {
  const { get } = make({}, { [cfg.ptz_stop]: { state: "unavailable" } });
  assert.equal(get("ptz-up").disabled, true);
});
test("preset selection finishes before the go action", async () => {
  const { card, calls } = make({ preset_entity: "select.camera_preset", preset_go_entity: "button.camera_go", center_preset: "Home" }, { "select.camera_preset": { state: "Home", attributes: { options: ["Home", "Patrol"] } } });
  await card._centerAction();
  assert.deepEqual(calls.map((c) => [c[0], c[1]]), [["select", "select_option"], ["button", "press"]]);
  assert.equal(calls[0][2].option, "Home");
});
test("service failure is handled and prevents preset go", async () => {
  const { card, calls } = make({ preset_entity: "select.camera_preset", preset_go_entity: "button.camera_go" }, { "select.camera_preset": { state: "Home", attributes: { options: ["Home"] } } });
  card._hass.callService = async () => { throw new Error("private backend details"); };
  let detail;
  card.addEventListener("ptz-control-error", (ev) => { detail = ev.detail; });
  await card._centerAction();
  assert.equal(calls.length, 0);
  assert.equal(detail.service, "select_option");
  assert.match(card.shadowRoot.querySelector(".error").textContent, /Unable to call/);
  assert.doesNotMatch(card.shadowRoot.textContent, /private backend details/);
});
test("preset buttons and center label update together", async () => {
  const { card } = make({ preset_entity: "input_select.camera_preset" }, { "input_select.camera_preset": { state: "Home", attributes: { options: ["Home", "Patrol"] } } });
  card.shadowRoot.querySelectorAll(".preset-btn")[1].click();
  await tick();
  assert.equal(card.shadowRoot.querySelector(".center-label").textContent, "Patrol");
  assert.equal(card.shadowRoot.querySelectorAll('[aria-pressed="true"]').length, 1);
});
test("zoom buttons use percent of range and clamp to bounds", () => {
  const { get, calls } = make({ zoom_entity: "number.camera_zoom", zoom_button_step_percent: 10 }, { "number.camera_zoom": { state: "195", attributes: { min: 100, max: 200, step: 5 } } });
  get("zoom-plus").click();
  assert.equal(calls.at(-1)[2].value, 200);
  get("zoom-minus").click();
  assert.equal(calls.at(-1)[2].value, 190);
});
test("external zoom state updates are reflected in the slider", () => {
  const { card, get } = make({ zoom_entity: "number.camera_zoom" }, { "number.camera_zoom": { state: "20", attributes: { min: 0, max: 100, step: 1 } } });
  card.hass = { ...card._hass, states: { ...card._hass.states, "number.camera_zoom": { state: "70", attributes: { min: 0, max: 100, step: 1 } } } };
  assert.equal(get("zoom-range").value, "70");
});
test("slider drafts survive hass updates and use the correct helper domain", () => {
  const { card, get, calls } = make({ zoom_entity: "input_number.camera_zoom" }, { "input_number.camera_zoom": { state: "20", attributes: { min: 0, max: 100, step: 1 } } });
  const range = get("zoom-range");
  range.value = "65";
  range.dispatchEvent(new window.Event("input"));
  card.hass = { ...card._hass, states: { ...card._hass.states, "input_number.camera_zoom": { state: "30", attributes: { min: 0, max: 100, step: 1 } } } };
  assert.equal(get("zoom-range"), range);
  range.dispatchEvent(new window.Event("change"));
  assert.deepEqual(calls.at(-1), ["input_number", "set_value", { entity_id: "input_number.camera_zoom", value: 65 }]);
});
test("zoom changes snap to the native step", () => {
  const { get, calls } = make({ zoom_entity: "number.camera_zoom", zoom_button_step: 7 }, { "number.camera_zoom": { state: "0", attributes: { min: 0, max: 100, step: 5 } } });
  get("zoom-plus").click();
  assert.equal(calls.at(-1)[2].value, 5);
});
test("optional panels can be hidden", () => {
  const { card, get } = make({ show_center: false, show_zoom: false, show_preset: false });
  assert.equal(get("ptz-center"), null);
  assert.equal(get("zoom-range"), null);
  assert.equal(card.getCardSize(), 4);
});

test("failed preset selection does not change the active UI", async () => {
  const { card } = make({ preset_entity: "select.camera_preset" }, { "select.camera_preset": { state: "Home", attributes: { options: ["Home", "Patrol"] } } });
  card._hass.callService = async () => { throw new Error("failure"); };
  card.shadowRoot.querySelectorAll(".preset-btn")[1].click();
  await tick();
  assert.equal(card._selectedPreset, "Home");
  assert.equal(card.shadowRoot.querySelector(".center-label").textContent, "Home");
});

test("slider blur preserves a pending zoom button click", () => {
  const { get, calls } = make({ zoom_entity: "number.camera_zoom" }, { "number.camera_zoom": { state: "20", attributes: { min: 0, max: 100, step: 1 } } });
  const button = get("zoom-plus");
  get("zoom-range").dispatchEvent(new window.Event("blur"));
  assert.equal(get("zoom-plus"), button);
  button.click();
  assert.equal(calls.at(-1)[2].value, 30);
});

test("second stop is sent after 120 milliseconds", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { get, calls } = make();
  pointer(get("ptz-up"), "pointerdown");
  pointer(window, "pointerup");
  t.mock.timers.tick(120);
  assert.equal(calls.filter((call) => call[2].entity_id === cfg.ptz_stop).length, 2);
});

test("new movement cancels the previous delayed stop", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { get, calls } = make();
  pointer(get("ptz-up"), "pointerdown");
  pointer(window, "pointerup");
  pointer(get("ptz-right"), "pointerdown", 2);
  t.mock.timers.tick(120);
  assert.equal(calls.at(-1)[2].entity_id, cfg.ptz_right);
});

test("hidden tab stops an active movement", () => {
  const { get, calls } = make();
  pointer(get("ptz-up"), "pointerdown");
  const descriptor = Object.getOwnPropertyDescriptor(document, "visibilityState");
  Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
  document.dispatchEvent(new window.Event("visibilitychange"));
  if (descriptor) Object.defineProperty(document, "visibilityState", descriptor);
  else delete document.visibilityState;
  assert.equal(calls.at(-1)[2].entity_id, cfg.ptz_stop);
});
