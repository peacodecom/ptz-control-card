# Releasing

Target repository: <https://github.com/peacodecom/ptz-control-card>.
Creating this project locally does not create a public repository or release.

## First publication

1. Create a **public**, empty GitHub repository named `ptz-control-card` under
   `peacodecom`. Do not generate conflicting README/license files on GitHub.
2. Set description to “Pan, tilt, zoom and preset controls for Home Assistant dashboards”.
   Set topics: `home-assistant`, `lovelace`, `lovelace-card`, `hacs`, `ptz`, `camera`.
3. Enable Issues, GitHub Actions and private vulnerability reporting. Protect
   `main` as appropriate. Review Actions permissions before enabling workflows.
4. Push the reviewed initial commit on `main`. The local repository may have no
   commits yet; review `git status` before committing. Only include this project.
5. CI's HACS job may fail before the first release asset exists. Publish the first
   release, wait for the release workflow and rerun CI afterwards. Do not suppress
   release validation to work around missing assets.

## Each release

1. Update `package.json` and the lockfile version together. Add release notes under
   `docs/releases/`. Keep manual-install examples current.
2. Run `npm ci`, `npm run check` and `npm audit`. Verify the generated JavaScript
   contains the complete MIT notice, version, author and publisher.
3. Review the diff and verify that no private entity names, camera URLs, secrets,
   `.storage` files or deployment documentation are included.
4. Complete and record real-camera/browser testing, or clearly document what
   remains untested. Automated DOM tests alone do not establish hardware safety.
5. Commit, push and create a tag matching the package version, e.g. `v0.1.0`.
6. Publish the GitHub release using the corresponding release notes. **Publishing
   the release triggers the build.** It is not triggered by ordinary branch pushes.
7. The workflow reruns all checks, verifies tag/version agreement and attaches
   `ptz-control-card.js`, `LICENSE` and `SHA256SUMS.txt`.
8. Verify the assets and checksum, then test Marketplace installation by link
   (Home Assistant 2026.11+) and the documented legacy HACS installation path.
   The content type is Dashboard; HACS category is `plugin`.
   Marketplace-managed resources use `/local/community/`; YAML-managed resources
   must be added using the path shown by the install dialog. Only then announce availability.

GitHub Actions permissions are read-only by default; only the release job receives
`contents: write`. Re-running that job intentionally replaces same-named assets.
No npm publication, deployment to Home Assistant or default-store submission is
performed by these workflows. Keep `private: true` in the package metadata: this
prevents accidental npm publication, not public GitHub distribution.
