# ONIXPLUS — Setup

## Supported Baseline

- Windows is the primary development and first-release platform.
- Node: `^22.13.0` or `>=24.0.0`.
- Package manager: pnpm `10.33.0`, selected with Corepack.
- Repository baseline: upstream revision `df8962969e1fa167afdf68c7f1ac05d7f2357556`.

Use a short local path without spaces and outside OneDrive for native Electron work, for example `C:\src\onixplus`. The current audited path is adequate for source inspection and has run the web frontend, but it has caused native compilation and intermittent file-access problems.

## Clone and Configure Git

Clone the ONIXPLUS repository and retain the original project as `upstream`:

```powershell
git clone https://github.com/Nicolaslima26/NICKTV.git C:\src\onixplus
Set-Location C:\src\onixplus
git remote add upstream https://github.com/4gray/iptvnator.git
git remote -v
```

For the current worktree, the ONIXPLUS repository is `origin` and the original project is `upstream`.

## Package Manager

```powershell
node --version
corepack prepare pnpm@10.33.0 --activate
corepack pnpm --version
```

`corepack enable` is optional. On Windows it can fail with `EPERM` when `C:\Program Files\nodejs` is protected. Direct `corepack pnpm` commands still work and should be preferred when the global `pnpm` is not version 10.33.0.

Do not use `npm install` or pnpm 11 for this snapshot. The repository's dependency patches and security overrides depend on the pinned pnpm behavior.

## Install Dependencies

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm nx show projects
```

If the Electron postinstall rebuilds `better-sqlite3`, install Visual Studio 2022 Build Tools with the **Desktop development with C++** workload. The validated Windows toolchain is MSVC v143 x64/x86 plus Windows 11 SDK `10.0.26100.0` and Python 3.12. A failed native postinstall may still leave enough JavaScript dependencies to run the web frontend, but it is not a valid Electron build baseline.

After installing the toolchain, rebuild and verify the Electron-native dependency:

```powershell
corepack pnpm exec electron-builder install-app-deps
$env:ELECTRON_RUN_AS_NODE='1'
.\node_modules\.bin\electron.cmd -e "const Database=require('better-sqlite3'); const db=new Database(':memory:'); console.log(process.versions.electron, db.open); db.close();"
Remove-Item Env:ELECTRON_RUN_AS_NODE
```

## Start the Web Application

The development frontend expects a local backend at port 3000. Use two PowerShell terminals.

Terminal 1:

```powershell
$env:PORT='3000'
$env:CLIENT_URL='http://localhost:4200'
$env:IPTVNATOR_PROXY_ALLOW_PRIVATE_NETWORKS='1'
$env:TSX_TSCONFIG_PATH='tsconfig.base.json'
corepack pnpm exec tsx apps/web-backend/src/main.ts
```

Confirm:

```powershell
Invoke-WebRequest http://localhost:3000/health -UseBasicParsing
```

Terminal 2:

```powershell
corepack pnpm run serve:frontend
```

Open <http://localhost:4200>. The frontend can render without the backend, but M3U URL, Xtream, and Stalker operations can fail until port 3000 is available.

The Nx target `web-backend:serve` uses port 3333 for E2E/self-hosted orchestration and does not match the development frontend fallback URL.

## Start Electron

After the native dependency install succeeds:

```powershell
corepack pnpm run serve:backend
```

The command builds workers and the renderer, then starts Electron. A message that no vendored Embedded MPV runtime was found is expected unless that experimental runtime has been staged; other player modes remain available.

## Common Windows Failures

### Port 4200 already in use

Only one frontend can bind to port 4200. Stop the existing watch process with `Ctrl+C` before starting `serve:frontend:pwa` or another frontend.

### `corepack enable` returns `EPERM`

Do not elevate solely for this step. Use `corepack pnpm <command>` directly.

### pnpm wants to recreate `node_modules`

Cancel the prompt and verify `corepack pnpm --version`. The global pnpm may be a different major version from the one that created the modules directory.

### `better-sqlite3` or node-gyp cannot find Visual Studio

Install the stable Visual Studio 2022 Build Tools from the official Microsoft download page with Desktop development with C++. Ensure these components are selected:

- MSVC v143 C++ x64/x86 build tools;
- Windows 11 SDK `10.0.26100.0` or a compatible installed SDK;
- MSBuild.

Then run `corepack pnpm exec electron-builder install-app-deps`. The rebuild has succeeded in the current workspace despite the path-space warning, but a short non-OneDrive path such as `C:\src\onixplus` remains the supported recommendation because OneDrive can cause unrelated `EPERM` file-access errors.

### “Deseja finalizar o arquivo em lotes?”

PowerShell/cmd displays this confirmation after `Ctrl+C` interrupts a batch wrapper. Answer `S` only when you intend to stop that running development process.

## Next Steps

Run the baseline in [TESTING.md](./TESTING.md). Architecture and repository conventions are documented in [DEVELOPMENT.md](./DEVELOPMENT.md) and the root `AGENTS.md`.
