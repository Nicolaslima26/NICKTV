# ONIXPLUS — Architecture Decision Records

## ADR-001 — Preserve Angular, Electron, and Nx

Status: Accepted

Context: The audited IPTVnator snapshot is a mature Nx monorepo with Angular renderer/PWA, Electron main process, provider libraries, extensive tests, and cross-platform packaging.

Decision: Keep Angular + Electron + Nx for the initial ONIXPLUS fork.

Reason: Replacing the framework would discard mature provider, player, storage, security, test, and packaging behavior without advancing the MVP.

Consequence: ONIXPLUS inherits the existing runtime and native-build complexity, but migration risk stays bounded.

Evidence: `package.json`, `nx.json`, `apps/web/project.json`, `apps/electron-backend/project.json`.

## ADR-002 — Extend existing provider domains instead of creating a parallel IPTV Core

Status: Accepted

Context: M3U, Xtream, and Stalker already have different, mature state/data-access implementations. Shared collection and playback contracts already exist.

Decision: Add provider-neutral ONIXPLUS facades/read models only where shared screens need them. Delegate to the existing provider stores/data sources.

Reason: A new generic provider implementation would duplicate authentication, compatibility, caching, persistence, cancellation, and error handling.

Consequence: Provider internals remain heterogeneous; product-facing screens can still converge through small normalized contracts.

Evidence: `libs/m3u-state`, `libs/portal/xtream/data-access`, `libs/portal/stalker/data-access`, `libs/portal/shared`, `libs/shared/interfaces/src/lib/portal-playback.interface.ts`.

## ADR-003 — Keep SQLite for Electron and IndexedDB for PWA initially

Status: Accepted

Context: Electron already has indexed SQLite storage, migrations, a database worker, EPG tables, and performance tests. PWA already has IndexedDB/localStorage paths.

Decision: Do not migrate databases during fork preparation or branding.

Reason: Storage replacement is not required for the MVP and would create broad regression risk.

Consequence: Runtime capability differences must stay documented and tested.

Evidence: `libs/shared/database`, `libs/shared/interfaces/src/lib/indexed-db.config.ts`, `libs/services/src/lib/playlists.service.ts`.

## ADR-004 — Protect provider credentials before public distribution

Status: Proposed — approval required

Context: Xtream usernames/passwords and Stalker identity/session fields are persisted in playlist records, including plaintext SQLite text columns.

Decision: Replace secret fields in general playlist storage with secret references backed by an Electron secure-storage design. Define a separate, explicit PWA policy.

Reason: Log redaction does not protect data at rest, backups, or local database copies.

Consequence: Requires schema/API migration, rollback behavior, backup/restore rules, and tests before a ONIXPLUS release. Electron `safeStorage` and OS vault trade-offs must be investigated in a focused spike.

Evidence: `libs/shared/database/src/lib/schema.ts`, `libs/shared/interfaces/src/lib/playlist.interface.ts`, `libs/services/src/lib/playlists.service.ts`.

## ADR-005 — Desktop-first Windows release

Status: Proposed — approval required

Context: Windows is the requested primary development platform; upstream already supports NSIS and Windows native playback. PWA uses a web backend intermediary for remote provider access.

Decision: Make Electron/Windows the first ONIXPLUS release gate. Preserve PWA code, but do not promise it in the first release until its privacy/deployment model is approved.

Reason: This provides the direct user -> player -> provider topology and reduces initial deployment/security scope.

Consequence: PWA remains buildable but may not be a launch deliverable.

Evidence: `electron-builder.json`, `apps/web/src/environments/environment.prod.ts`, `apps/web-backend/src/app/web-backend-app.ts`.

## ADR-006 — No shared production proxy by default for ONIXPLUS

Status: Proposed — approval required

Context: The upstream PWA production configuration points to an IPTVnator-hosted Vercel parser/proxy. Xtream credentials and provider URLs can transit that backend.

