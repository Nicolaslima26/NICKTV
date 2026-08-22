# ONIXPLUS — Technical Audit

Audit date: 2026-08-21  
Audited upstream: `4gray/iptvnator`  
Audited revision: `df8962969e1fa167afdf68c7f1ac05d7f2357556`  
Audit scope: Phase 0 only; no product redesign or runtime refactor was performed.

## 1. Executive Summary

The audited repository is a mature, actively developed IPTV application rather than a small Angular/Electron client. It is an Nx monorepo with 48 projects (9 applications, 35 libraries, and 4 tooling projects), 3,044 tracked files, 2,097 TypeScript files, 762 unit-spec files, and 43 Playwright E2E files. The repository already implements most of the proposed ONIXPLUS MVP and several post-MVP capabilities.

The safest ONIXPLUS strategy is an incremental product fork, not a rewrite. Preserve Angular, Electron, Nx, the provider-specific stores/data sources, SQLite worker model, player engines, EPG pipeline, tests, and packaging automation. Introduce ONIXPLUS branding and provider-neutral product contracts through the existing Nx boundaries rather than adding a second parallel architecture.

The highest-priority pre-branding issue is credential storage. Xtream usernames/passwords and Stalker identity/session fields are persisted directly in the playlist record, including plaintext SQLite columns. Diagnostic redaction is strong, but at-rest protection is not. A second product decision is required for PWA: production URL imports and provider calls use a remote web backend by default, which means provider URLs and credentials transit an intermediary. Desktop Electron can remain direct-to-provider.

Local validation in this workspace is blocked before Nx discovery: the repository is located under a OneDrive path containing spaces, `electron-builder install-app-deps` attempted to rebuild `better-sqlite3`, and no Visual Studio Build Tools installation was detected. The installed pnpm was 11.19.0 while the repository pins pnpm 10.33.0, producing warnings that the manifest's security overrides and patches were ignored. See [DEVELOPMENT.md](./DEVELOPMENT.md).

Primary evidence: `package.json`, `nx.json`, `apps/web/src/app/app.config.ts`, `apps/web/src/app/app.routes.ts`, `apps/electron-backend/src/main.ts`, `libs/shared/database/src/lib/schema.ts`, and `electron-builder.json`.

## 2. Current Architecture

The runtime is split into an Angular renderer/PWA, an Electron main process, an optional Node/Express web backend, and domain libraries.

```text
Angular renderer / PWA
  ├─ workspace shell and lazy feature routes
  ├─ M3U: classic NgRx Store + Effects
  ├─ Xtream: NgRx Signal Store + runtime-selected data source
  ├─ Stalker: NgRx Signal Store + session/authentication services
  ├─ shared UI, playback, EPG, settings, and collections
  └─ DataService runtime adapter
       ├─ ElectronService -> typed preload -> IPC -> main process
       └─ PwaService -> HTTP -> web-backend

Electron main
  ├─ BrowserWindow and navigation security
  ├─ typed preload bridge
  ├─ provider/network IPC handlers
  ├─ SQLite/Drizzle and database worker
  ├─ EPG and playlist worker threads
  ├─ downloads, updates, remote control
  └─ built-in/external/native player integration
```

Nx project tags enforce `scope:*`, `domain:*`, and `type:*` boundaries. Feature projects own screens/routes, UI projects own reusable views, data-access projects own state/API/persistence, and util projects own pure contracts/helpers. This is already close to the conceptual ONIXPLUS layering.

Evidence: `docs/architecture/nx-workspace-boundaries.md`, `eslint.config.mjs`, `tsconfig.base.json`, `apps/web/src/app/app.config.ts`, and `apps/electron-backend/src/main.ts`.

## 3. Technology Stack

