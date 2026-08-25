# Nix Ionic 2 — Architecture & Phase Status

Phase 0, 1, 2, 3, 4, 5: Baseline, bugs, setup, cache, overlays, Vite plugin, Capacitor.

Status: **Phase 0 complete (unit-level + bundle fixtures + E2E + contract tests).
Phase 1 complete (bugs 1–10 fixed).
Phase 2 complete (setup + manifest + subpaths + peer deps + Vite plugin).
Phase 3 complete (cache policies: max/LRU/TTL/route-level + NavigationManager + StackManager + page-state persistence).
Phase 4 complete (reactive overlay wrappers + E2E overlays + accessibility/leak tests).
Phase 5 partial complete (Capacitor optional subpath — StatusBar/SplashScreen/Keyboard/Haptics/App).**
Swipe-back documented as unsupported (no WebKit repro).
Version: 2.0.0 — 235 unit tests + 56 E2E tests (real @ionic/core, no mocks).

## Phase 1 — Bug fixes (all 10 promoted to regression guards)

All 10 bugs from Phase 0 have been fixed and their tests promoted to permanent
`it` regression guards. The 3 existing lifecycle tests were updated
to the new symbol-based contract.

| # | Bug | Fix |
|---|-----|-----|
| 1 | `cache:false` never runs cleanup on leave | `_uncachedCleanups` WeakMap tracks cleanup for non-cached pages; transition path + outlet unmount run it before DOM removal. |
| 2 | `invalidateCache` on active page disposes reactivity, leaves dead visible DOM | Active-page invalidation no longer runs cleanup; it moves cleanup to `_uncachedCleanups` and drops the cache entry so the next visit remounts fresh. The live view stays intact until navigation away. |
| 3 | `IonPage.onInit` discards `watch()` disposers | New `_connectIonicLifecycle` symbol method stores disposers and returns a disposer; outlet calls it and includes it in the view cleanup. |
| 4 | `IonPage` lifecycle breaks if subclass overrides `onInit` without `super` | Lifecycle wiring moved out of `onInit` entirely; the outlet calls the symbol method directly. Subclasses can override `onInit` freely. |
| 5 | `beforeEnter` guard runs twice (auto-bootstrap + `_transitionTo`) | `_guardsInCoreRouter` flag tracks whether the outlet bootstrapped the core router with guards; `_transitionTo` skips the guard when the core router already handles it. |
| 6 | `PageContext` has no `query` field | `PageContext` now includes `query: Record<string, string>` from `router.query.value`; `adaptGuardForCore` extracts query from the `to` path. |
| 7 | wildcard `*` excluded from `_routesByPath` → no fallback component | Wildcard route stored separately as `_wildcardRoute`; `_resolveRouteDefinition` falls back to it when the core router matched `*`. |
| 8 | duplicate route paths overwritten silently | Constructor emits `console.warn` on duplicate paths and duplicate wildcards. |
| 9 | `_pendingNav` stores only `{ path }`, loses intent; processed after cancelled transition | `_pendingNav` now stores `{ path, intent }`; cancelled transitions (guard reject without redirect) drop pending navs; redirects clear stale pending before enqueuing the redirect target. |
| 10 | cache key omits query and uses non-robust encoding (collisions) | `_buildCacheKey` now accepts `query` param and encodes both params and query with `encodeURIComponent`; outlet effect observes `router.query` so query-only navigation triggers a transition. |

### Verification after Phase 1

- `npm test`: **13 files, 235 passed (235 total)** — green, 0 todo.
  - Original 63 tests: all still passing (3 lifecycle tests updated to new contract).
  - 10 Phase 0 bug tests: all promoted from `it.fails`/`it.todo` to `it` and passing.
- `npm run typecheck`: passes.

## Phase 0 — Done (unit-level)

### Failing tests that reproduce documented bugs

`src/__tests__/phase0-bugs.test.ts` — originally 8 `it.fails` + 2 `it.todo`,
now 10 `it` (all promoted after Phase 1 fixes).

