# Restructure fishingmap.web to a feature-based layout

## Context

`CODE_REVIEW.md` row **S4** (Open) suggests moving from the current layer-based layout (`src/pages`, `src/components`, `src/services`, `src/hooks`, `src/utils`, `src/context`) to feature folders. The user approved a full restructure: `src/app/` (shell), `src/features/{map,locations,species,permits,auth,users,landing}`, `src/shared/{components,hooks,services,context,utils,constants}`, with a new `@/` → `src/` path alias, executed **incrementally with a verified commit per phase**.

A completed codebase inventory established the facts this plan relies on:

- **Zero page-to-page imports** — all sharing goes through the layer folders, so the feature split is clean.
- **All imports are relative today**; no aliases, no dynamic `import()`, no `React.lazy`, no `require`.
- Every `.scss` is imported by the same-named `.jsx` next to it (`import './X.scss'`); no SCSS `@use`/`@import` between files. Exactly **one** SCSS `url()` asset reference: `LandingPage.scss:210` → `url('../../assets/images/hero_lake.jpg')`.
- **6 test files**, colocated: `hooks/useUrlFilters.test.js`, `services/{apiClient,authService,locationService}.test.js`, `utils/{assertEnv,geoUtils}.test.js`. CI fails on an empty suite.
- `index.html:23` hardcodes `<script type="module" src="/src/index.jsx">` — the entry point stays at `src/`.
- `package.json`: `"test": "vitest"` is **watch mode** — the executor must use `npx vitest run`.
- Git is clean on `master`. Master pushes auto-deploy to Azure via `.github/workflows/master_fishingmap.yml` — **never push master mid-work**.

## Ground rules for the executor (read fully before Phase 0)

- All commands run from repo root `C:\Users\rober\source\repos\fishingmap.web` using the **Bash** tool (git-bash syntax).
- **Verification loop — run at the end of EVERY phase; all three must pass before committing:**
  ```bash
  npm run lint      # exit 0. Pre-existing WARNINGS are fine (react-hooks/refs etc. are warnings by design — do NOT "fix" them). Errors are not.
  npx vitest run    # NOT `npm test` (watch mode, hangs). Must report: Test Files  6 passed
  npm run build     # exit 0, emits build/index.html
  ```
  The build is the authoritative check — every source file is reachable from `src/index.jsx`, so any stale import path fails the build. The per-phase greps additionally prove no old-path references remain.
- **Commit at the end of every phase**: `git add -A && git commit -m "<message per phase>"`.
- **Import rules** (apply mechanically while moving):
  1. Same-folder imports stay relative: `./X`, `./X.scss`.
  2. Page-internal child folders keep relative imports: `./steps/StepX`, `./panels/EditXPanel`.
  3. **Every other import becomes `@/...`**. No `../` imports anywhere in the final tree.
  4. If a rewrite target has **not moved yet**, point `@/` at its *current* location (e.g. `@/services/authService` between Phases 1–3); the phase that later moves it has a grep that catches the intermediate form.
  5. Asset imports become `@/assets/images/<file>` when the importing `.jsx` moves.
  6. Every `.scss` moves with its same-named `.jsx`; `import './X.scss'` lines never change.
  7. `*.test.js` files move with the file they test. The suite must always report exactly **6 test files**.
- **Find/replace traps** — always match the FULL import specifier including the closing single quote:
  - `buttons/Button'` vs `ButtonBar`/`ButtonPrimary`/`ButtonSecondary`/`ButtonSuccess`
  - `card/Card'` vs `CardBody`/`CardImage`/`CardTitle`/`InlineCard`
  - `collapse/Collapse'` vs `CollapsibleArticle`/`CollapsibleArticlePrimary`/`CollapsibleList`/`CollapsibleParagraph`
  - `form/MultiSelect'` (locations-owned) vs `MultiSelectInput` (shared)
  - `map/Map'` vs `MarkerWithInfoWindow`
- **Target internal structure (decided — do not deviate):**
  - Features keep their existing route subfolders (`features/locations/{list,details,add,edit}` with `add/steps`, `edit/panels`). Components pulled in from `src/components/` land in a flat `features/<f>/components/` folder (no `ui/` nesting). `features/map` keeps its page files flat at the feature root plus `components/` and `utils/`. `features/auth` and `features/landing` are flat; `features/users` keeps `edit/`.
  - Shared components keep category subfolders: `shared/components/{buttons,form,card,collapse,imageCarousell,location,map,media,notFound,pagination,slideInPanel,spinner,viewToggle}`.
  - App shell: `src/app/App.jsx` + `src/app/{route,header,footer}/`.
  - **`ButtonBar` stays SHARED** (`shared/components/buttons/`) even though only PermitForm imports it — all button primitives live together. Decided; do not move it into permits.
  - `src/index.jsx`, `src/index.scss`, `src/logo.svg` (unreferenced — leave it), and `src/assets/` **stay at `src/` root**.