| Concern | Current technology | Evidence |
| --- | --- | --- |
| Workspace | Nx 22.7.8, pnpm 10.33.0 pin | `nx.json`, `package.json` |
| Frontend | Angular 21.2, standalone bootstrap, Angular Material/CDK | `apps/web/src/main.ts`, `apps/web/src/app/app.config.ts` |
| State | NgRx Store/Effects for M3U; NgRx Signals for Xtream/Stalker/settings | `libs/m3u-state`, `libs/portal/*/data-access`, `libs/services/src/lib/settings-store.service.ts` |
| Desktop | Electron 43, `nx-electron`, electron-builder | `apps/electron-backend/project.json`, `electron-builder.json` |
| Persistence | IndexedDB in PWA; SQLite + Drizzle + better-sqlite3 in Electron | `libs/shared/interfaces/src/lib/indexed-db.config.ts`, `libs/shared/database` |
| Networking | Axios in Electron/backend; Angular HttpClient in renderer | `apps/electron-backend/src/app/util/validated-axios.ts`, `apps/web-backend/src/app/web-backend-app.ts` |
| M3U | Pinned IPTVnator fork of `iptv-playlist-parser` | `package.json`, `docs/architecture/m3u-playlist-module.md` |
| EPG/XMLTV | `saxes` streaming parser in Electron; `epg-parser` in web backend | `apps/electron-backend/src/app/workers/epg-streaming-parser.ts`, `apps/web-backend/src/app/web-backend-app.ts` |
| Playback | Video.js, native HTML5/hls.js, ArtPlayer, Shaka, mpegts.js, Embedded MPV, external MPV/VLC | `libs/ui/playback`, `libs/shared/interfaces/src/lib/settings.interface.ts` |
| Tests | Jest 30, Playwright 1.62, Nx task orchestration | `jest.preset.js`, `apps/*-e2e`, `.github/workflows/ci.yml` |
| Marketing | Astro website | `apps/website/project.json` |
| Styling/i18n | SCSS, Material 3 tokens, Tailwind in selected apps, ngx-translate, 19 locale files | `apps/web/src/m3-theme.scss`, `apps/web/src/assets/i18n` |

## 4. Repository Structure

```text
apps/
  electron-backend/       Electron main, preload, IPC, DB and workers
  electron-backend-e2e/   Desktop Playwright and performance suites
  web/                    Main Angular renderer/PWA
  web-backend/            Express proxy/parser backend for PWA
  web-e2e/                Browser Playwright suite
  remote-control-web/     Mobile remote-control Angular app
  website/                Astro marketing site
  stalker-mock-server/    Deterministic Stalker development/E2E provider
  xtream-mock-server/     Deterministic Xtream development/E2E provider

libs/
  epg/                    EPG data access
  m3u-state/              M3U NgRx state/effects
  playback/               Pure playback diagnostics/contracts
  playlist/               Import, M3U route/player, playlist UI/util
  portal/                 Shared, Xtream, Stalker, downloads and catalog
  services/               Cross-cutting runtime services/settings/storage
  shared/                 Interfaces, database, logging, M3U utilities
  ui/                     Components, EPG, playback, pipes, styles
  workspace/              Shell and dashboard

tools/                    Build, packaging, release, coverage and lint tooling
docs/architecture/        Canonical subsystem documentation
.github/workflows/        CI, E2E, packaging, deployment and security workflows
```

Evidence: all `project.json` files, `pnpm-workspace.yaml`, and `docs/architecture/nx-workspace-boundaries.md`.

## 5. Application Entry Points

- Angular renderer: `apps/web/src/main.ts` registers date locales and bootstraps `AppComponent` with `appConfig`.
- Angular providers/state: `apps/web/src/app/app.config.ts` installs router, NgRx, IndexedDB, translations, service worker, runtime adapters, and provider data sources.
- Angular routes: `apps/web/src/app/app.routes.ts` lazy-loads workspace, dashboard, sources, M3U, Xtream, Stalker, favorites, history, search, downloads, and settings.
- Electron main: `apps/electron-backend/src/main.ts` creates the app, registers IPC owners, loads the renderer, initializes SQLite, and controls shutdown.
- Electron window: `apps/electron-backend/src/app/app.ts` owns BrowserWindow creation, trusted navigation, CSP-adjacent window policy, and renderer load.
- Preload bridge: `apps/electron-backend/src/app/api/main.preload.ts` exposes the typed `window.electron` API.
- PWA backend: `apps/web-backend/src/main.ts` starts the Express app implemented in `apps/web-backend/src/app/web-backend-app.ts`.
- Remote control: `apps/remote-control-web/src/main.ts`.
- Marketing site: `apps/website/src` via `apps/website/astro.config.mjs`.

