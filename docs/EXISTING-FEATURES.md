# ONIXPLUS — Existing Features Baseline

This checklist records mature behavior inherited from the audited IPTVnator revision `df8962969e1fa167afdf68c7f1ac05d7f2357556`. ONIXPLUS changes must preserve these capabilities unless a removal is separately justified, documented, and tested.

## Sources and Playlists

- [x] Multiple playlists/sources.
- [x] M3U/M3U8 URL, local file, raw text, and OS file-association import.
- [x] Xtream Codes sources.
- [x] Stalker/Ministra portals.
- [x] Custom request headers and user agent.
- [x] Playlist editing, refresh, deletion, and startup refresh.
- [x] Provider mock servers for deterministic development/testing.

## Catalog and Organization

- [x] Live TV, radio, VOD, and series.
- [x] Groups/categories, search, sorting, and pagination where supported.
- [x] Per-source and global favorites.
- [x] Recently viewed/history and playback positions.
- [x] Continue-watching and dashboard rails.
- [x] Global search in the desktop runtime.
- [x] Opt-in TMDB metadata enrichment.

## EPG

- [x] XMLTV download and parsing.
- [x] Gzip support and timezone normalization.
- [x] Channel mapping and provider EPG integration.
- [x] Timeline and multi-channel grid.
- [x] Current/next programme data.
- [x] Catch-up/time-shift integration where supported.

## Playback

- [x] HTML5/hls.js, Video.js, and ArtPlayer.
- [x] Shaka Player for DASH/ClearKey paths.
- [x] mpegts.js for compatible MPEG-TS sources.
- [x] External MPV/VLC and platform-specific external paths.
- [x] Experimental Embedded MPV capability gates.
- [x] Dedicated radio/audio player.
- [x] Play/pause, volume, mute, seek, fullscreen, captions, tracks, and PiP where supported.
- [x] Resume positions and series navigation.
- [x] Playback diagnostics and user-selected recovery actions.

## Storage and Desktop

- [x] SQLite/Drizzle storage and worker-owned high-volume operations in Electron.
- [x] IndexedDB/localStorage paths in the browser runtime.
- [x] Database migrations, indexes, and catalog search.
- [x] Downloads for supported desktop VOD/series content.
- [x] Desktop updater and remote control.
- [x] Windows, macOS, and Linux packaging definitions.
- [x] PWA/Docker self-hosting path.

## UX and Accessibility Baseline

- [x] Standalone Angular routes and responsive workspace shell.
- [x] Light/dark themes and Material/CSS tokens.
- [x] Nineteen translation files.
- [x] Keyboard shortcuts and command palette.
- [x] Large-list virtual scrolling.
- [x] Empty, loading, and error states across major provider flows.

## Security Baseline to Preserve

- [x] Electron context isolation and disabled renderer Node integration.
- [x] Typed preload/IPC boundary.
- [x] Navigation and new-window restrictions.
- [x] URL/redirect/SSRF validation in Electron/backend flows.
- [x] Credential-redacted portal and diagnostic logging.
- [x] No analytics by default.

## Known Release Blockers

- [ ] Protect provider credentials and Stalker session material at rest.
- [x] Replace all product-facing application branding and artwork with ONIXPLUS assets.
- [x] Point updater, repository, support, and release metadata to ONIXPLUS-owned destinations.
- [ ] Approve the PWA intermediary/privacy model.
- [ ] Establish a reproducible native Windows build outside OneDrive with the pinned toolchain.

Detailed evidence and file ownership are in [ONIXPLUS-TECHNICAL-AUDIT.md](./ONIXPLUS-TECHNICAL-AUDIT.md).