### Ownership map (authoritative — where every disputed file lands)

| File(s) | Destination | Why |
|---|---|---|
| `components/ui/location/{LocationSpeciesItem,LocationImagePlaceholder}` | **shared** | used by map feature too — NOT locations-owned |
| `components/ui/location/LocationGeometry{Input,Editor,Toolbar}` | **features/locations** | locations-only geometry subsystem |
| `components/ui/map/{Map,PositionMarker}` | **shared** | used by locations + map |
| `components/ui/map/Circle` | **features/map** | FishingMap only |
| `components/ui/map/{NavigationPositionMarker,MarkerWithInfoWindow,useData}` | **features/locations** | geometry-subsystem internals |
| `components/ui/collapse/Collapse` | **shared** | locations + users |
| `components/ui/collapse/{CollapsibleArticle,CollapsibleArticlePrimary,CollapsibleParagraph}` | **features/locations** | chain used only by LocationCard |
| `components/ui/collapse/CollapsibleList` | **features/map** | LocationInfoWindow only |
| `components/ui/buttons/*` (7 primitives incl. Button, LinkButton, ButtonBar) | **shared** | |
| `components/ui/buttons/ButtonPrimary` | **features/locations** | AddLocation only |
| `components/ui/buttons/CallToAction` | **features/landing** | LandingPage only |
| `components/ui/form/{Error,Input,Label,MultiSelectInput,RangeInput,SearchInput}` | **shared** | |
| `components/ui/form/{TextArea,MultiSelect,ImportGeoJson}` | **features/locations** | |
| `components/ui/permit/PermitForm` | **features/permits** | |
| `services/{apiClient,fileService,locationService,speciesService,permitService}` | **shared/services** | cross-feature |
| `services/authService` | **features/auth** | |
| `services/userService` | **features/users** | |
| `utils/formatDistance` | **features/map/utils** | map-only |
| `utils/{geoUtils,assertEnv}` | **shared/utils** | |
| all hooks, both contexts, `constants/images.js` | **shared/{hooks,context,constants}** | |

---

## Phase 0 — Branch + `@/` alias (zero file moves) ✅ done (baseline: 6 test files, 42 tests; lint 0 errors/13 warnings)

0. **Copy this plan into the repo** as `RESTRUCTURE_PLAN.md` at the repo root (source: `C:\Users\rober\.claude\plans\can-you-make-a-zazzy-sloth.md`), so it is version-controlled and survives even if only some phases happen today. Each completed phase should be ticked off in that file (add `✅ done <commit sha>` next to the phase heading) as part of the phase's commit — that tells a fresh session exactly where to resume. Delete `RESTRUCTURE_PLAN.md` in the final Phase 11 docs commit once AGENTS.md describes the new layout.
1. `git checkout -b restructure/feature-folders master`
2. Edit `vite.config.js` (currently imports only `defineConfig` and `react`): add at the top
   ```js
   import { fileURLToPath, URL } from 'node:url';
   ```
   and inside `defineConfig({...})`, after `plugins`:
   ```js
   resolve: {
     alias: {
       '@': fileURLToPath(new URL('./src', import.meta.url))
     }
   },
   ```
   Everything else (css, server, test, build blocks) unchanged. Vitest reads this same config, so the alias works in tests automatically. ESLint needs no change (no `eslint-plugin-import`, so no resolver required).
3. Create `jsconfig.json` at repo root (for editor IntelliSense):
   ```json
   {
       "compilerOptions": {
           "module": "esnext",
           "moduleResolution": "bundler",
           "baseUrl": ".",
           "paths": { "@/*": ["./src/*"] },
           "jsx": "react-jsx"
       },
       "include": ["src"]
   }
   ```
4. Run the verification loop. **Record the baseline vitest totals** (6 test files, N tests) — every later phase must match exactly.
5. Commit: `restructure: add @/ src alias (vite + jsconfig)`

---

## Phase 1 — Shared non-component code → `src/shared/*`

(`authService`/`userService` stay behind in `src/services` for now; `formatDistance` stays in `src/utils`.)