## 6. IPTV Data Flow

There is no single provider-neutral `IPTVProvider` contract today. Instead, the application has mature provider-specific domains and shared normalized view/playback contracts.

```text
Import UI
  -> Playlist metadata (shared Playlist model)
  -> provider-specific runtime
       M3U    -> parsed Channel[] -> M3U NgRx store
       Xtream -> categories/content -> Signal Store + data source
       Stalker-> portal items/session -> Signal Store
  -> shared portal/M3U view models
  -> ResolvedPortalPlayback / Channel
  -> WebPlayerView or external/native player
```

The strongest existing abstraction is runtime selection, not provider selection: `DataFactory` chooses Electron or PWA, and `provideXtreamDataSource()` chooses SQLite-backed or PWA data access. Shared collection/playback contracts already exist in `libs/portal/shared/*`, `libs/playback/util`, and `libs/shared/interfaces`.

Evidence: `apps/web/src/app/app.config.ts`, `libs/portal/xtream/data-access/src/lib/data-sources/index.ts`, `libs/shared/interfaces/src/lib/portal-playback.interface.ts`, and `libs/portal/shared`.

## 7. M3U Implementation

M3U/M3U8 supports URL, text, browser file, native file dialog, OS file association, auto-refresh, custom headers, groups, favorites, recent items, EPG URLs, radio, catch-up, KODIPROP/ClearKey metadata, and VOD detection.

Electron URL/file import flows through `apps/electron-backend/src/app/events/playlist.events.ts` into `playlist-source.ts`, which fetches with a 30-second idle timeout, validates redirects, parses with `iptv-playlist-parser`, and normalizes with `createPlaylistObject`. Refresh runs in `playlist-refresh.worker.ts` so download/parse does not block the main process. Renderer file/text parsing is dynamically loaded in `PlaylistsService.handlePlaylistParsing()`.

PWA URL import uses `PwaService` and the web backend's `/provider-targets` plus `/parse` routes. Browser file import stays local through `PlaylistFileImportService` and the M3U NgRx action/effect flow.

Important parser contract: the dependency is an IPTVnator fork preserving `radio`, pipe-header stripping, and KODIPROP lines before EXTINF. The repository explicitly has no general URL validator inside the parser, because nonstandard/long provider URLs are valid inputs.

Strengths: mature parser compatibility, worker refresh, 90k-channel-oriented virtual scrolling, EPG source handling, contract tests, and large-list performance tests.

Debt: `Playlist.playlist` remains `any`; M3U state stores `Channel[]` with a TODO to adopt entity state; initial parsing still materializes the complete parsed playlist in memory; Electron and PWA URL-import paths are not identical transports.

Evidence: `docs/architecture/m3u-playlist-module.md`, `apps/electron-backend/src/app/events/playlist-source.ts`, `apps/electron-backend/src/app/workers/playlist-refresh.worker.ts`, `libs/services/src/lib/playlists.service.ts`, `libs/playlist/shared/util/src/lib/playlist-file-import.service.ts`, and `libs/m3u-state/src/lib/state.ts`.

## 8. Xtream Implementation

Xtream supports account/profile probing, live/VOD/series categories, catalog persistence, EPG, favorites, recent items, playback positions, search, details, downloads, category visibility, cancellation, connection guarding, and PWA/Electron data sources.

`XtreamApiService` produces `player_api.php` requests. Electron requests cross the preload bridge into `apps/electron-backend/src/app/events/xtream.events.ts`, where requests have a 30-second timeout, cancellation via AbortController, redirect validation, private-provider support, connectivity circuit breaking, and credential-redacted diagnostics. `ElectronXtreamDataSource` combines API reads with SQLite; `PwaXtreamDataSource` uses API/in-memory/localStorage behavior. `XtreamStore` composes focused NgRx Signal Store features.

The current implementation already behaves like a provider adapter at the data-source boundary. A new generic adapter must wrap or delegate to this code; it must not duplicate the API/store.