Convention: each `it.fails` asserted the **correct** behavior and was green
while the bug was present. When Phase 1 fixed the bug, the test flipped to red
and was promoted (`it.fails` → `it`) to become a regression guard.

Verified: every `it.fails` failed on a clean `AssertionError` (not a setup
throw) when run as a plain `it`. Bug → observed assertion:

| # | Bug | Assertion failure observed (pre-fix) |
|---|-----|----------------------------|
| 1 | `cache:false` never runs cleanup on leave | `expected false to be true` |
| 2 | `invalidateCache` on active page disposes reactivity, leaves dead visible DOM | `expected undefined to be '5'` |
| 3 | `IonPage.onInit` discards `watch()` disposers | `expected 2 to be 1` |
| 4 | `IonPage` lifecycle breaks if subclass overrides `onInit` without `super` | `expected +0 to be 1` |
| 5 | `beforeEnter` guard runs twice (auto-bootstrap + `_transitionTo`) | `expected ... called 1 times, but got 2 times` |
| 6 | `PageContext` has no `query` field | `expected undefined to be defined` |
| 7 | wildcard `*` excluded from `_routesByPath` → no fallback component | `expected null to be truthy` |
| 8 | duplicate route paths overwritten silently | `expected 'warn' to be called at least once` |

`it.todo` (originally deferred, now fixed and promoted to `it`):

| # | Bug | Fix |
|---|-----|-----|
| 9 | `_pendingNav` stores only `{ path }`, loses intent; processed after cancelled transition | `_pendingNav` now stores `{ path, intent }`; cancelled transitions drop pending navs; redirects clear stale pending. |
| 10 | `_buildCacheKey` omits query and uses non-robust encoding (collisions) | `_buildCacheKey` accepts `query` param with `encodeURIComponent`; outlet effect observes `router.query`. |

### Baseline verification

- `npm test`: **13 files, 235 passed (235 total)** — green, 0 todo.
- `npm run typecheck`: passes.

## Phase 2 — Modular setup (complete)

### Done

- **`setup.ts` rewritten** into three granular functions:
  - `initializeNixIonic(options)` — configures Ionic Core once, returns `SetupHandle` with diagnostics.
  - `registerIonicComponents(...definers)` — incremental & idempotent, works for lazy routes.
  - `registerIonicons(map)` — incremental with collision diagnostics.
  - `setupNixIonic(options)` — backward-compatible facade that calls all three.
- **No `unpkg@latest` default**: uses official `setAssetPath` from ionicons. Default mode is `"inline"` (no remote fetch). CDN is opt-in only.
- **SSR-safe**: no `window` access at module load; each function guards with `_hasWindow()`.
- **No `isInitialized` blocking**: `registerIonicComponents` and `registerIonicons` are always incremental.
- **Peer dependencies**: `@ionic/core` and `ionicons` moved from `dependencies` to `peerDependencies` + `devDependencies`.
- **15 new setup tests** covering compat facade, incremental registration, collision warnings, asset path modes.

### Remaining Phase 2 work

— None. All Phase 2 work is complete (bundle fixtures done in Phase 0.A).

### Phase 2+ — Vite plugin `nixIonic()` (done)

- **`src/vite-plugin.ts`**: Vite plugin that scans `html\`\`` template literals for:
  - `<ion-*>` tags → generates direct subpath imports + `registerIonicComponents()`
  - `name="icon-name"` on `<ion-icon>` → generates `ionicons/icons` imports + `registerIonicons()`
  - Dynamic `<ion-${var}>` and `name=${var}` → emits diagnostic warnings
- **Virtual module** `virtual:nix-ionic/registration` — auto-generated, imports only
  detected components/icons, calls `initializeNixIonic()` + registration functions.
- **Allowlists**: `nixIonic({ allowTags: [...], allowIcons: [...] })` suppresses
  diagnostics and includes extra tags/icons in the virtual module.
