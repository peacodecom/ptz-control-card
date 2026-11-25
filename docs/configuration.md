# Configuration reference

[Deutsch](configuration.de.md) · [README](../README.md)

Entity names below are examples, not device-specific defaults. The card sends
Home Assistant actions using the current user's permissions.

## Controls

| Option | Default | Description |
| --- | --- | --- |
| `type` | required | `custom:ptz-control-card` |
| `title` | `PTZ Control` | Card heading; empty string hides the text. |
| `ptz_left` | required | `button.*`, `input_button.*` or `script.*` triggered for left. |
| `ptz_up` | required | Entity triggered for up; same supported domains as `ptz_left`. |
| `ptz_right` | required | Entity triggered for right; same supported domains as `ptz_left`. |
| `ptz_down` | required | Entity triggered for down; same supported domains as `ptz_left`. |
| `ptz_stop` | conditional | Same domains. Required in hold mode, or when a visible center button has no preset entity. |
| `hold_mode` | `true` | Start on press, stop on release. `false`: one action per click. |
| `show_center` | `true` | Show the center button. |
| `preset_entity` | none | `select.*` or `input_select.*` providing preset options. |
| `show_preset` | `true` | Show preset selection buttons. Does not disable a configured preset center action. |
| `center_preset` | selected preset | Exact preset option recalled by the center button. |
| `preset_go_entity` | none | Optional button/input_button/script invoked by the center button after successful preset selection. |
| `zoom_entity` | none | `number.*` or `input_number.*` providing zoom value and range. |
| `show_zoom` | `true` | Show zoom controls when a zoom entity is configured. |
| `zoom_button_step` | `10` | Positive absolute button increment; at least the native entity step. |
| `zoom_button_step_percent` | none | Positive percentage of `(max - min)`; takes precedence over absolute increment. |
| `icon_up` | `mdi:pan-up` | Up button icon. |
| `icon_right` | `mdi:pan-right` | Right button icon. |
| `icon_down` | `mdi:pan-down` | Down button icon. |
| `icon_left` | `mdi:pan-left` | Left button icon. |
| `icon_stop` | `mdi:stop` | Stop icon. |
| `icon_center` | automatic | Center icon; defaults to `mdi:crosshairs-gps` with presets, otherwise `icon_stop`. |
| `text_center` | preset name or empty | Custom center text. Empty string suppresses the label. |

Missing or unavailable entities are disabled, as are unknown select/number/script
states. Buttons with an `unknown` last-pressed timestamp remain usable: they may
simply never have been pressed. Button entities use their domain's
`press` action, scripts use `script.turn_on`. Helpers use `input_select.select_option`
or `input_number.set_value`; regular entities use `select.select_option` or
`number.set_value`. A script launch is not awaited until the script finishes;
movement and stop scripts must be independently executable.

Zoom values are clamped to the entity's range and rounded to the native step.
Slider changes are sent on commit, not for every intermediate drag position.
Zoom buttons use normal click semantics, including keyboard activation.

With hold mode, focus a direction button and hold **Space** or **Enter**; release
to stop. Pointer release/cancellation, focus loss and hidden tabs also attempt to
stop. The second stop is sent after 120 ms unless a new direction is held. Center
clicks within 350 ms of releasing a direction are ignored to avoid touch follow-ups.
These measures cannot guarantee delivery; see the README's safety limitations.

## Colors

All values are CSS colors/backgrounds, including `var(...)`, `rgba(...)` and
gradients where a background is used. Values are assigned as CSS custom properties,
not inserted as HTML. Defaults retain the original light gray/blue design.