Evidence: `libs/portal/xtream/data-access/src/lib/services/xtream-api.service.ts`, `libs/portal/xtream/data-access/src/lib/data-sources`, `libs/portal/xtream/data-access/src/lib/stores/xtream.store.ts`, `apps/electron-backend/src/app/events/xtream.events.ts`, and `apps/electron-backend/src/app/database/operations/xtream.operations.ts`.

## 9. Stalker Implementation

Stalker/Ministra supports portal discovery, handshake/profile authentication, MAC and optional device identity fields, token caching/persistence, watchdog keep-alive, endpoint repair, live/radio/VOD/series, favorites, recent items, search, EPG, playback link creation, and mock-server coverage.

`StalkerStore` composes portal, selection, snapshot refresh, content, series, player, favorites, recent, and EPG features. `StalkerSessionService` coordinates authentication, identity fingerprints, persisted sessions, edit fences, repair discovery, and watchdog behavior. Electron network calls are owned by `stalker.events.ts`, which adds identity headers/cookies, allows LAN providers, validates protocols/redirects, applies timeouts, and redacts diagnostics.

This is a complex compatibility subsystem and should be preserved behind a facade. Its identity/session fields are sensitive and are currently stored with playlist metadata.

Evidence: `docs/architecture/stalker-portal.md`, `docs/architecture/stalker-epg.md`, `libs/portal/stalker/data-access/src/lib/stalker.store.ts`, `libs/portal/stalker/data-access/src/lib/stalker-session.service.ts`, and `apps/electron-backend/src/app/events/stalker.events.ts`.

## 10. EPG Implementation

Electron EPG is a separate pipeline: renderer `EpgService` -> `EpgRuntimeBridgeService` -> preload IPC -> `EpgWorkerService` -> worker-thread HTTP/decompression -> `StreamingEpgParser` -> batched SQLite writes -> indexed queries -> timeline/grid UI.

The streaming SAX parser normalizes XMLTV timezone offsets to UTC, processes channels/programmes in batches of 100/1,000, supports gzipped streams, reports progress, and preserves old rows until the first successful replacement batch. Query services offer scoped sources, manual mappings, batch current-program lookup, and a 60-second renderer cache. Xtream and Stalker also have provider EPG paths and XMLTV fallback/mapping logic.

PWA `/parse-xml` uses the web backend and `epg-parser`, so its implementation and memory profile differ from Electron.

Evidence: `libs/epg/data-access/src/lib/epg.service.ts`, `apps/electron-backend/src/app/events/epg-worker.service.ts`, `apps/electron-backend/src/app/workers/epg-parser.worker.ts`, `apps/electron-backend/src/app/workers/epg-streaming-parser.ts`, `apps/electron-backend/src/app/events/epg-query.service.ts`, and `libs/ui/epg`.

## 11. Player Architecture

`WebPlayerViewComponent` is the main built-in player router. It resolves a playback payload and renders Video.js, native HTML5/hls.js, ArtPlayer, or Embedded MPV. External MPV/VLC are managed in the Electron main process. Shaka handles DASH and mpegts.js handles MPEG-TS where applicable. A dedicated audio player handles `radio="true"`.

The repository has an engine-neutral shared controls contract (`PlayerController`), playback diagnostics, bounded recovery recommendations, source ownership tokens, external session lifecycle management, captions/tracks, PiP, resume positions, series navigation, custom request headers, and display-sleep inhibition. Shared web controls are still opt-in; each vendor player retains a legacy UI path.

The player is reusable but operationally complex. ONIXPLUS should reskin the shared controls and host layouts first, keep vendor engines, and avoid replacing playback engines during branding.

Evidence: `libs/ui/playback/src/lib/web-player-view`, `libs/ui/playback/src/lib/player-controls`, `libs/ui/playback/src/lib/web-video-support`, `libs/playlist/m3u/feature-player/src/lib/video-player`, `apps/electron-backend/src/app/events/player.events.ts`, and `docs/architecture/player-controls-contract.md`.

## 12. Electron Architecture

Electron follows Renderer -> Preload -> IPC -> Main. `contextIsolation` is enabled, `nodeIntegration` is disabled, `webSecurity` is enabled, and the renderer sandbox is enabled by default. The experimental Embedded MPV frame-copy mode can disable the renderer sandbox only after a packaged runtime capability gate; isolation and disabled Node integration remain.