- **`./vite-plugin` subpath** added to package.json exports.
- **18 plugin tests** covering tag scanning, icon scanning, dynamic detection,
  allowlists, virtual module resolution, and code generation.
- **Build**: `vite-plugin.js` bundles babel parser/traverse (build-time only).

### Phase 2 — Component manifest & subpaths (done)

- **`src/components/manifest.ts`**: typed manifest of all 93 Ionic 8 custom elements
  with category, dependencies, legacy flags, and lookup helpers (`getComponentByTag`,
  `getComponentsByCategory`, `getDependencyChain`, `tagToSubpath`, `tagToDefinerName`).
- **89 direct subpaths**: `@deijose/nix-ionic/components/button`, `/datetime`, `/action-sheet`,
  etc. — each ~0.2KB, re-exporting only that component's `defineCustomElement`.
- **`package.json` exports**: added `./components/manifest` and `./components/*` wildcard.
- **Bundles expanded**: layout (6→13), navigation (7→11), forms (10→20), lists (14→29),
  overlays (4→9). `allComponents` now 93 definers (was 52).
- **`allComponents` deprecated** with JSDoc warning; kept for migration only.
- **`vite.lib.config.ts`**: auto-discovers component entry files from `src/components/`.
- **10 new manifest tests** covering lookup, dependency chain, subpath/definer naming,
  legacy exclusion, and previously-missing component presence.
- **Build verified**: `npm run build:lib` produces 90 component files + manifest + bundles.
- Original 63 tests unchanged and still passing.

## Phase 3 — Cache policies (complete)

### Done

- **`CachePolicy` interface**: `{ max?: number; ttl?: number; strategy?: "lru" | "fifo" }`
- **Outlet-level policy** via `IonRouterOutletOptions.cachePolicy`
- **Route-level override** via `RouteDefinition.cache` (`boolean | CachePolicy`)
  - `false` — never cache this route (cleanup on leave)
  - `true` — use outlet default
  - `{ max, ttl, strategy }` — per-route override
- **LRU eviction**: when `max` is exceeded, evicts least-recently-used entry
- **FIFO eviction**: alternative strategy, evicts oldest creation
- **TTL eviction**: entries expire after `ttl` ms via `setTimeout`, with cleanup
- **Eviction safety**: evicted entries run `cleanup()` + DOM removal exactly once
- **TTL timer cleanup**: timers cleared on `delete()`, `clear()`, and outlet unmount
- **6 cache policy tests**: LRU max, TTL expiry, route-level `cache:false`, type acceptance

### Remaining Phase 3 work

- ~~Per-tab navigation stacks with cache isolation~~ — done (StackManager + CacheRegistry per-tab)
- ~~Reactive back-button behavior~~ — done (canGoBack signal in NavigationManager)
- ~~Cache invalidation hooks~~ — done via NavigationManager
- ~~Hash mode `back()` to empty hash~~ — fixed (transition queue + initial hash `#/`)

### Phase 3 — NavigationManager (done)

- **`src/navigation.ts`**: single coordination authority for navigation
  - **`StackManager`** — extracted from IonRouterOutlet, per-tab stack management
    - `keyForPath`, `apply`, `stackDepth`, `stackTop`, `stackEntries`
    - `resetTab`, `resetAll`
  - **`NavigationManager`** — wraps StackManager + adds:
    - Transition state tracking (`isTransitioning`, `pendingNav`, `beginTransition`, `endTransition`)
    - Navigation hooks: `beforeNav` (cancelable), `afterNav`, `onTabChange`
    - Programmatic tab switching: `switchTab(tabPrefix)` → returns target path
    - Route-pattern cache invalidation: `registerInvalidationHandler`, `invalidateRoute`, `invalidatePattern`
    - `dispose()` for full cleanup
- **IonRouterOutlet integration**: optional `navigation` option in `IonRouterOutletOptions`
  - When provided, outlet delegates stack management and transition state to the manager
  - `beforeNav` hooks run before guard checks
  - `afterNav` and `onTabChange` hooks run after transition completes
  - Cache invalidation handlers registered for each route
