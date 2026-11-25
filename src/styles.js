export const styles = `
  :host { display: block; }
  ha-card { padding: 12px; border-radius: 16px; }
  .title { font-size: 16px; font-weight: 600; margin: 0 0 12px; }
  .control-layout { display: grid; gap: 10px; align-items: center; }
  .control-layout.with-zoom { grid-template-columns: minmax(228px, 2fr) minmax(64px, 1fr); }
  .ptz-pane { display: flex; justify-content: center; min-width: 0; }
  .ring { position: relative; width: 228px; height: 228px; flex-shrink: 0; border-radius: 50%; background: var(--ptz-ring-outer-bg); border: 1px solid var(--ptz-ring-outer-border); box-shadow: 0 2px 6px #0000000f; }
  .ring::before { content: ""; position: absolute; inset: 34px; border-radius: 50%; background: var(--ptz-ring-inner-bg); border: 1px solid var(--ptz-ring-inner-border); pointer-events: none; }
  .diag { position: absolute; left: 50%; top: 18%; width: 2px; height: 64%; background: var(--ptz-ring-divider); pointer-events: none; }
  .d1 { transform: translateX(-50%) rotate(45deg); }
  .d2 { transform: translateX(-50%) rotate(-45deg); }
  button { font: inherit; cursor: pointer; touch-action: none; }
  button:disabled, input:disabled { opacity: .45; cursor: not-allowed; }
  button:focus-visible, input:focus-visible { outline: 3px solid var(--primary-color, #03a9f4); outline-offset: 3px; }
  .dir-btn, .zoom-btn { width: 54px; height: 54px; border-radius: 50%; border: 1px solid var(--ptz-btn-border); background: var(--ptz-btn-bg); color: var(--ptz-btn-icon); box-shadow: 0 1px 2px #00000014; display: grid; place-items: center; padding: 0; }
  .dir-btn { position: absolute; }
  .dir-btn:hover { background: var(--ptz-btn-hover-bg); }
  .dir-btn:active { background: var(--ptz-btn-active-bg); }
  .up { top: 14px; left: 50%; transform: translateX(-50%); background: var(--ptz-btn-up-bg); border-color: var(--ptz-btn-up-border); }
  .right { top: 50%; right: 14px; transform: translateY(-50%); background: var(--ptz-btn-right-bg); border-color: var(--ptz-btn-right-border); }
  .down { bottom: 14px; left: 50%; transform: translateX(-50%); background: var(--ptz-btn-down-bg); border-color: var(--ptz-btn-down-border); }
  .left { top: 50%; left: 14px; transform: translateY(-50%); background: var(--ptz-btn-left-bg); border-color: var(--ptz-btn-left-border); }
  .center-btn { position: absolute; top: 50%; left: 50%; width: 76px; height: 76px; transform: translate(-50%, -50%); border-radius: 50%; border: 1px solid var(--ptz-center-border); background: var(--ptz-center-bg); color: var(--ptz-center-icon); display: grid; place-items: center; padding: 4px; }
  .center-btn.preset { background: var(--ptz-center-preset-bg); }
  .center-inner { display: grid; justify-items: center; gap: 2px; max-width: 66px; }
  .center-label { font-size: 11px; color: var(--ptz-center-label); max-width: 66px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .row { display: grid; gap: 8px; margin-top: 10px; }
  .label { font-size: 12px; color: var(--secondary-text-color); }
  .preset-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
  .preset-btn { border: 1px solid var(--ptz-preset-button-border); background: var(--ptz-preset-button-bg); color: var(--ptz-preset-button-text); border-radius: 999px; padding: 6px 10px; font-size: 13px; }
  .preset-btn.active { background: var(--ptz-preset-button-active-bg); border-color: var(--ptz-preset-button-active-border); color: var(--ptz-preset-button-active-text); }
  .zoom-pane { border: 1px solid var(--ptz-zoom-panel-border); border-radius: 14px; background: var(--ptz-zoom-panel-bg); display: grid; place-items: center; padding: 8px; box-sizing: border-box; min-height: 228px; }
  .zoom-control { display: grid; justify-items: center; align-items: center; gap: 8px; }
  .zoom-btn { width: 42px; height: 42px; background: var(--ptz-zoom-button-bg); border-color: var(--ptz-zoom-button-border); color: var(--ptz-zoom-button-icon); }
  .zoom-btn:hover { background: var(--ptz-zoom-button-hover-bg); }
  .zoom-btn:active { background: var(--ptz-zoom-button-active-bg); }
  .zoom-slider { writing-mode: vertical-lr; direction: rtl; width: 28px; height: 84px; accent-color: var(--ptz-zoom-slider-accent); }
  .error { color: var(--error-color, #db4437); font-size: 12px; }
  @media (max-width: 700px) {
    .control-layout.with-zoom { grid-template-columns: 1fr; }
    .zoom-pane { min-height: 0; padding: 10px; }
    .zoom-control { grid-template-columns: auto auto auto; gap: 12px; }
    .zoom-slider { writing-mode: horizontal-tb; direction: ltr; width: 120px; height: auto; }
    #zoom-minus { order: 1; } #zoom-range { order: 2; } #zoom-plus { order: 3; }
  }
`;