The main process registers dedicated event modules for window, playlist, provider, EPG, database, player, settings, updates, downloads, remote control, and diagnostics. The preload surface is typed by `ElectronBridgeApi`. BrowserWindow denies new windows, restricts in-app navigation to the exact renderer origin/file, and opens approved HTTP(S) links in the system browser.

Evidence: `apps/electron-backend/src/main.ts`, `apps/electron-backend/src/app/app.ts`, `apps/electron-backend/src/app/api/main.preload.ts`, `libs/shared/interfaces/src/lib/electron-api.interface.ts`, and `docs/architecture/electron-security.md`.

## 13. Storage

Electron uses SQLite with Drizzle/better-sqlite3. A dedicated database worker owns high-volume playlist/catalog operations; EPG has its own worker/database access path. Tables include playlists, categories, content, favorites, recently viewed, playback positions, downloads, EPG channels/programs/mappings, TMDB cache, VOD source pins, and app state. Indexes and FTS-backed search support large catalogs. Migrations are code-driven and idempotent.

PWA uses one IndexedDB `playlists` object store for playlist objects and localStorage for some settings, caches, migration flags, and provider user data. Electron migrates legacy IndexedDB playlists into SQLite.

Critical gap: the SQLite `playlists` table stores `username`, `password`, MAC/portal fields, session payload, and tokens as text. The shared `Playlist` model also carries these values. There is no use of Electron `safeStorage` or an OS credential vault in the audited code.

Evidence: `libs/shared/database/src/lib/schema.ts`, `libs/shared/database/src/lib/connection.ts`, `apps/electron-backend/src/app/workers/database.worker.ts`, `libs/shared/interfaces/src/lib/indexed-db.config.ts`, `libs/shared/interfaces/src/lib/playlist.interface.ts`, and `libs/services/src/lib/playlists.service.ts`.

## 14. State Management

- M3U uses classic NgRx Store, reducers, selectors, actions, and effects in `libs/m3u-state`.
- Xtream uses a root-provided composable NgRx Signal Store in `libs/portal/xtream/data-access`.
- Stalker uses a root-provided composable NgRx Signal Store in `libs/portal/stalker/data-access`.
- Settings use a Signal Store in `libs/services/src/lib/settings-store.service.ts`.
- Shared collections and workspace/dashboard data are service/facade driven.

The mixed state styles are historical but not inherently broken. Do not force a state-management migration during the ONIXPLUS fork. A future provider-neutral facade should expose read models/commands without requiring all providers to share one store implementation.

## 15. UI Architecture

The UI uses standalone Angular components, lazy routes, Angular Material/CDK, SCSS, shared UI libraries, and responsive workspace shell/dashboard projects. Material 3 theme configuration and CSS custom properties centralize many surface, typography, selection, provider, status, and theme colors. There are 19 locale files.

Branding is still distributed across package metadata, window title, HTML metadata/splash, manifest/icons, update URLs, Docker/website content, translations, and native packaging. Some design tokens already exist, but the global theme file still contains literal brand colors and IPTVnator-specific naming.

Evidence: `apps/web/src/m3-theme.scss`, `libs/ui/styles`, `libs/ui/components`, `libs/workspace/shell/feature`, `libs/workspace/dashboard/feature`, `apps/web/src/index.html`, and `apps/web/src/assets/i18n`.

## 16. Testing

The repository has unusually broad coverage: 762 `*.spec.ts` files and 43 `*.e2e.ts` files. Unit tests cover parser contracts, stores, provider transports, persistence operations, migrations, player engines, IPC contracts, redaction, URL safety, UI components, and tooling. Playwright covers Electron and web flows, including M3U import, Xtream, Stalker, EPG, favorites, search, downloads, playback headers, backups, and packaging smoke. Dedicated M3U/Xtream performance suites exist.

CI runs workflow lint, release-note validation, lint, Nx version/patch/style checks, typecheck, i18n drift checks, tiered coverage, and non-tier-A tests. E2E and package builds are separate workflows.