- **`./navigation` subpath** in package.json exports + Vite lib config
- **40 navigation tests**: StackManager (10), NavigationManager transition state (3),
  beforeNav hooks (8), afterNav hooks (3), onTabChange hooks (4), switchTab (3),
  cache invalidation (6), dispose (1)
- **Build**: `navigation.js` = 5.11KB (gzip 1.45KB)

### Phase 3 — Page-state persistence protocol (done)

- **`src/page-state.ts`**: opt-in serializable page-state persistence
  - `createPageState(pageId, signals, options)` — per-page controller
  - `save()` — serializes declared signals to storage (skips non-serializable)
  - `restore()` — deserializes and writes back into signals
  - `clear()` — removes saved state for this page
  - `clearAllPageState(backend?, namespace?)` — bulk clear (logout flows)
- **Serialization validation**: `isSerializable()` rejects:
  - `undefined`, functions, symbols, bigint
  - DOM nodes, elements, document fragments
  - Class instances (non-plain prototypes)
  - Circular references
  - Arrays/objects containing any of the above
- **Storage backends**: `sessionStorage` (default) or `localStorage` (opt-in)
- **Namespace + key suffix**: multi-app isolation and per-user state
- **Corrupted data handling**: invalid JSON is cleared, restore returns false
- **Partial restore**: only signals with saved data are updated
- **`./page-state` subpath** in package.json exports + Vite lib config
- **27 page-state tests**: serialization validation, save/restore, non-serializable
  skipping, storage backends, namespace/suffix, clearAll, corrupted data, partial restore
- **Build**: `page-state.js` = 2.45KB (gzip 1.03KB)

## Phase 4 — Reactive overlay wrappers (complete)

### Done

- **`src/overlays.ts`**: signal-based reactive wrappers for all 6 Ionic overlay controllers:
  - `createToast()`, `createAlert()`, `createLoading()`, `createActionSheet()`, `createPopover()`, `createModal()`
  - Each returns an `OverlayHandle` with:
    - `presented: Signal<boolean>` — reactive presentation state
    - `result: Signal<OverlayEventDetail | null>` — dismiss event detail
    - `present(opts)` — creates + presents (fire-and-forget dismiss handling)
    - `dismiss(data?, role?)` — dismisses the active overlay
    - `dispose()` — transactional cleanup, dismisses if still presented
  - Stale-result protection via token-based tracking
  - Latest-wins: presenting a new overlay dismisses the previous one
- **Convenience helpers**:
  - `showToast(opts)` — one-shot fire-and-forget
  - `withLoading(opts, task)` — presents loading, runs async task, dismisses on settle/error
  - `confirm(opts)` — promise-based confirm dialog
- **Re-exports** all Ionic controllers for advanced use
- **`./overlays` subpath** added to package.json exports
- **25 overlay tests** covering present, dismiss, dispose, stale protection, one-shot, withLoading, confirm, delegate, picker (inline + controller-based)
- **Nix.js delegate** (`createNixDelegate()`): implements Ionic's `FrameworkDelegate`
  to mount `NixTemplate`/`NixComponent` inside modal/popover overlays
  - `attachViewToDom` — mounts Nix.js content into a wrapper div, tracks unmount handle
  - `removeViewFromDom` — calls unmount, removes wrapper from DOM
  - CSS classes support on the wrapper
- **`createModalController(delegate?)`**: enhanced modal with automatic Nix.js delegate
  - `component: () => NixTemplate | NixComponent` — content mounted via delegate
  - Passes through all modal options (backdropDismiss, showBackdrop, cssClasses, etc.)
- **`createPopoverController(delegate?)`**: enhanced popover with automatic Nix.js delegate
  - Same pattern as modal, with `event` for anchoring
- **`createPicker()`**: reactive picker overlay controller (column-based selection).
  Reimplemented for Ionic 8 using `createInlineOverlayHandle()` with the `isOpen`
  property pattern (controller-based `pickerController.create()` hangs in Ionic 8).