Decision: ONIXPLUS should use direct Electron provider calls; PWA should require self-hosted or explicitly configured backend ownership unless a separate privacy decision approves a shared service.

Reason: This aligns with the no-intermediary privacy principle and zero initial infrastructure cost.

Consequence: Hosted PWA convenience is reduced; self-hosting documentation becomes mandatory.

Evidence: `apps/web/src/environments/environment.prod.ts`, `apps/web-backend/src/app/web-backend-app.ts`, `docs/architecture/pwa-self-hosted.md`.

## ADR-007 — Preserve MIT notice and replace IPTVnator branding

Status: Accepted

Context: Source is MIT-licensed, while the IPTVnator name/logo are explicitly reserved by the upstream trademark notice.

Decision: Keep required copyright/license notices and factual upstream attribution. Replace the application name, logo, icon, app IDs, metadata, update endpoints, and distributable branding before release.

Reason: License compliance and product identity both require this separation.

Consequence: Branding must be an inventory-driven migration, not a blind search/replace.

Evidence: `LICENSE.md`, `TRADEMARK.md`, `electron-builder.json`, `apps/web/src/index.html`, `apps/electron-backend/src/main.ts`.

## ADR-008 — Separate fork preparation from distributable branding

Status: Accepted

Context: Product identity is spread across package metadata, application IDs, icons, translations, native resources, update publishing, workflows, Docker, and website content. Phase 1 inventoried these surfaces before the owner supplied the final ONIXPLUS identity.

Decision: Phase 1 established ONIXPLUS documentation, attribution, setup, feature-preservation baseline, and the branding migration matrix. Phase 2 applied product metadata and assets as one separately validated change set.

Reason: Partially changing the name while leaving upstream updater URLs, icons, or native IDs would create a misleading and unsafe distributable.

Consequence: Phase 2 applied the confirmed ONIXPLUS name, artwork, palette, application ID, repository, and update metadata as one validated change set. Release blockers unrelated to visual identity remain tracked separately.

Evidence: `README.md`, `docs/BRANDING.md`, `package.json`, `electron-builder.json`, `apps/web/src/index.html`, `apps/web/src/manifest.webmanifest`.

## ADR-009 — Keep upstream remote and use the ONIXPLUS repository as origin

Status: Accepted

Context: The worktree retains `https://github.com/4gray/iptvnator.git` as `upstream`, and the owner supplied `https://github.com/Nicolaslima26/NICKTV.git` for ONIXPLUS.

Decision: Preserve `upstream` for synchronization and configure the supplied ONIXPLUS repository as `origin`.

Reason: Explicit remote roles keep upstream synchronization separate from ONIXPLUS publishing.

Consequence: Branches and release metadata can target the ONIXPLUS-owned repository without changing the upstream source remote. No branch was pushed as part of the branding change.

Evidence: local Git remote configuration, `README.md`, `docs/SETUP.md`, `docs/BRANDING.md`.

## ADR-010 — Adopt the ONIXPLUS identity while preserving internal compatibility keys

Status: Accepted

Context: The owner confirmed the ONIXPLUS name, supplied original logo and icon artwork, defined the eight-color purple palette, and provided the repository destination. Some internal `iptvnator` profile/storage identifiers and `@iptvnator/*` aliases are part of data continuity or Nx architecture rather than user-visible branding.

Decision: Use ONIXPLUS for every public product surface, `onixplus` for package/executable names, `com.nicolaslima26.onixplus` for the application ID, and the supplied palette through centralized `--app-*` theme tokens. Retain internal compatibility identifiers until a separately designed data migration can replace them safely.

Reason: This establishes an independent product identity without silently creating a fresh profile or breaking workspace imports.

Consequence: A source scan will still find intentional internal/upstream references. Each must remain attributable, architectural, or migration-related; new user-facing copy must say ONIXPLUS.

Evidence: `package.json`, `electron-builder.json`, `apps/web/src/m3-theme.scss`, `apps/web/src/assets/branding`, `docs/BRANDING.md`.