Audit validation limitation: no unit/E2E/build task was run successfully in this workspace because dependency bootstrap did not complete; see Section 17 and [DEVELOPMENT.md](./DEVELOPMENT.md).

Evidence: `jest.preset.js`, `apps/web-e2e`, `apps/electron-backend-e2e`, `.github/workflows/ci.yml`, `.github/workflows/e2e-tests.yaml`, and `tools/coverage`.

## 17. Build System

Nx orchestrates Angular, Electron, Node, Astro, tests, lint, and packaging. The primary scripts are:

```text
pnpm run serve:frontend
pnpm run serve:backend
pnpm run build:frontend
pnpm run build:frontend:pwa
pnpm run build:backend
pnpm run typecheck:ci
pnpm run lint
pnpm run test:unit:ci
pnpm run make:app
```

Electron packaging targets Windows NSIS (x64/ia32), macOS DMG/ZIP (x64/arm64), and multiple Linux formats/architectures. Embedded MPV adds native build and legal/provenance complexity. Windows is already a first-class target.

Local bootstrap finding: `pnpm install --frozen-lockfile` installed package payloads but failed during `electron-builder install-app-deps`; better-sqlite3 fell back to a node-gyp build, warned about the path containing spaces, and then failed because Visual Studio was not found. A subsequent script-free install under pnpm 11 was too slow on OneDrive and was stopped. Use the pinned pnpm and a short local path.

Evidence: `package.json`, all `project.json` files, `electron-builder.json`, `.github/workflows/build-and-make.yaml`, and `tools/packaging`.

## 18. Security

Strengths:

- Hardened Electron defaults and strict navigation/window-open gates.
- Typed preload bridge; no direct Node access in Angular.
- CSP blocks objects, limits frames, and self-hosts scripts.
- Remote URL validation rejects non-HTTP(S), embedded URL credentials, unsafe private targets for strict callers, validates every redirect, and pins DNS results to mitigate rebinding.
- Cross-host or HTTPS-to-HTTP redirects strip credentials.
- Header injection scopes portal credentials to the exact stream origin and keeps them in memory.
- Structured redaction handles nested objects, URLs, query strings, headers, errors, cycles, and size limits.
- Filesystem IPC uses dialog/download-record capabilities rather than trusting arbitrary renderer paths.
- TMDB enrichment is opt-in and telemetry is not present by default.

Risks/gaps:

1. Provider secrets are plaintext at rest in SQLite/IndexedDB playlist records.
2. Stalker tokens and device identity data are persisted alongside playlist data.
3. PWA production defaults to `https://iptvnator-playlist-parser-api.vercel.app`, so remote playlist/provider data crosses an intermediary unless self-hosted runtime configuration replaces it.
4. CSP needs broad `connect-src`/`media-src` for arbitrary user providers and retains `'unsafe-inline'` for styles; this is understandable but expands the renderer attack surface.
5. Embedded MPV frame-copy can disable the renderer sandbox when explicitly enabled; the current fail-closed runtime checks must remain intact.
6. The very large preload API increases IPC review surface even though it is typed.

Evidence: `docs/architecture/electron-security.md`, `apps/electron-backend/src/app/app.ts`, `apps/electron-backend/src/app/events/url-safety.ts`, `apps/electron-backend/src/app/util/validated-axios.ts`, `libs/shared/logging/src/lib/redact-sensitive-data.ts`, `libs/shared/database/src/lib/schema.ts`, and `apps/web/src/environments/environment.prod.ts`.

## 19. Performance

The codebase already addresses large catalogs through CDK virtual scrolling, debounced lookups, SQLite indexes/FTS, result limits, lazy routes/components, database workers, M3U refresh workers, streaming EPG parsing, EPG batch queries/cache, provider pagination, request cancellation, and host connectivity circuit breakers.

Electron E2E contains deterministic M3U and Xtream benchmarks, process memory capture, renderer heartbeat probes, cancellation evidence, database worker metrics, and report contracts. This is a strong base for ONIXPLUS performance acceptance testing.

