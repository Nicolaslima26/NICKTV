# ONIXPLUS Changelog

## Unreleased

### Added

- Phase 0 technical audit for upstream revision `df8962969e1fa167afdf68c7f1ac05d7f2357556`.
- ONIXPLUS architecture and development baselines.
- Portuguese command guide for baseline, manual, unit, build, and E2E validation.
- Initial architecture decision records covering framework preservation, provider facades, storage, credential security, release target, PWA privacy, and attribution.
- Phase 1 fork-preparation README with explicit upstream attribution and distribution warning.
- Windows setup and troubleshooting guide.
- Branding migration matrix and required ownership decisions for Phase 2.
- Existing-feature preservation checklist.
- ONIXPLUS logo, app icon, favicon, web splash assets, and website social artwork.

### Changed

- Documented the two-process frontend development startup: Angular on port 4200 and the local backend on port 3000.
- Applied the confirmed ONIXPLUS name, purple palette, application ID, executable metadata, translations, repository links, and updater destination.
- Configured `Nicolaslima26/NICKTV` as the ONIXPLUS origin while retaining the original project as `upstream`.

### Security

- Documented plaintext provider credential/session storage as a release-blocking risk.
- Documented the production PWA intermediary as a privacy decision requiring explicit approval.

### Known Issues

- Native dependency bootstrap is not validated in the current OneDrive path with spaces; better-sqlite3 rebuild requires a suitable Windows native toolchain when no prebuild is used.
