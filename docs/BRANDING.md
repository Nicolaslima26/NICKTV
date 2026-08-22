# ONIXPLUS — Branding Migration

Status: Phase 2 identity implemented; release-readiness gates remain.

## Identity Rules

- Product name: **ONIXPLUS** (confirmed by the project owner).
- Package slug: `onixplus`.
- Application ID: `com.nicolaslima26.onixplus`.
- Repository and update owner: `Nicolaslima26/NICKTV`.
- Signing identity remains unresolved and is a release gate, not a branding placeholder.
- IPTVnator name, icon, and artwork must not identify a ONIXPLUS distribution.
- MIT copyright/license notices and factual upstream attribution must remain.
- Branding values should be centralized; avoid arbitrary product strings and colors across components.

## Migration Matrix

| Surface | Current value/location | Phase 2 target | Status |
| --- | --- | --- | --- |
| npm workspace name | `package.json` | `onixplus` | Complete |
| Product name | Electron/web metadata | `ONIXPLUS` | Complete |
| Electron app ID | `electron-builder.json` | `com.nicolaslima26.onixplus` | Complete |
| Executable/artifacts | Electron Builder | `onixplus` / ONIXPLUS artifacts | Complete |
| Window title | Electron main/window configuration | `ONIXPLUS` | Complete |
| HTML title/metadata | `apps/web/src/index.html` | ONIXPLUS metadata | Complete |
| Web manifest | `apps/web/src/manifest.webmanifest` | ONIXPLUS name/icons | Complete |
| Icons/favicon | web, Electron, remote control, website | Approved ONIXPLUS X artwork | Complete |
| Splash/loading assets | web index and brand assets | ONIXPLUS logo/palette | Complete |
| Translations | `apps/web/src/assets/i18n` | ONIXPLUS product strings | Complete |
| Linux metadata | Electron Linux resources | ONIXPLUS IDs/name | Complete |
| Windows installer | `electron-builder.json` | ONIXPLUS product/artifact name | Complete |
| macOS bundle/signing | builder/entitlements | ONIXPLUS bundle name | Branding complete; signing pending |
| Updater publishing | `electron-builder.json` | `Nicolaslima26/NICKTV` | Complete |
| Runtime links | website, settings, updater, support links | ONIXPLUS repository destinations | Complete |
| Docker/image names | Docker and workflows | ONIXPLUS-owned registry names | Blocked on repository/registry |
| README/site/screenshots | product material | ONIXPLUS identity using mock data | Screenshot refresh pending |

## Remaining Release Decisions

1. Establish Windows/macOS signing identities before signed distribution.
2. Decide which platforms are publishable beyond the Windows-first target.
3. Approve the PWA intermediary/privacy model and production hosting.
4. Regenerate public website screenshots from mock data under the ONIXPLUS theme.

Do not insert placeholder signing certificates or upstream release destinations into an ONIXPLUS build.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| Preto Onix | `#07080D` | Main background |
| Roxo Profundo | `#210C5F` | Cards and secondary surfaces |
| Violeta Real | `#601FE8` | Primary actions and selection |
| Roxo Luminoso | `#9E5EF6` | Highlights and icons |
| Lavanda Neon | `#C696F5` | Lighting and detail |
| Branco Pérola | `#E4E3E5` | Primary text |
| Cinza Metálico | `#A2A1A4` | Secondary text |
| Cinza Escuro | `#616062` | Disabled content |

The Angular theme exposes these through app-owned `--app-*` tokens in `apps/web/src/m3-theme.scss`. Internal `iptvnator` storage/profile names and `@iptvnator/*` TypeScript aliases remain temporarily unchanged to preserve existing user data and Nx compatibility; they are not public branding.

## Verification Gate

Before any ONIXPLUS package is distributed:

```powershell
rg -n -i "iptvnator|fourgray|4gray" package.json electron-builder.json apps libs docker .github README.md
```

Every remaining match must be classified as one of:

- required license or attribution;
- internal compatibility/migration key that cannot yet change;
- intentional upstream link clearly labelled as upstream;
- defect that must be replaced before release.

Package metadata, installed application name, executable, window title, icons, updater destination, and screenshots require explicit manual verification.