Remaining concerns: complete M3U playlists are still represented as arrays/serialized payloads, M3U parse is not a streaming parser, PWA IndexedDB objects can become large, and several broad UI/service files own expensive cross-feature orchestration. The requested 50k+ acceptance profile should reuse the existing benchmark harness rather than introduce a new one.

Evidence: `apps/electron-backend-e2e/src/performance`, `libs/ui/components/src/lib/channel-list-container`, `libs/portal/xtream/feature/src/lib/portal-channels-list`, `apps/electron-backend/src/app/workers`, and `libs/shared/database/src/lib/schema.ts`.

## 20. Technical Debt

- 65 files are grandfathered by the generated max-lines baseline, including core preload, Electron app, database connection, M3U effects/player, provider stores/services, and large UI components (`tools/eslint/max-lines-baseline.mjs`).
- `StalkerSeriesViewComponent` is over 1,700 physical lines, and several provider feature/store files remain large despite ongoing decomposition.
- `Playlist.playlist?: any` and other compatibility `any` fields weaken core contracts (`libs/shared/interfaces/src/lib/playlist.interface.ts`).
- M3U `channels: Channel[]` explicitly notes an entity-store TODO (`libs/m3u-state/src/lib/state.ts`).
- State management and persistence differ by provider/runtime; a facade is needed before a single normalized product catalog can be claimed.
- SQLite migrations are a long in-code sequence rather than versioned migration artifacts (`libs/shared/database/src/lib/connection.ts`).
- PWA and Electron have behaviorally similar but technically separate parsing/EPG/network paths.
- Shared web controls coexist with legacy player controls, increasing test and maintenance combinations.
- The `package.json` security overrides/patches depend on using the pinned pnpm. pnpm 11 warned that these fields were ignored in this audit environment.
- Branding and upstream update/release endpoints are spread across runtime, packaging, web metadata, site, Docker, and documentation.

## 21. Reusable Components

Preserve and adapt:

- Nx project boundaries, aliases, tags, and CI validation.
- Playlist import UI and `PlaylistsService` persistence orchestration.
- M3U parser fork and contract tests.
- Xtream data-source abstraction, store features, persistence, and mock server.
- Stalker session/auth/repair/watchdog subsystem and mock server.
- Streaming Electron EPG pipeline, mapping, cache, timeline/grid UI.
- `WebPlayerViewComponent`, player engines, shared controls, diagnostics, and external session lifecycle.
- SQLite schema/worker/index/search infrastructure.
- Favorites, recent/history, playback positions, dashboard rails, downloads, and unified collections.
- Electron security, redaction, URL validation, filesystem capability patterns.
- Test, performance, packaging, release-note, and documentation tooling.
- Material/CSS token theme foundation and shared UI components.

## 22. Components That Should Be Replaced

Replace incrementally, not wholesale:

- Plaintext secret persistence -> a credential-reference model backed by Electron `safeStorage` or an OS credential vault, with migration and PWA-specific policy.
- Direct production PWA dependency on the IPTVnator Vercel backend -> ONIXPLUS-owned self-hosted configuration, local-only flows where possible, or an explicit user privacy choice.
- IPTVnator branding metadata/assets/update endpoints -> ONIXPLUS equivalents while retaining MIT notices and factual upstream attribution.
- Untyped playlist payload fields -> discriminated provider metadata and normalized read models, introduced compatibly.
- Large baselined owners -> gradual extraction behind existing public APIs, only when touched by product work.
- Dual legacy/shared player chrome -> converge on shared controls after parity and regression coverage are proven.

Do not replace Angular, Electron, Nx, SQLite, provider transports, or player engines during the initial fork.

## 23. Proposed ONIXPLUS Architecture

Use the existing physical layout and add a thin product layer:

```text
ONIXPLUS product shell
  ├─ brand tokens/assets/metadata
  ├─ workspace routes and screens
  └─ provider-neutral catalog facades/read models
       ├─ M3U facade -> existing M3U NgRx + PlaylistsService
       ├─ Xtream facade -> existing XtreamStore/data source
       └─ Stalker facade -> existing StalkerStore/session services

Shared playback contract
  -> existing ResolvedPortalPlayback / Channel adapters
  -> existing WebPlayerView / Embedded MPV / MPV / VLC

Storage ports
  ├─ Electron: SQLite + secure credential store
  └─ PWA: IndexedDB + explicitly documented credential/privacy policy
```

