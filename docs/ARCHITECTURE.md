# ONIXPLUS — Architecture Baseline

Status: Phase 0 baseline  
Audited revision: `df8962969e1fa167afdf68c7f1ac05d7f2357556`

The ONIXPLUS fork should preserve the current Angular + Electron + Nx architecture and evolve it incrementally. The authoritative audit is [ONIXPLUS-TECHNICAL-AUDIT.md](./ONIXPLUS-TECHNICAL-AUDIT.md).

Fork setup, branding boundaries, and the preservation baseline are maintained in [SETUP.md](./SETUP.md), [BRANDING.md](./BRANDING.md), and [EXISTING-FEATURES.md](./EXISTING-FEATURES.md).

## Runtime Topology

```text
Angular UI/PWA
  -> provider-specific state and data access
  -> shared catalog/playback contracts
  -> runtime adapter
       -> Electron preload/IPC/main/SQLite/workers
       -> PWA web backend/IndexedDB
```

The renderer entry point is `apps/web/src/main.ts`; routes and runtime providers are in `apps/web/src/app/app.routes.ts` and `apps/web/src/app/app.config.ts`. The Electron entry point is `apps/electron-backend/src/main.ts`; the security-sensitive BrowserWindow owner is `apps/electron-backend/src/app/app.ts`.

## Domain Ownership

- M3U state: `libs/m3u-state`; import/player features: `libs/playlist`.
- Xtream: `libs/portal/xtream` plus Electron request/persistence owners.
- Stalker: `libs/portal/stalker` plus Electron request owners.
- Shared provider collections: `libs/portal/shared`.
- EPG: `libs/epg`, `libs/ui/epg`, and Electron EPG workers/events.
- Playback: `libs/playback/util`, `libs/ui/playback`, and Electron player events/services.
- Persistence/contracts: `libs/shared/database`, `libs/shared/interfaces`, and `libs/services`.
- Shell/dashboard: `libs/workspace`.

The canonical Nx placement and dependency rules remain in `docs/architecture/nx-workspace-boundaries.md` and must not be weakened for ONIXPLUS work.

## ONIXPLUS Evolution Rule

Do not create a second provider stack. Provider-neutral ONIXPLUS facades should delegate to the existing M3U NgRx store, Xtream Signal Store/data sources, and Stalker Signal Store/session services. Normalized models should be added only for shared product views and should retain the source/playlist identity.

## Security Boundary

Renderer -> typed preload -> validated IPC -> main process remains mandatory. Direct Node access in Angular is forbidden. Before distribution, playlist rows must stop being the authoritative plaintext store for Xtream passwords and Stalker session secrets. See [DECISIONS.md](./DECISIONS.md).

## Canonical Subsystem Documentation

- `docs/architecture/electron-security.md`
- `docs/architecture/m3u-playlist-module.md`
- `docs/architecture/sqlite-db-worker.md`
- `docs/architecture/stalker-portal.md`
- `docs/architecture/stalker-epg.md`
- `docs/architecture/xtream-portal-compatibility.md`
- `docs/architecture/player-controls-contract.md`
- `docs/architecture/workspace-shell.md`
- `docs/architecture/workspace-dashboard.md`

This file is a ONIXPLUS index and does not replace those implementation contracts.
