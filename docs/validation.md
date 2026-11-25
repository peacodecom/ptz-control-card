# Validation record — 0.1.0 preparation

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

## Not validated yet

- Real camera hardware, physical motion limits and device-side motion timeout.
- Actual Home Assistant browser session, mobile touch devices and visual themes.
- GitHub-hosted workflows and Marketplace/HACS installation from a published release.

Marketplace instructions were checked against the official
[Home Assistant documentation](https://www.home-assistant.io/integrations/marketplace/)
on 2026-11-25, including **Add from link**, Dashboard content, automatic resource
registration, YAML-managed resources and the `/local/community/` resource prefix.
Documentation review is not an end-to-end installation test.

These checks are required before claiming a hardware-tested public release.
Dependency advisories and browser/device compatibility can change after this record.
