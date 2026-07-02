# AGENTS.md

Single source of project guidance for AI coding agents working in this repository. Claude Code imports this file via `CLAUDE.md`; Codex and other agents read it directly. **Edit this file, not CLAUDE.md.**

## Commands

- `npm start` — Vite dev server on **port 3000** (strict; fails if occupied). Opens a browser automatically.
- `npm run build` — production build, output goes to `build/` (not the default `dist/`).
- `npm test` — runs Vitest. Test files are colocated `*.test.js` next to the code they cover (e.g. `src/services/apiClient.test.js`). Use `npx vitest run path/to/file.test.js` for a single file, or `npx vitest -t "name"` to filter by test name. CI fails if the suite is empty, so never delete the last test file without replacing it.

- `npm run lint` — ESLint 9 flat config (`eslint.config.js`: js recommended + react + react-hooks). Runs in CI; **errors fail the build, warnings don't.** The `react-hooks/refs` and `react-hooks/set-state-in-effect` compiler-alignment rules are downgraded to warnings because the imperative Google Maps integration (Circle, useData, clusterer) legitimately trips them — don't "fix" those warnings mechanically.

## Required environment

Vite reads `.env.development.local` (dev) and `.env.production` (build). All four vars are required — the app refuses to boot without them (`src/utils/assertEnv.js` renders an error into #root and throws before render):

- `VITE_BASE_URL` — backend API origin
- `VITE_IMAGES_URL` — image asset origin (typically `${VITE_BASE_URL}/api/images`)
- `VITE_MAPS_API_KEY` — Google Maps JS API key
- `VITE_MAP_ID` — Google Maps style ID (for advanced markers)

## Architecture

This is the React frontend for **fishingmap.fi**, a map of fishing locations in Uusimaa, Finland. The app talks to a separate backend API (the C# repo at `VITE_BASE_URL`); this codebase contains no server code.

### Routing & auth

`src/App.jsx` is the single route table. Three protection levels:

- **Public**: list/details routes for locations, species, permits, plus `/`, `/map`, `/login`.
- **`ProtectedRoute`** (`src/components/route/ProtectedRoute.jsx`) — wraps add/edit routes for the three domain entities. Gate is `currentUser` truthy; supports optional `requiredRoles`. Redirects to `/` when denied.
- **`ProtectedRouteIsLoggedInUser`** — for routes that should only be accessible to the user themselves (e.g. `/users/:id/edit`).

Auth state lives in `CurrentUserContext` (`src/context/CurrentUserContext.jsx`):
- User object is mirrored to `sessionStorage` under key `currentUser`. The provider blocks rendering children until session storage has been read (`isReady` gate) — this prevents protected-route flicker on refresh.
- On mount the provider restores the stored user optimistically, then re-validates in the background via `authService.getSession()` (whoami): an explicit 401/403 signs the user out, a success refreshes the stored user (this is also what restores sessions in new tabs — sessionStorage is per-tab), and an unreachable backend (`'unknown'`) keeps the stored user so a network blip doesn't sign anyone out. Don't collapse `getSession`'s three states into user-or-null.
- The provider also kicks off a geolocation lookup via `useGeolocation` (`src/hooks/useGeolocation.js` — deliberately not named `useLocation`, which would shadow react-router's hook) and exposes `currentLocation` as the third value in the context tuple `[currentUser, updateCurrentUser, currentLocation]`.

Auth itself is **cookie-based**: every fetch that needs identity passes `credentials: 'include'`. There are no tokens in JS-accessible storage.

`currentUser.roles` is an array of role objects (`[{id, name}]`), not strings — checking membership needs `.some(r => r.name === 'Administrator')`, not `.includes(...)`. The admin role name is **`Administrator`**, not `Admin`; the backend (`[Authorize(Roles = "Administrator")]`) and frontend role checks must match it exactly, or the check silently always fails.

### Page / domain structure

Three CRUD domains follow an identical layout under `src/pages/`:

```
location/  { list, details, add, edit }
species/   { list, details, add, edit }
permit/    { list, details, add, edit }
```

Plus standalone pages: `landingPage/`, `login/`, `map/` (the main map view), `user/edit/`.

### Services layer (`src/services/`)

One file per backend resource (`locationService`, `speciesService`, `permitService`, `userService`, `authService`, `fileService`). All HTTP goes through the shared **`src/services/apiClient.js`** (`getJson` / `sendJson` / `sendForm` / `requestOk`), which checks `response.ok` — `fetch` only rejects on network errors, so skipping the check turns HTTP errors into fake successes. New endpoints must call `apiClient`, never raw `fetch`. Conventions to preserve when editing:

- All methods are `async` and **swallow errors** (apiClient logs to console and returns a sentinel: `null`, `[]`, `false`). Callers branch on the sentinel, never `try/catch`. Don't change this without updating call sites.
- Mutating endpoints (create/update on locations, species, permits) send **`FormData`**, not JSON, because the backend accepts image uploads alongside the entity. Stringify nested arrays/objects (`species`, `permits`, `navigationposition`) before appending — each service has a `to<Entity>FormData` helper for this.
- Authenticated requests must include `credentials: 'include'` — `sendJson`/`sendForm`/`requestOk` do this by default; for authenticated GETs pass it via `getJson`'s options (see `authService.getCurrentUser`).
- Display images with `fileService.getImageUrl(path)` in a plain `<img src>` — never rebuild `${VITE_IMAGES_URL}/...` inline, and never download an image as a blob just to preview it. `fileService.getImage` (blob → `File`) is only for when an actual `File` object is needed (e.g. seeding a form for re-upload). Staged image add/remove UI is the shared `src/components/ui/media/MediaManagerPanel.jsx`.
- Because services swallow errors, **callers must surface mutation failures to the user**: use `useToast()` from `src/context/ToastContext.jsx` (error/success toasts, bottom-right, auto-dismiss) or an inline form status (edit panels, login). Never let a failed create/save/delete look like success — check the sentinel before navigating away.
- `locationService` exposes three list-shaped endpoints: `/api/locations` (full), `/api/locations/markers` (lightweight, for map clustering), `/api/locations/summary`. The map page uses `getLocationMarkers`; list pages use `getLocations` / `getLocationsSummary`.

### Map (`src/pages/map/` + `src/components/ui/map/`)

Built on `@vis.gl/react-google-maps`. The `<APIProvider>` wraps everything inside `App.jsx` so every page can use `useMap()`.

- `FishingMap.jsx` is the main view. It composes `Map`, `LocationClusterer` (uses `@googlemaps/markerclusterer`), `Circle` (radius search), and `PositionMarker` (the user's location).
- `geoUtils.js` (in `src/utils/`) wraps `@turf/turf` for bbox computation, MultiPolygon ↔ FeatureCollection conversion, and centroid calculation for arbitrary geometries. Non-component files (services, utils, hooks) use the `.js` extension; `.jsx` is reserved for files containing JSX.
- Search is radius-based: a draggable circle on the map defines `(orgLat, orgLng, radius)` query params sent to the backend.

### List pages

The three list pages (locations, species, permits) share one pattern built on two hooks in `src/hooks/`:

- `useUrlFilters` — URL-driven filter/paging state (`patchParams`, `currentPage`, `goToPage`). Filters live in the URL (`q`, `page`, plus `sIds`/`distance`/`sort` on locations); empty values are deleted so clean URLs stay clean, and updates `replace` history. Filter changes must also pass `page: ''` to reset paging.
- `useDebouncedQuery` — debounced fetch keyed on the filter values, with a stale-result guard. Stringify array deps (`JSON.stringify(ids)`).

New list filters should extend this pattern, not reintroduce per-page `patchParams`/debounce copies.

### Forms

Formik + Yup for add/edit flows. `AddLocation` is a four-step wizard (`src/pages/location/add/steps/`), edit pages use per-section panels; `PermitForm` (`src/components/ui/permit/`) is shared by the permit add/edit pages. The old shared `LocationForm`/`SpeciesForm` components were removed in July 2026 — don't resurrect them from git history.

### Styling

SCSS modules per component, imported alongside the JSX. Vite is configured to use the modern Sass compiler API (`api: 'modern-compiler'` in `vite.config.js`). Global styles in `src/index.scss`.

Default to **`rem` for `font-size`** and **`em` for `padding`/`margin`/`gap`**, so spacing scales with local font-size while font-size stays anchored to the root (see `src/index.scss`'s `.mt-1`–`.mt-6` scale). `px` is fine when a value is genuinely fixed (hairline borders, icon sizing) — this is a default, not a hard rule.

### Implementing design handoffs

When implementing a Claude Design (claude.ai/design) handoff bundle, trust its *structural* changes (markup, layout direction, color usage, new components) but treat its *numeric* tokens skeptically — cross-check against the current SCSS first. Handoff specs have drifted from the live app before (e.g. a handoff spec'd `56px` for a control the app already built at `55px`); prefer the existing app value over a cosmetic-but-arbitrary delta unless the user specifically called out that value as the thing to change.

## Code style

- `if` blocks always use braces with the body on a new line — never a single-line inline `if (x) doThing();`.
- Add a JSDoc comment above non-trivial named functions and const-assigned arrow functions (handlers, helpers, async operations) describing what they do and their `@param`s. Skip trivial one-liners where the name already says everything.
- Prefer splitting UI into smaller, focused components whenever a piece of markup is reusable or makes the parent noticeably easier to read. Co-locate the new component in the same folder as the single parent that uses it; only move it to `src/components/ui/` once it is used in more than one place.

## Deployment

`master` pushes trigger `.github/workflows/master_fishingmap.yml`, which runs install, lint, build, and test as separate steps on Windows (separate because multi-line pwsh `run:` blocks only propagate the last command's exit code), then deploys **only the production build** to Azure Web App `fishingmap`. The artifact is the `build/` folder's contents, re-nested under `build/` at download — the Azure app serves from the `build/` subfolder of wwwroot, and the SPA rewrite `web.config` ships inside it via `public/`. Sources and `node_modules` are never deployed. The build uses Node 20; `.env.production` is consumed at build time only (Vite bakes the values into the bundle).

## Review tracking

Open findings from code reviews are tracked in `CODE_REVIEW.md` (root). When fixing one, update its status there instead of deleting the row.