- **Build**: `overlays.js` = 2.19KB (gzip 0.86KB)

### Remaining Phase 4 work

— None. All Phase 4 work is complete.

### Phase 4 E2E completion (this session)

- **E2E overlay tests** (`e2e/nix-ionic.spec.ts`): 7 new tests covering all
  remaining overlays with real Ionic Core:
  - Alert: present + dismiss via `dismiss()`, cancel role
  - Loading: present + auto-dismiss
  - Action sheet: present + dismiss, header text verification
  - Picker: present + dismiss, column options verification
- **Ionic 8 picker fix**: `createPicker()` reimplemented to use the inline
  `isOpen` property pattern instead of `pickerController.create()` (which
  hangs in Ionic 8). New `createInlineOverlayHandle()` factory handles
  inline overlays that use `isOpen` instead of controller-based present/dismiss.
- **Accessibility tests** (`e2e/accessibility-leaks.spec.ts`): 7 tests:
  - `ion-toolbar` renders shadow DOM
  - `ion-button` renders native `<button>` in shadow DOM
  - `ion-title` renders shadow DOM
  - `ion-content` has `role="main"`
  - `ion-back-button` has accessible label (`aria-label="back"`) in shadow DOM
  - `ion-router-outlet` does not trap focus
  - Keyboard focus moves to interactive elements on Tab
- **Leak tests** (`e2e/accessibility-leaks.spec.ts`): 6 tests:
  - Repeated navigation (10x) does not leak `ion-page` elements
  - Repeated toast presentation (10x) does not leak DOM nodes
  - Repeated alert presentation (10x) does not leak DOM nodes
  - Event listeners cleaned up after navigation (no page errors)
  - Overlay dismiss removes element from DOM
  - Uncached page navigation does not accumulate pages

## Phase 5 — Capacitor optional subpath (partial)

### Done

- **`src/capacitor.ts`**: isolated behind `@deijose/nix-ionic/capacitor` subpath
  - **Zero web bundle cost**: 0 references to `@capacitor/*` in main bundle
  - All `@capacitor/*` imports are dynamic (`await import(...)`) — only loaded
    in native environments
  - Plugin cache: dynamic imports are cached after first load
- **Plugin wrappers** (all with graceful web degradation):
  - `StatusBar` — setStyle, setBackgroundColor, show, hide, setOverlaysWebView
  - `SplashScreen` — show, hide
  - `Keyboard` — setStyle, setResizeMode, show, hide, onWillShow, onDidShow, onWillHide, onDidHide
  - `Haptics` — impact, notification, vibrate, selectionStart/Changed/End
  - `App` — getState, getInfo, exitApp, onBackButton, onAppStateChange, onUrlOpen, onResume
- **Platform detection**: `isNative()`, `isWeb()` — cached after first call
- **`createCapacitorApp(options)`**: bootstrap helper that:
  - Configures status bar (style, color, overlaysWebView)
  - Hides splash screen (with fade)
  - Wires hardware back button (with custom handler support)
  - Returns `{ ready(), dispose() }`
- **`@capacitor/*` as optional peer dependencies** via `peerDependenciesMeta`
- **`./capacitor` subpath** in package.json exports + Vite lib config
- **19 capacitor tests**: platform detection, web no-op degradation, native
  plugin calls, createCapacitorApp bootstrap, type acceptance
- **Build**: `capacitor.js` = 6.00KB (gzip 1.36KB), `capacitor.cjs` = 4.89KB (gzip 1.25KB)
- **Verified**: `grep -c "@capacitor" dist/lib/nix-ionic.js` → 0

### Remaining Phase 5 work

- Camera/Filesystem plugin wrappers (heavier, maybe separate subpath)
- Push notifications integration
- Deep link handling with router integration
- E2E test app on real iOS/Android via Capacitor

## Phase 0 infrastructure — all done

### A. Bundle-size fixtures + baseline (done)

Per plan §"Testing Strategy / 5. Bundle-size fixtures". Real consumer
fixtures that validate tree-shaking with actual Vite production builds.