```bash
mkdir -p src/shared/services src/shared/hooks src/shared/utils src/shared/context src/shared/constants
git mv src/services/apiClient.js src/services/apiClient.test.js src/shared/services/
git mv src/services/fileService.js src/shared/services/
git mv src/services/locationService.js src/services/locationService.test.js src/shared/services/
git mv src/services/speciesService.js src/shared/services/
git mv src/services/permitService.js src/shared/services/
git mv src/hooks/useUrlFilters.js src/hooks/useUrlFilters.test.js src/shared/hooks/
git mv src/hooks/useDebouncedQuery.js src/shared/hooks/
git mv src/hooks/useGeolocation.js src/shared/hooks/
git mv src/utils/assertEnv.js src/utils/assertEnv.test.js src/shared/utils/
git mv src/utils/geoUtils.js src/utils/geoUtils.test.js src/shared/utils/
git mv src/context/CurrentUserContext.jsx src/shared/context/
git mv src/context/ToastContext.jsx src/context/ToastContext.scss src/shared/context/
git mv src/constants/images.js src/shared/constants/
```

**Import rewrites** — for each row, Grep the whole `src` tree for the left pattern and replace the full specifier of each hit:

| grep pattern | new specifier |
|---|---|
| `services/apiClient` | `@/shared/services/apiClient` (leave `./apiClient` inside `src/shared/services/` alone) |
| `services/fileService` | `@/shared/services/fileService` |
| `services/locationService` | `@/shared/services/locationService` |
| `services/speciesService` | `@/shared/services/speciesService` |
| `services/permitService` | `@/shared/services/permitService` |
| `hooks/useUrlFilters` | `@/shared/hooks/useUrlFilters` |
| `hooks/useDebouncedQuery` | `@/shared/hooks/useDebouncedQuery` |
| `hooks/useGeolocation` | `@/shared/hooks/useGeolocation` |
| `utils/assertEnv` | `@/shared/utils/assertEnv` (this catches `src/index.jsx`) |
| `utils/geoUtils` | `@/shared/utils/geoUtils` |
| `context/CurrentUserContext` | `@/shared/context/CurrentUserContext` |
| `context/ToastContext` | `@/shared/context/ToastContext` |
| `constants/images` | `@/shared/constants/images` |

Same-name `./X` imports inside the moved cohort stay (e.g. `locationService.test.js` → `./locationService`; `ToastContext.jsx` → `./ToastContext.scss`).

