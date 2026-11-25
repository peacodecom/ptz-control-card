# Validation record

## 0.1.1 — preset availability fix

Checked on 2026-11-25 with Node.js 24.22.3:

- `npm ci`: passed.
- `RELEASE_TAG=v0.1.1 npm run check`: passed (ESLint, **41 tests**, release build).
- `npm audit --audit-level=low`: **0 reported vulnerabilities** at check time.
- Six preset regression tests cover unknown current presets with valid options
  for select and input-select entities, missing options, unavailable entities with
  cached options, invalid fixed center targets and availability recovery.
- Before the fix, four of these new tests reproduced the disabled-button bug.
  All six pass with the fix.

The root cause was confirmed with read-only Home Assistant state inspection:
preset command entities reported `unknown` while exposing valid preset options.
Rendering the fixed card against the live state snapshots of four affected
preset entities enabled both their valid center targets and all preset buttons.
No physical camera commands were sent as part of these checks.

## 0.1.0 — initial preparation and publication

Checked on 2026-11-25 with Node.js 24.22.3:

- Clean dependency installation with `npm ci`: passed.
- ESLint through `npm run lint`: passed.
- Automated tests through `npm test`: **35 passed, 0 failed**.
- Release-tagged check with `RELEASE_TAG=v0.1.0 npm run check`: passed.
- `npm audit --audit-level=low`: **0 reported vulnerabilities** at check time.
- Generated single-file bundle: loaded successfully in Happy DOM, including
  repeated loading without duplicate custom-element registration.
- Complete MIT license, version and publisher included in the generated bundle.
- Mismatched release tag rejected by the build test.

The test suite covers configuration validation, service routing, escaped labels,
movement lifecycle, cancellation, keyboard operation, direction switching,
delayed stops, never-pressed buttons, unavailable entities, preset sequencing and
failures, zoom limits/steps, external updates and slider interaction.

After publication, GitHub CI, HACS plugin validation and release packaging passed.
The public JavaScript asset matched the tested local build and its SHA256 checksum.
The maintainer confirmed Marketplace installation and basic operation, then
reported the preset regression addressed in 0.1.1. This is not a claim that all
camera features or failure scenarios have been tested.

## Still requiring validation

- Real camera hardware, physical motion limits and device-side motion timeout.
- Mobile touch devices, visual themes and broader browser compatibility.
- Marketplace update and real-device preset operation after the 0.1.1 fix.

Marketplace instructions were checked against the official
[Home Assistant documentation](https://www.home-assistant.io/integrations/marketplace/)
on 2026-11-25, including **Add from link**, Dashboard content, automatic resource
registration, YAML-managed resources and the `/local/community/` resource prefix.
Documentation review is not an end-to-end installation test.

These checks are required before claiming a hardware-tested public release.
Dependency advisories and browser/device compatibility can change after this record.