- **`bundle-fixture/`** directory with 4 fixtures:
  - `minimal/` — 1 component (`ion-button` only)
  - `partial/` — layout + buttons bundles
  - `full/` — all components + overlays + navigation + router outlet
  - `capacitor-only/` — Capacitor subpath only (validates zero web cost)
- **`scripts/measure-bundles.mjs`**: builds each fixture with Vite and
  measures raw/gzip/brotli sizes. Validates tree-shaking assertions.
- **`npm run measure-bundles`** script in package.json.

Results (gzip):

| Fixture | Raw | Gzip | Brotli |
|---|---|---|---|
| minimal (1 component) | 1.90 KB | 0.82 KB | 0.71 KB |
| partial (layout + buttons) | 3.42 KB | 1.05 KB | 0.94 KB |
| full (all + overlays + nav) | 28.68 KB | 7.26 KB | 6.40 KB |
| capacitor-only | 1.96 KB | 0.59 KB | 0.50 KB |

Tree-shaking validated: minimal = 11.3% of full bundle (gzip).
Capacitor subpath = 604 bytes gzip (zero `@capacitor/*` in web bundle).

### B. Playwright E2E app with real Ionic Core (done)

- **`e2e/`** directory with Vite + Nix.js + `@ionic/core` (no mocks)
- **`playwright.config.ts`**: Chromium mobile viewport, `prefers-reduced-motion: reduce`
- **`vite.e2e.config.ts`**: Vite dev server on port 5174
- **`e2e/app/main.ts`**: Real app with HomePage, DetailPage, UncachedPage
  - Uses real `@ionic/core` custom elements
  - Hash mode router (works under any base path)
  - Toast, modal, alert, loading, action-sheet, and picker overlays
- **`e2e/nix-ionic.spec.ts`**: 19 E2E tests (all pass)
  - Navigation: forward, back, deep stack
  - Lifecycle: cached page state, uncached remount
  - Overlays: toast, modal, alert (present/dismiss/cancel), loading,
    action-sheet (present/dismiss/header), picker (present/dismiss/columns)
  - Back button: ion-back-button navigation
  - Contract: custom element definitions, ion-page creation, no unpkg URLs
- **`e2e/contract.spec.ts`**: 24 contract tests (all pass)
- **`e2e/accessibility-leaks.spec.ts`**: 13 tests (all pass)
  - Accessibility: ARIA roles, shadow DOM, focus management
  - Leaks: repeated navigation, repeated overlays, listener cleanup,
    uncached page accumulation
- **Hash mode `back()` to empty hash** — **Fixed**: E2E app sets initial
  hash to `#/` and `_isTransitioning` check moved before `cacheKey` check so
  rapid navigations queue as pending instead of being silently dropped.

### C. Swipe: documented as unsupported (done)

Per plan §"Principios / Ionic real como contrato" and §"Phase 4". The current
code never assigns `swipeHandler`; iOS swipe-back is **not** demonstrated.
Until a Playwright WebKit/mobile test reproduces a real swipe complete **and**
swipe cancel with correct lifecycle/rollback, swipe is documented as
unsupported in the README "Limitations" section. Do not claim native swipe.

### D. Contract tests with real Ionic Core (done)

- **`e2e/contract.spec.ts`**: 24 contract tests with real `@ionic/core` (no mocks)
  - Component registration: custom element definitions, ion-page CSS class
  - `ion-router-outlet.commit()`: forward, back, duration:0, promise resolution
  - Lifecycle events: ordering, CustomEvent type, all four events
  - Overlay present/dismiss: toast, alert, loading (direct element creation)
  - Properties vs attributes: color, disabled (property reads)
  - Form event detail: ion-button click, ionChange detail shape
  - No external dependencies: no unpkg, no jsdelivr, single Ionic version

## How to use the bug suite going forward

- Bugs 1–10 are all fixed and promoted to permanent `it` regression guards.
- Never delete a Phase 0 test without a replacement regression guard.
