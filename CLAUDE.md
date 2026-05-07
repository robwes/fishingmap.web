# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — Vite dev server on **port 3000** (strict; fails if occupied). Opens a browser automatically.
- `npm run build` — production build, output goes to `build/` (not the default `dist/`).
- `npm test` — runs Vitest. Use `npx vitest run path/to/file.test.jsx` for a single test, or `npx vitest -t "name"` to filter by test name.

There is no lint script. ESLint is configured (`react-app` preset) but only invoked by editor tooling.

## Required environment

Vite reads `.env.development.local` (dev) and `.env.production` (build). All four vars are required at runtime — missing values produce silent failures (services swallow errors and return null/[]):

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
- The provider also kicks off a geolocation lookup via `useLocation` and exposes `currentLocation` as the third value in the context tuple `[currentUser, updateCurrentUser, currentLocation]`.

Auth itself is **cookie-based**: every fetch that needs identity passes `credentials: 'include'`. There are no tokens in JS-accessible storage.

### Page / domain structure

Three CRUD domains follow an identical layout under `src/pages/`:

```
location/  { list, details, add, edit }
species/   { list, details, add, edit }
permit/    { list, details, add, edit }
```

Plus standalone pages: `landingPage/`, `login/`, `map/` (the main map view), `user/edit/`.

### Services layer (`src/services/`)

Thin wrappers around `fetch` — one file per backend resource (`locationService`, `speciesService`, `permitService`, `userService`, `authService`, `fileService`). Conventions to preserve when editing:

- All methods are `async` and **swallow errors**, logging to console and returning a sentinel (`null`, `[]`, `false`). Callers branch on the sentinel, never `try/catch`. Don't change this without updating call sites.
- Mutating endpoints (create/update on locations, species, permits) send **`FormData`**, not JSON, because the backend accepts image uploads alongside the entity. Stringify nested arrays/objects (`species`, `permits`, `navigationposition`) before appending.
- Authenticated requests must include `credentials: 'include'`.
- `locationService` exposes three list-shaped endpoints: `/api/locations` (full), `/api/locations/markers` (lightweight, for map clustering), `/api/locations/summary`. The map page uses `getLocationMarkers`; list pages use `getLocations` / `getLocationsSummary`.

### Map (`src/pages/map/` + `src/components/ui/map/`)

Built on `@vis.gl/react-google-maps`. The `<APIProvider>` wraps everything inside `App.jsx` so every page can use `useMap()`.

- `FishingMap.jsx` is the main view. It composes `Map`, `LocationClusterer` (uses `@googlemaps/markerclusterer`), `Circle` (radius search), and `PositionMarker` (the user's location).
- `geoUtils.jsx` (in `src/utils/`) wraps `@turf/turf` for bbox computation, MultiPolygon ↔ FeatureCollection conversion, and centroid calculation for arbitrary geometries.
- Search is radius-based: a draggable circle on the map defines `(orgLat, orgLng, radius)` query params sent to the backend.

### Forms

Formik + Yup throughout. Domain forms (e.g. `LocationForm`, `SpeciesForm`, `PermitForm`) live under `src/components/ui/{location,species,permit}/` and are reused by both the add and edit pages.

### Styling

SCSS modules per component, imported alongside the JSX. Vite is configured to use the modern Sass compiler API (`api: 'modern-compiler'` in `vite.config.js`). Global styles in `src/index.scss`.

## Deployment

`master` pushes trigger `.github/workflows/master_fishingmap.yml`, which runs `npm install && npm run build && npm test` on Windows then deploys the entire repo (build artifacts + sources) to Azure Web App `fishingmap`. The build uses Node 18.
