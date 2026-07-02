---
name: run-fishingmap-web
description: Build, start, and drive fishingmap.web (the React/Vite frontend for fishingmap.fi). Use when asked to run the app, start the dev server, take a screenshot of a page, click through a UI flow, or test/build it.
---

This is a React 19 + Vite frontend with no server code of its own — it talks
to a separate backend at `VITE_BASE_URL`. Drive it by starting the Vite dev
server and pointing a headless Chromium at it via
`.claude/skills/run-fishingmap-web/driver.mjs` (this repo has no
`chromium-cli` available, so the driver is a small playwright-core script —
see Gotchas).

All paths below are relative to the repo root.

## Prerequisites

Windows + Git Bash, Node 24 / npm 11 (whatever ships `npm start`/`npm test`
already works — no extra system packages needed). The driver needs
`playwright-core` plus a cached Chromium binary, neither of which is a
project dependency:

```bash
npm install --no-save playwright-core   # leaves package.json/lock untouched
npx --yes playwright-core install chromium   # no-op if already cached
```

## Setup

Requires `.env.development.local` with four vars (already present in this
repo; see `CLAUDE.md` for what each does):

```
VITE_BASE_URL=https://localhost:7299
VITE_IMAGES_URL=https://localhost:7299/api/images
VITE_MAPS_API_KEY=...
VITE_MAP_ID=...
```