| Option | Default | What it changes |
| --- | --- | --- |
| `color_ring_outer_bg` | `transparent` | Outer circular control area's background. |
| `color_ring_outer_border` | `transparent` | Outer circle's outline. |
| `color_ring_inner_bg` | `rgba(255, 255, 255, 0.6)` | Inner circle's background behind the center button. |
| `color_ring_inner_border` | `rgba(120, 130, 145, 0.35)` | Inner circle's outline. |
| `color_ring_divider` | `rgba(120, 130, 145, 0.26)` | Diagonal dividing lines inside the ring. |
| `color_button_bg` | Light gray gradient `#f7f8fa` → `#e9edf2` | Base background for direction buttons without an individual override. |
| `color_button_hover_bg` | Gray gradient `#eef2f6` → `#e2e7ed` | Direction-button background on hover. |
| `color_button_active_bg` | `#dce2e9` | Direction-button background while pressed. |
| `color_button_border` | `rgba(120, 130, 145, 0.35)` | Base outline for direction buttons. |
| `color_button_icon` | `#6c737d` | All direction-button icons. |
| `color_button_up_bg` | Blue gradient `#f2f7ff` → `#e3edff` | Up button's resting background. |
| `color_button_right_bg` | Inherit `color_button_bg` | Right button's resting background. |
| `color_button_down_bg` | Inherit `color_button_bg` | Down button's resting background. |
| `color_button_left_bg` | Inherit `color_button_bg` | Left button's resting background. |
| `color_button_up_border` | Inherit `color_button_border` | Up button's outline. |
| `color_button_right_border` | Inherit `color_button_border` | Right button's outline. |
| `color_button_down_border` | Inherit `color_button_border` | Down button's outline. |
| `color_button_left_border` | Inherit `color_button_border` | Left button's outline. |
| `color_center_bg` | `#8a8d92` | Center-button background in stop mode. |
| `color_center_border` | `rgba(63, 127, 170, 0.7)` | Center-button outline in both modes. |
| `color_center_preset_bg` | `#3f7faa` | Center-button background in preset mode. |
| `color_center_icon` | `#fff` | Center-button icon. |
| `color_center_label` | `#fff` | Text below the center-button icon. |
| `color_preset_button_bg` | `rgba(120, 130, 145, 0.12)` | Unselected preset-button background. |
| `color_preset_button_border` | `rgba(120, 130, 145, 0.28)` | Unselected preset-button outline. |
| `color_preset_button_text` | `var(--primary-text-color)` | Unselected preset-button text. |
| `color_preset_button_active_bg` | `rgba(79, 143, 183, 0.2)` | Selected preset-button background. |
| `color_preset_button_active_border` | `rgba(79, 143, 183, 0.55)` | Selected preset-button outline. |
| `color_preset_button_active_text` | `var(--primary-text-color)` | Selected preset-button text. |
| `color_zoom_panel_bg` | `transparent` | Zoom panel's background. |
| `color_zoom_panel_border` | `transparent` | Zoom panel's outline. |
| `color_zoom_button_bg` | Light gray gradient `#f7f8fa` → `#e9edf2` | Zoom buttons' resting background. |
| `color_zoom_button_hover_bg` | Gray gradient `#eef2f6` → `#e2e7ed` | Zoom-button background on hover. |
| `color_zoom_button_active_bg` | `#dce2e9` | Zoom-button background while pressed. |
| `color_zoom_button_border` | `rgba(120, 130, 145, 0.35)` | Zoom-button outline. |
| `color_zoom_button_icon` | `#3f7faa` | Zoom-button icons. |
| `color_zoom_slider_accent` | `#3f7faa` | Zoom slider's accent color. |

Gradient defaults run vertically from top to bottom (`linear-gradient(180deg, …)`).
Individual direction backgrounds apply at rest; shared hover/active backgrounds
take over during those interactions.

Example overrides:

```yaml
color_ring_inner_bg: var(--card-background-color)
color_button_icon: var(--primary-text-color)
color_center_preset_bg: var(--primary-color)
color_zoom_slider_accent: var(--primary-color)
```

## Diagnostics

Failed Home Assistant calls show a generic message inside the card and emit a
bubbling, composed `ptz-control-error` DOM event with `message`, `domain` and
`service` fields. Raw backend errors are not displayed. Check that the entity
exists, is available and can be operated through Home Assistant's Developer Tools.