**Special case:** `src/shared/context/CurrentUserContext.jsx` imports `'../hooks/useGeolocation'` and `'../services/authService'` → rewrite to `@/shared/hooks/useGeolocation` and `@/services/authService` (authService hasn't moved yet — intermediate form, retired in Phase 3).

**Verify** + loop:
```bash
grep -rnE "'(\.\.?/)+(services|hooks|context|constants)/" src --include='*.js' --include='*.jsx'
grep -rnE "'(\.\.?/)+utils/(assertEnv|geoUtils)" src --include='*.js' --include='*.jsx'
```
Allowed remaining hits from the first grep ONLY: `authService` imports in `src/pages/login/Login.jsx`, `src/pages/user/edit/EditUser.jsx`, `src/components/ui/header/UserMenu.jsx`; `userService` in `EditUser.jsx`; `utils/formatDistance` in `src/pages/map/*` (those files haven't moved). Anything else = bug.

**Commit:** `restructure: move shared services/hooks/utils/context/constants to src/shared`

---

## Phase 2 — Shared components → `src/shared/components/*`

```bash
mkdir -p src/shared/components/{buttons,form,card,collapse,location,map}
git mv src/components/ui/buttons/Button.jsx src/components/ui/buttons/Button.scss src/shared/components/buttons/
git mv src/components/ui/buttons/ButtonBar.jsx src/components/ui/buttons/ButtonBar.scss src/shared/components/buttons/
git mv src/components/ui/buttons/ButtonSecondary.jsx src/components/ui/buttons/ButtonSecondary.scss src/shared/components/buttons/
git mv src/components/ui/buttons/ButtonSuccess.jsx src/components/ui/buttons/ButtonSuccess.scss src/shared/components/buttons/
git mv src/components/ui/buttons/LinkButton.jsx src/components/ui/buttons/LinkButton.scss src/shared/components/buttons/
git mv src/components/ui/buttons/LinkButtonPrimaryOutline.jsx src/components/ui/buttons/LinkButtonPrimaryOutline.scss src/shared/components/buttons/
git mv src/components/ui/buttons/ResetButton.jsx src/components/ui/buttons/ResetButton.scss src/shared/components/buttons/
git mv src/components/ui/form/Error.jsx src/components/ui/form/Error.scss src/shared/components/form/
git mv src/components/ui/form/Input.jsx src/components/ui/form/Input.scss src/shared/components/form/
git mv src/components/ui/form/Label.jsx src/components/ui/form/Label.scss src/shared/components/form/
git mv src/components/ui/form/MultiSelectInput.jsx src/components/ui/form/MultiSelectInput.scss src/shared/components/form/
git mv src/components/ui/form/RangeInput.jsx src/components/ui/form/RangeInput.scss src/shared/components/form/
git mv src/components/ui/form/SearchInput.jsx src/components/ui/form/SearchInput.scss src/shared/components/form/
git mv src/components/ui/card/Card.jsx src/components/ui/card/Card.scss src/shared/components/card/
git mv src/components/ui/card/CardBody.jsx src/components/ui/card/CardBody.scss src/shared/components/card/
git mv src/components/ui/card/CardImage.jsx src/components/ui/card/CardImage.scss src/shared/components/card/
git mv src/components/ui/card/CardTitle.jsx src/components/ui/card/CardTitle.scss src/shared/components/card/
git mv src/components/ui/collapse/Collapse.jsx src/components/ui/collapse/Collapse.scss src/shared/components/collapse/
git mv src/components/ui/location/LocationSpeciesItem.jsx src/components/ui/location/LocationSpeciesItem.scss src/shared/components/location/
git mv src/components/ui/location/LocationImagePlaceholder.jsx src/components/ui/location/LocationImagePlaceholder.scss src/shared/components/location/
git mv src/components/ui/map/Map.jsx src/shared/components/map/
git mv src/components/ui/map/PositionMarker.jsx src/shared/components/map/
git mv src/components/ui/imageCarousell src/shared/components/imageCarousell
git mv src/components/ui/media src/shared/components/media
git mv src/components/ui/notFound src/shared/components/notFound
git mv src/components/ui/pagination src/shared/components/pagination
git mv src/components/ui/slideInPanel src/shared/components/slideInPanel
git mv src/components/ui/spinner src/shared/components/spinner
git mv src/components/ui/viewToggle src/shared/components/viewToggle
```

**Deliberately left behind** (moved in later phases): `buttons/{ButtonPrimary,CallToAction}.*`; `form/{TextArea,MultiSelect,ImportGeoJson}.*`; `card/InlineCard.*`; `collapse/Collapsible*`; `location/LocationGeometry*`; `map/{Circle,MarkerWithInfoWindow,NavigationPositionMarker,useData}.*`; all of `article/`, `linkItem/`, `permit/`, `header/`, `footer/`, `route/`.

**Import rewrites.** For each moved file `X` in category `cat`, grep `src` for `cat/X` and replace every relative specifier with `@/shared/components/<cat>/X`. **Single-`../` sibling imports that folder-name greps MISS — handle explicitly:**
- `src/components/ui/media/MediaManagerPanel.jsx`: `'../buttons/ButtonSuccess'`
- `src/components/ui/permit/PermitForm.jsx`: `'../form/Input'`, `'../buttons/ButtonBar'`, `'../buttons/ButtonSecondary'`, `'../buttons/ButtonSuccess'`
- `src/components/ui/form/ImportGeoJson.jsx`: `'../buttons/Button'`
- `src/components/ui/location/LocationGeometryToolbar.jsx`: `'../buttons/Button'`
- `src/components/ui/location/LocationGeometryEditor.jsx`: `'../map/Map'` → `@/shared/components/map/Map`. Its `'../form/ImportGeoJson'`, `'../map/NavigationPositionMarker'`, `'../map/useData'` imports point at NOT-moved files — **leave unchanged** (fixed in Phase 9).
- `src/shared/components/map/PositionMarker.jsx`: `position_marker.svg` import → `@/assets/images/position_marker.svg`.

**Verify** (all zero hits) + loop:
```bash
grep -rnE "'(\.\.?/)+(components/ui/)?buttons/(Button|ButtonBar|ButtonSecondary|ButtonSuccess|LinkButton|LinkButtonPrimaryOutline|ResetButton)'" src
grep -rnE "'(\.\.?/)+(components/ui/)?form/(Error|Input|Label|MultiSelectInput|RangeInput|SearchInput)'" src
grep -rnE "'(\.\.?/)+(components/ui/)?card/(Card|CardBody|CardImage|CardTitle)'" src
grep -rnE "'(\.\.?/)+(components/ui/)?collapse/Collapse'" src
grep -rnE "'(\.\.?/)+(components/ui/)?location/(LocationSpeciesItem|LocationImagePlaceholder)'" src
grep -rnE "'(\.\.?/)+(components/ui/)?map/(Map|PositionMarker)'" src
grep -rnE "'(\.\.?/)+components/ui/(imageCarousell|media|notFound|pagination|slideInPanel|spinner|viewToggle)/" src
```

**Commit:** `restructure: move shared UI components to src/shared/components`

---

## Phase 3 — Auth feature → `src/features/auth`

```bash
mkdir -p src/features
git mv src/pages/login src/features/auth
git mv src/services/authService.js src/services/authService.test.js src/features/auth/
```

**Rewrites:**
- `src/features/auth/Login.jsx`: authService import → `'./authService'` (same folder now).
- `src/shared/context/CurrentUserContext.jsx`: `'@/services/authService'` → `'@/features/auth/authService'`.
- `src/components/ui/header/UserMenu.jsx` and `src/pages/user/edit/EditUser.jsx`: authService imports → `'@/features/auth/authService'`.
- `src/App.jsx`: `'./pages/login/Login'` → `'@/features/auth/Login'`.

**Verify** (zero hits) + loop: `grep -rnE "services/authService|pages/login" src --include='*.js*'`

**Commit:** `restructure: move login + authService to src/features/auth`

---

## Phase 4 — Users feature → `src/features/users`

```bash
git mv src/pages/user src/features/users
git mv src/services/userService.js src/features/users/
```
`src/services/` is now empty.

**Rewrites:** `EditUser.jsx`: userService import → `'@/features/users/userService'`. `src/App.jsx`: `'./pages/user/edit/EditUser'` → `'@/features/users/edit/EditUser'`.

**Verify** (zero hits) + loop: `grep -rnE "'[^'@]*services/userService|'@/services|pages/user/" src --include='*.js*'`

**Commit:** `restructure: move user edit + userService to src/features/users`

---

## Phase 5 — Landing feature → `src/features/landing`

```bash
git mv src/pages/landingPage src/features/landing
mkdir -p src/features/landing/components
git mv src/components/ui/buttons/CallToAction.jsx src/components/ui/buttons/CallToAction.scss src/features/landing/components/
```

**Rewrites:**
- `LandingPage.jsx`: CallToAction import → `'@/features/landing/components/CallToAction'`; `hero_location.png` / `hero_map.png` imports → `'@/assets/images/...'`.
- `CallToAction.jsx`: its LinkButton import should already be `@/shared/components/buttons/LinkButton` from Phase 2 — verify, don't assume.
- `src/App.jsx`: `'./pages/landingPage/LandingPage'` → `'@/features/landing/LandingPage'`.
- **Do NOT touch `LandingPage.scss:210`** `url('../../assets/images/hero_lake.jpg')` — the file depth is unchanged (both old and new paths are two levels below `src/`), so the relative URL still resolves. This is the only permitted relative `assets/` reference.

**Verify** (zero hits) + loop: `grep -rn "pages/landingPage\|buttons/CallToAction" src --include='*.js*'`. Build must not warn about `hero_lake.jpg`.

**Commit:** `restructure: move landing page to src/features/landing`

---

## Phase 6 — Species feature → `src/features/species`

```bash
git mv src/pages/species src/features/species
```
Internal `./` and `./panels/` imports unchanged; shared imports already aliased.

**Rewrites:** `src/App.jsx` only — 4 imports: `'@/features/species/list/Species'`, `'@/features/species/details/SpeciesDetails'`, `'@/features/species/add/AddSpecies'`, `'@/features/species/edit/EditSpecies'`.

**Verify** (zero hits) + loop: `grep -rn "pages/species" src --include='*.js*'`

**Commit:** `restructure: move species pages to src/features/species`

---

## Phase 7 — Permits feature → `src/features/permits`

```bash
git mv src/pages/permit src/features/permits
mkdir -p src/features/permits/components
git mv src/components/ui/permit/PermitForm.jsx src/components/ui/permit/PermitForm.scss src/features/permits/components/
```

**Rewrites:**
- `add/AddPermit.jsx`, `edit/EditPermit.jsx`: PermitForm import → `'@/features/permits/components/PermitForm'`.
- `permit.png` imports in `list/PermitListItem.jsx`, `details/PermitCard.jsx`, `components/PermitForm.jsx` → `'@/assets/images/permit.png'`.
- `src/App.jsx`: 4 imports → `'@/features/permits/{list/Permits,details/PermitDetails,add/AddPermit,edit/EditPermit}'`.

**Verify** (zero hits) + loop: `grep -rn "pages/permit\|components/ui/permit" src --include='*.js*'` and `grep -rnE "'(\.\.?/)+assets" src/features/permits`

**Commit:** `restructure: move permit pages + PermitForm to src/features/permits`

---

## Phase 8 — Map feature → `src/features/map`

```bash
git mv src/pages/map src/features/map
mkdir -p src/features/map/components src/features/map/utils
git mv src/components/ui/map/Circle.jsx src/features/map/components/
git mv src/components/ui/collapse/CollapsibleList.jsx src/components/ui/collapse/CollapsibleList.scss src/features/map/components/
git mv src/utils/formatDistance.js src/features/map/utils/
```

**Rewrites** (grep each old segment across `src`):
- `map/Circle` importers (FishingMap) → `'@/features/map/components/Circle'`
- `collapse/CollapsibleList` importers → `'@/features/map/components/CollapsibleList'`
- `utils/formatDistance` importers → `'@/features/map/utils/formatDistance'`
- `LocationMarker.jsx`: `map_marker.svg` → `'@/assets/images/map_marker.svg'`
- Sibling imports among the 8 map page files (`./LocationClusterer` etc.) stay relative.
- `src/App.jsx`: `'./pages/map/FishingMap'` → `'@/features/map/FishingMap'`.

**Verify** + loop: `grep -rn "pages/map\|components/ui/map/Circle\|CollapsibleList'\|utils/formatDistance" src --include='*.js*'` — only `@/features/map/...` forms allowed; anything relative or `@/pages`/`@/utils` is a bug.

**Commit:** `restructure: move map page + single-use deps to src/features/map`

---

## Phase 9 — Locations feature → `src/features/locations` (largest phase)

```bash
git mv src/pages/location src/features/locations
mkdir -p src/features/locations/components
git mv src/components/ui/article/Article.jsx src/components/ui/article/Article.scss src/features/locations/components/
git mv src/components/ui/form/TextArea.jsx src/components/ui/form/TextArea.scss src/features/locations/components/
git mv src/components/ui/form/MultiSelect.jsx src/features/locations/components/
git mv src/components/ui/form/ImportGeoJson.jsx src/components/ui/form/ImportGeoJson.scss src/features/locations/components/
git mv src/components/ui/card/InlineCard.jsx src/components/ui/card/InlineCard.scss src/features/locations/components/
git mv src/components/ui/collapse/CollapsibleArticle.jsx src/components/ui/collapse/CollapsibleArticle.scss src/features/locations/components/
git mv src/components/ui/collapse/CollapsibleArticlePrimary.jsx src/components/ui/collapse/CollapsibleArticlePrimary.scss src/features/locations/components/
git mv src/components/ui/collapse/CollapsibleParagraph.jsx src/components/ui/collapse/CollapsibleParagraph.scss src/features/locations/components/
git mv src/components/ui/linkItem/LinkItem.jsx src/components/ui/linkItem/LinkItem.scss src/features/locations/components/
git mv src/components/ui/buttons/ButtonPrimary.jsx src/components/ui/buttons/ButtonPrimary.scss src/features/locations/components/
git mv src/components/ui/location/LocationGeometryInput.jsx src/features/locations/components/
git mv src/components/ui/location/LocationGeometryEditor.jsx src/components/ui/location/LocationGeometryEditor.scss src/features/locations/components/
git mv src/components/ui/location/LocationGeometryToolbar.jsx src/components/ui/location/LocationGeometryToolbar.scss src/features/locations/components/
git mv src/components/ui/map/NavigationPositionMarker.jsx src/components/ui/map/NavigationPositionMarker.scss src/features/locations/components/
git mv src/components/ui/map/MarkerWithInfoWindow.jsx src/features/locations/components/
git mv src/components/ui/map/useData.js src/features/locations/components/
```
(The `git mv` lists throughout this plan are exact about which files have a `.scss` — do not invent scss files that don't exist, e.g. `MultiSelect.jsx`, `LocationGeometryInput.jsx`, `MarkerWithInfoWindow.jsx`, `useData.js`, `Map.jsx`, `PositionMarker.jsx`, `Circle.jsx` have none.)

**Rewrites:**
- Grep each old segment (`article/Article`, `form/TextArea`, `form/MultiSelect'`, `form/ImportGeoJson`, `card/InlineCard`, `collapse/CollapsibleArticlePrimary`, `collapse/CollapsibleArticle'`, `collapse/CollapsibleParagraph`, `linkItem/LinkItem`, `buttons/ButtonPrimary`, `location/LocationGeometry`, `map/NavigationPositionMarker`, `map/MarkerWithInfoWindow`, `map/useData`) → `'@/features/locations/components/<Name>'`. Importers live in `src/features/locations/**` and among the moved components themselves.
- Now-same-folder imports inside `components/` collapse to `./`: `LocationGeometryEditor.jsx`: `'../form/ImportGeoJson'` → `'./ImportGeoJson'`, `'../map/NavigationPositionMarker'` → `'./NavigationPositionMarker'`, `'../map/useData'` → `'./useData'`. `CollapsibleArticlePrimary` → `'./CollapsibleArticle'`; `CollapsibleArticle` → `'./CollapsibleParagraph'`. `CollapsibleParagraph`'s Collapse import must be `'@/shared/components/collapse/Collapse'` (done in Phase 2 — verify).
- Page-internal `./steps/...`, `./panels/...`, `./LocationCard` imports unchanged.
- `details/LocationCard.jsx`: `lake.png` → `'@/assets/images/lake.png'`. `components/NavigationPositionMarker.jsx`: both `navigation_position*.svg` imports → `'@/assets/images/...'`.
- `src/App.jsx`: 4 imports → `'@/features/locations/{list/Locations,details/LocationDetails,add/AddLocation,edit/EditLocation}'`.

**Verify** + loop:
```bash
grep -rn "pages/location" src --include='*.js*'      # zero
grep -rn "components/ui" src --include='*.js*'       # hits allowed ONLY in src/App.jsx (header/footer — Phase 10)
grep -rnE "'(\.\.?/)+assets" src --include='*.js*'   # zero (the landing SCSS url() is not a JS import)
```

**Commit:** `restructure: move location pages + geometry subsystem to src/features/locations`

---

## Phase 10 — App shell → `src/app`

```bash
mkdir -p src/app
git mv src/App.jsx src/app/App.jsx
git mv src/components/route src/app/route
git mv src/components/ui/header src/app/header
git mv src/components/ui/footer src/app/footer
```

**Rewrites:**
- `src/index.jsx`: `import App from './App'` → `'@/app/App'`.
- `src/app/App.jsx`: footer/header/route imports → `'@/app/footer/Footer'`, `'@/app/header/Header'`, `'@/app/route/ProtectedRoute'`, `'@/app/route/ProtectedRouteCurrentUser'`, `'@/app/route/ScrollToTop'`. All other App.jsx imports are already `@/features/...` / `@/shared/...`.
- `Header.jsx` → `'./UserMenu'` unchanged; `UserMenu.jsx` authService already `@/features/auth/authService`.

**Verify** + loop: `grep -rn "components/" src --include='*.js*'` → only `@/shared/components/` and `@/features/*/components/` hits. `grep -rnE "'\.\./" src --include='*.js*'` → **zero, repo-wide**.

**Commit:** `restructure: move App shell (App, header, footer, route guards) to src/app`

---

## Phase 11 — Final sweep, delete empty folders, update docs

1. **Prove the old tree holds no files**, then delete it:
   ```bash
   find src/pages src/components src/services src/hooks src/utils src/context src/constants -type f 2>/dev/null   # MUST print nothing
   rm -rf src/pages src/components src/services src/hooks src/utils src/context src/constants
   ```
2. **Prove no import references the old tree** (all must print nothing):
   ```bash
   grep -rnE "'(\.\.?/)+(pages|components|services|hooks|utils|context|constants)/" src --include='*.js' --include='*.jsx'
   grep -rnE "'@/(pages|components|services|hooks|utils|context|constants)/" src --include='*.js' --include='*.jsx'
   grep -rnE "'\.\./" src --include='*.js' --include='*.jsx'
   ```
3. **Test-count invariant:** `find src -name '*.test.js' | wc -l` → **6**; `npx vitest run` matches the Phase 0 baseline exactly.
4. `npm run lint` + `npm run build`; confirm `build/index.html` exists.
5. **Update `AGENTS.md`** — every old `src/` path in it is now wrong. Update: Commands (test example path), Required environment (`assertEnv` path), Routing & auth (route guards → `src/app/route/`, contexts → `src/shared/context/`, `useGeolocation` → `src/shared/hooks/`), Page/domain structure (describe `src/app`, `src/features/{map,locations,species,permits,auth,users,landing}`, `src/shared/*`, and the feature-internal convention: route subfolders + flat `components/` for feature-private components), Services layer (`src/shared/services/`; authService in `features/auth`, userService in `features/users`), Map section, List pages (`src/shared/hooks/`), Forms (`src/features/locations/add/steps/`, `src/features/permits/components/PermitForm`), MediaManagerPanel and ToastContext path mentions, and the Code style bullet "only move it to `src/components/ui/`..." → "only move it to `src/shared/components/` once used by more than one feature".
6. **Update `CODE_REVIEW.md`**: mark row **S4** fixed (date 2026-07-XX + one-line summary). Leave historical rows' old paths as-is.
7. **Commit:** `restructure: remove empty layer folders, update AGENTS.md/CODE_REVIEW.md for feature layout`

---

## Phase 12 — End-to-end verification, then merge

1. **Backend up?** `curl -sk -o /dev/null -w "%{http_code}" --max-time 3 https://localhost:7299/api/locations` — if not 200, start it per "Starting the backend" in `.claude/skills/run-fishingmap-web/SKILL.md`.
2. **Invoke the `run-fishingmap-web` skill** to start the dev server and drive the UI through this checklist. Watch the browser console on every page for module-resolution errors:
   - `/` — hero background renders (the SCSS `url()` — the one path NOT verified by the build graph), hero images, CallToAction buttons navigate.
   - `/map` — markers cluster; click marker → info window (image carousel/placeholder, species items, distance pill); drag/resize radius circle → results refresh; locate button; map-type control; locations panel.
   - `/locations` — search `q`, species multi-select, distance slider, sort, pagination; URL params update.
   - `/locations/:id` — details card, image carousel, species/permit lists, geometry rendered on map.
   - `/species` list + `/species/:id`; `/permits` list (permit.png images) + `/permits/:id`.
   - `/login` — bad credentials → inline error; good credentials → UserMenu in header; logout.
   - Protected routes — logged out: `/locations/add` redirects to `/`; logged in: `/locations/add` renders the 4-step wizard and **Step Map exercises the geometry editor + GeoJSON import** (the deepest-moved subsystem); `/users/:id/edit` gated to the logged-in user.
3. `git push -u origin restructure/feature-folders` (safe — the workflow only triggers on master pushes).
4. **Ask the user before merging/pushing master** — that deploys to Azure. On confirmation: `git checkout master && git merge --no-ff restructure/feature-folders && git push`, then watch the Actions run to green.

---

## Risk notes for the executor (read before starting)

1. **Three-way `collapse/` split:** `Collapse` → shared (P2); `CollapsibleArticle{,Primary}`, `CollapsibleParagraph` → locations (P9); `CollapsibleList` → map (P8).
2. **`location/` split:** `LocationSpeciesItem` + `LocationImagePlaceholder` are SHARED (map uses them) — NOT locations-owned. The three `LocationGeometry*` files are locations-owned.
3. **`map/` split:** `Map` + `PositionMarker` shared; `Circle` → map; `NavigationPositionMarker`, `MarkerWithInfoWindow`, `useData` → locations.
4. **`buttons/` three-way split:** 7 primitives → shared; `ButtonPrimary` → locations; `CallToAction` → landing. `ButtonBar` stays shared (decided).
5. **`form/MultiSelect` vs `MultiSelectInput`** — match full specifiers with the closing quote.
6. `npm test` is watch mode — always `npx vitest run`. Never end a phase with fewer than 6 test files.
7. `index.html` hardcodes `/src/index.jsx` — `index.jsx`/`index.scss` stay at `src/` root.
8. `LandingPage.scss` `url('../../assets/images/hero_lake.jpg')` stays relative (same depth after move).
9. 13 single-level `../sibling/` imports inside `src/components/ui` don't contain the string `components/ui` — folder-name greps miss them; use the explicit lists in Phases 2 and 9.
10. Intermediate `@/services/authService` exists between Phases 1–3 by design; Phase 3's grep retires it.
11. Do not "fix" pre-existing lint warnings (`react-hooks/refs`, `react-hooks/set-state-in-effect` are warnings by design).
12. Never push `master` mid-work — it auto-deploys to Azure.
13. `manualChunks` in vite.config.js references npm packages only — do not touch it.