The app calls a live backend at `VITE_BASE_URL` for real data (locations,
species, etc). Without it running, pages still render their shell — the
services layer swallows fetch errors and returns `null`/`[]` — but lists will
be empty. For a real data screenshot, the backend (separate C# repo) needs to
be running at that origin.

## Build

No separate build step needed to run the app in dev mode. `npm run build`
(production build, output to `build/`) is verified working but not required
for the agent path below.

## Run (agent path)

`npm start` is **strict on port 3000** — it fails if the port is occupied
rather than picking another. Check first; only start one if nothing answers:

```bash
curl -sf http://localhost:3000/ >/dev/null || (npm start & echo $! > /tmp/fishingmap-dev.pid)
timeout 30 bash -c 'until curl -sf http://localhost:3000/ >/dev/null; do sleep 1; done'
```

Stop it (only if you started it) with `kill $(cat /tmp/fishingmap-dev.pid)`.

Then drive it with the screenshot/click driver:

```bash
MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" \
  node .claude/skills/run-fishingmap-web/driver.mjs /species /tmp/species.png
```

```
Usage: node driver.mjs <path> <screenshot.png> [options]
  --geo=<lat>,<lng>       Mock geolocation (also grants the permission)
  --width=<px>            Viewport width (default 1280)
  --height=<px>           Viewport height (default 800)
  --wait=<ms>             Extra settle time after networkidle (default 500)
  --fill=<sel>=<value>    Fill an input before clicks (repeatable)
  --set-files=<sel>=<p>   Set a file input's files (repeatable; upload flows)
  --click=<selector>      Click a selector before the wait+screenshot (repeatable)
  --seed-user             Fake Administrator in sessionStorage (route gate)
  --mock-auth=abort|401   Sever or 401 all /api/auth/* calls (see below)
  --accept-dialogs        Auto-accept window.confirm (delete flows)
```

### Testing auth-gated pages without credentials

Add/edit routes are gated client-side on a truthy `currentUser`. The recipe:

- `--seed-user --mock-auth=abort` — the seeded user passes the route gate,
  and aborting `/api/auth/*` makes the session re-validation return
  `'unknown'`, which **keeps** the seeded user (a real whoami would 401 and
  sign it out). Backend mutations still 401 for real — no data can change —
  which is exactly what makes failure-path UI (toasts, inline errors) safely
  drivable.
- `--mock-auth=401` alone — exercises rejection paths: failed login message,
  stale-session sign-out.

Prints `TITLE`, final `URL`, any `CONSOLE-ERROR`/`PAGE-ERROR` lines, and the
screenshot path. Exits 1 only on navigation failure — console errors don't
fail the run, read the printed lines yourself.

Verified examples (all run this session against the live local backend):

```bash
# Species list — no geo needed
MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" \
  node .claude/skills/run-fishingmap-web/driver.mjs /species /tmp/species.png

# Locations list with mocked geolocation — distance pills + Nearest sort appear
MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" \
  node .claude/skills/run-fishingmap-web/driver.mjs /locations /tmp/locations.png --geo=60.1699,24.9384

# Open the species multi-select on the desktop toolbar (note the scoped selector — see Gotchas)
MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" \
  node .claude/skills/run-fishingmap-web/driver.mjs /locations /tmp/ms-open.png --click=".locations-toolbar .ms-control"

# Mobile breakpoint — open the slide-in filter panel
MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" \
  node .claude/skills/run-fishingmap-web/driver.mjs /locations /tmp/mobile.png --width=600 --height=900 --click=".slide-toggle"

# Auth-gated page: location edit -> Media panel, session kept via abort
MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" \
  node .claude/skills/run-fishingmap-web/driver.mjs /locations/37/edit /tmp/edit.png \
  --seed-user --mock-auth=abort --click=".edit-location-sidebar .edit-nav-item:nth-child(2)"

# Failed login flow end-to-end (fill + submit against mocked 401)
MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*" \
  node .claude/skills/run-fishingmap-web/driver.mjs /login /tmp/login-fail.png --mock-auth=401 \
  --fill='input[name="username"]=x' --fill='input[name="password"]=y' --click='button[type="submit"]' --wait=1200
```

## Run (human path)

```bash
npm start   # → opens a browser at http://localhost:3000 automatically. Ctrl-C to stop.
```

## Test

```bash
npm test -- --run
```

Runs the Vitest suite — `*.test.js` files colocated under `src/` (e.g.
`src/services/apiClient.test.js`, `src/utils/geoUtils.test.js`). Passing as
of July 2026. With zero test files Vitest exits 1, so never delete the last
test file without replacing it.

---

## Gotchas

- **No `chromium-cli` on this Windows/Git Bash box.** The driver uses
  `playwright-core` directly instead. Install it with `--no-save` (verified
  via `git status --porcelain package.json package-lock.json` staying empty
  before/after) so it never touches the committed lockfile — it's agent
  tooling, not a project dependency.
- **Git Bash mangles leading-slash arguments.** `node driver.mjs /species ...`
  gets rewritten to `node driver.mjs C:/Program Files/Git/species ...` by
  MSYS's path conversion, which then fails Chromium navigation with
  `Cannot navigate to invalid URL`. Always prefix the command with
  `MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL="*"`.
- **Two `.ms-control` elements exist in the DOM at once** — one inside the
  mobile `SlideInPanel` (hidden via CSS at ≥900px viewports), one in the
  desktop `.locations-toolbar`. A bare `--click=".ms-control"` resolves to
  the first (hidden) one and times out waiting for it to become visible.
  Scope the selector to the toolbar you actually want, e.g.
  `.locations-toolbar .ms-control`.
- **Geolocation always errors in this headless context** unless `--geo` is
  passed — every page that calls `useGeolocation` logs `CONSOLE-ERROR:
  GeolocationPositionError` to the console. This is expected and non-fatal:
  the app is built to degrade gracefully (distance filter disabled with a
  hint, sort dropdown falls back to Name-only). Don't treat that console
  error alone as a failure; only investigate if the visible UI is broken.
- **Don't trust curl for backend liveness.** Git Bash's curl can report
  `https://localhost:7299` unreachable (TLS/loopback quirk) while the
  browser reaches it fine. If you need to know whether the backend is up,
  check from the browser context (or playwright-core's `request` with
  `ignoreHTTPSErrors: true`), not curl.
- **`npm install <anything>` prunes `--no-save` packages.** Installing a new
  dependency removes the unsaved `playwright-core`; the driver then fails
  with `ERR_MODULE_NOT_FOUND`. Re-run
  `npm install --no-save playwright-core` after any dependency change.
- **Google Maps pages never reach `networkidle`** in headless (raster tile
  streaming), so the driver logs `NAVIGATION-ERROR: Timeout` on `/map` and
  detail pages with maps. The page has actually loaded — the screenshot and
  TITLE/URL lines are still produced; judge by those, and expect a
  `Vector Map ... Falling back to Raster` console error (harmless, WebGL is
  unavailable headless).
- **Anonymous page loads log two whoami 401s** in dev (`Failed to load
  resource ... 401`) — the session re-validation runs twice under
  StrictMode. Expected; absent in production builds.
