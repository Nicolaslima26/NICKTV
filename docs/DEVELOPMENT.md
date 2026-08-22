# ONIXPLUS — Development Baseline

Fresh-machine and Windows troubleshooting instructions are maintained in [SETUP.md](./SETUP.md). Use this document for repository commands and validation policy.

## Supported Toolchain

- Node: `^22.13.0 || >=24.0.0` (`package.json`).
- Package manager: pnpm `10.33.0`, pinned by `packageManager` in `package.json`.
- Windows native builds: Visual Studio Build Tools with the Desktop development with C++ workload is required for node-gyp/native Electron dependencies when a compatible prebuild is unavailable.

Use Corepack so the repository's pnpm pin is respected:

```powershell
corepack prepare pnpm@10.33.0 --activate
corepack pnpm --version
corepack pnpm install --frozen-lockfile
```

`corepack enable` is optional. It can fail with `EPERM` on Windows when the Node installation under `C:\Program Files\nodejs` is not writable; direct `corepack pnpm` commands still select the pinned package manager without requiring an elevated terminal.

Do not use pnpm 11 for this snapshot. During the audit, pnpm 11.19.0 warned that `pnpm.overrides` and `pnpm.patchedDependencies` in `package.json` were ignored. Those fields carry security overrides and the `nx-electron`/Vite patches. If the global `pnpm --version` is not `10.33.0`, prefix repository commands with `corepack pnpm`.

## Windows Workspace Location

Use a short, local, non-synchronized path without spaces, for example `C:\src\onixplus`. The current workspace contains both OneDrive synchronization and spaces. After Visual Studio 2022 Build Tools, MSVC v143, Windows 11 SDK `10.0.26100.0`, and Python 3.12 were installed, `electron-builder install-app-deps` rebuilt `better-sqlite3` successfully despite the path-space warning. OneDrive can still cause intermittent `EPERM` file-access failures.

## Discovery

After a successful install:

```powershell
pnpm nx show projects
pnpm nx show projects --withTarget test
pnpm nx show projects --withTarget e2e
pnpm nx show project web
pnpm nx show project electron-backend
```

Project `project.json` files remain the fallback source of truth when Nx discovery is unavailable.

## Run and Build

```powershell
pnpm run serve:frontend
pnpm run serve:backend
pnpm run build:frontend
pnpm run build:frontend:pwa
pnpm run build:backend
pnpm run package:app
pnpm run make:app
```

`serve:backend` starts the Electron main process and Angular renderer. `build:backend` also builds the web/remote-control dependencies and native/worker outputs defined in `apps/electron-backend/project.json`.

For standalone frontend development with working M3U URL, Xtream, and Stalker imports, run the web backend separately on port 3000 before `serve:frontend`:

```powershell
$env:PORT='3000'
$env:CLIENT_URL='http://localhost:4200'
$env:IPTVNATOR_PROXY_ALLOW_PRIVATE_NETWORKS='1'
$env:TSX_TSCONFIG_PATH='tsconfig.base.json'
corepack pnpm exec tsx apps/web-backend/src/main.ts
```

The `web-backend:serve` Nx target uses port 3333 for E2E/self-hosted test orchestration; the development frontend fallback URL is `http://localhost:3000`.

## Validation Ladder

O roteiro operacional completo, incluindo testes manuais, builds, E2E e registro da linha de base, está em [TESTING.md](./TESTING.md).

For the first clean ONIXPLUS baseline, run:

```powershell
pnpm run deps:nx:validate
pnpm run deps:vite:test
pnpm run styles:inputs:validate
pnpm run typecheck:ci
pnpm run i18n:check
pnpm run lint
pnpm run test:unit:ci
pnpm run build:frontend
pnpm run build:backend
```

Then run targeted Playwright flows before broad suites:

```powershell
pnpm nx run web-e2e:e2e
pnpm nx run electron-backend-e2e:e2e
```

Use narrower atomized E2E targets when changing one subsystem, as documented in `AGENTS.md`.

## Original Audit Validation Result

- Repository checkout and static inspection: passed.
- Upstream revision identification: passed.
- Dependency bootstrap: failed in Electron native postinstall (`better-sqlite3`/node-gyp, path with spaces, Visual Studio not found).
- Nx project discovery: not executed successfully because bootstrap did not complete.
- Lint/typecheck/unit/E2E/build: not run; results would not be trustworthy with a partial native install.

This is an environment/setup blocker, not evidence that upstream source fails its CI.

The blocker was resolved on 2026-08-21 by installing Visual Studio 2022 Build Tools 17.14 with MSVC v143 and Windows 11 SDK `10.0.26100.0`. The Electron 43.3.0 runtime subsequently loaded `better-sqlite3` and completed an in-memory SQLite query successfully. Nx discovery, web/backend typecheck, targeted unit tests, and production builds were also validated during the ONIXPLUS branding phase.
