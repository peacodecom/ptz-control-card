# Contributing

Use English for code, issues and pull requests. Keep English and German user
documentation synchronized when behavior changes.

## Setup and checks

Use Node.js 24 LTS and npm. No Home Assistant credentials or running instance are
needed for the automated checks.

```sh
npm ci
npm run check
```

- `npm test`: Node.js tests with Happy DOM and mocked Home Assistant actions.
- `npm run lint`: ESLint.
- `npm run build`: bundles `src/` into `dist/ptz-control-card.js` with license notice.
- `npm audit`: dependency security advisories.

Commit the lockfile when dependencies change. No runtime dependency is bundled.
Generated files in `dist/` are release artifacts, not source-controlled files.

## Manual validation

Use a separate test dashboard. Check mouse, touch and keyboard controls; movement
release, cancellation, tab hiding, switching direction and card removal; presets;
zoom limits; unavailable entities; light/dark themes; narrow and wide layouts.
Verify real camera behavior and camera-side motion timeouts before a release.
Never treat browser-side stop handling as a safety guarantee.

Do not commit credentials, camera URLs, `.storage`, databases, private deployment
instructions or unredacted logs. Keep changes focused and add regression tests.
See [release instructions](docs/releasing.md) for publishing.