Rules:

1. Keep provider-specific API models at provider boundaries.
2. Normalize only the read models required by shared ONIXPLUS screens.
3. Store a provider/source ID in every favorite/history/playback identity.
4. Keep browser-neutral logic outside Electron and keep IPC contracts typed.
5. Add secure secret references before changing playlist schemas broadly.
6. Reuse existing `libs/portal/shared`, `libs/playback/util`, and `libs/shared/interfaces` rather than creating a disconnected `libs/iptv-core` tree.

## 24. Migration Plan

1. **Phase 0 acceptance:** review this audit and resolve the four decisions in [DECISIONS.md](./DECISIONS.md).
2. **Fork preparation:** choose final app IDs, repository/update URLs, distribution owner, and attribution wording; keep upstream notices.
3. **Credential protection spike:** define Electron secure-storage threat model, migration/rollback, backup behavior, and PWA limitations before branding release data is created.
4. **Branding inventory:** change name/assets/package metadata through a documented matrix; keep functionality unchanged.
5. **Design tokens:** extend the existing Material/CSS variable system; do not redesign provider flows yet.
6. **Playlist manager:** adapt existing recent/sources/import/edit/refresh components into the ONIXPLUS experience.
7. **Provider-neutral facades:** introduce normalized read models only for screens that genuinely aggregate providers.
8. **Player skin:** move default behavior toward shared controls after compatibility checks across HTML5, Video.js, ArtPlayer, and Embedded MPV.
9. **Performance/security gates:** reuse existing benchmarks/E2E, add secure-storage migration tests, and define 1k/5k/10k/50k acceptance budgets.
10. **Windows release:** build/sign/package Windows first; keep other upstream targets supported but not release-blocking until ONIXPLUS CI credentials and artifacts are ready.

## 25. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Plaintext provider credentials and tokens at rest | Critical | Secure credential-reference design before distributing ONIXPLUS builds |
| PWA intermediary receives provider requests/credentials | High | Decide desktop-first vs self-hosted backend; disclose and make configurable |
| Branding changes miss upstream update/URL/package locations | High | Maintain a branding inventory and automated grep/metadata tests |
| Breaking mature provider compatibility with a generic adapter rewrite | High | Wrap existing stores/data sources; normalize only at view boundaries |
| Native Windows toolchain fails in paths with spaces/OneDrive | High | Short non-synced path, pinned pnpm, VS Build Tools, clean bootstrap |
| Embedded MPV native/legal packaging complexity | High | Preserve fail-closed gates and existing packaging workflows |
| Large baselined files slow safe changes | Medium | Incremental extraction with tests; never combine with branding work |
| Electron/PWA behavior divergence | Medium | Document capability matrix and test both paths for shared features |
| Parser fork or pnpm patches drift | Medium | Keep contract tests and pinned package manager; validate patches in CI |
| Trademark/copyright confusion | High | Replace name/logo; retain MIT notice and upstream attribution |
| External providers are unreliable/nonstandard | Inherent | Preserve timeouts, retry limits, diagnostics, circuit breakers, and mocks |

## 26. Recommended Next Steps

Do not start redesign implementation until these decisions are approved:

1. Confirm desktop-first Windows as the initial release target and whether PWA remains in the first ONIXPLUS release.
2. Approve a secure credential-storage spike as the first code change.
3. Choose ONIXPLUS application IDs, repository/update ownership, and final name spelling.
4. Decide whether the production PWA may use any intermediary; default recommendation is no intermediary owned by ONIXPLUS for desktop, and self-hosted/explicitly configured backend for PWA.
5. Move the worktree to a short non-OneDrive path without spaces, enable Corepack/pnpm 10.33.0, install Visual Studio Build Tools with Desktop C++ workload, and run the validation ladder in [DEVELOPMENT.md](./DEVELOPMENT.md).
6. After those decisions, perform Phase 1 as small, separately validated changes: metadata/attribution first, secure storage second, branding assets third, UI tokens fourth.

AUDIT COMPLETE. No Phase 1 runtime or redesign work has been started.
