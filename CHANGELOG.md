# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2]

### Fixed

- **Tab bar layout**: `ion-tab-bar` without `ion-tabs` wrapper had no CSS
  positioning — it appeared at the top of the flex flow, behind
  `ion-router-outlet` (which is `position:absolute; inset:0`). Added
  `createTabsLayout(outlet, tabBar)` which wraps both in `<ion-tabs>`,
  providing the correct CSS layout context (flex column, `tabs-inner`
  with `flex:1`, `<slot name="bottom">` for the tab bar).
- **Tab bar icons**: `createBottomTabBar` uses dynamic `name=${() => tab.icon}`
  expressions which the Vite plugin cannot detect. Added `icons` option to
  `BottomTabBarOptions` — pass icon SVG data and `createBottomTabBar` calls
  `addIcons()` internally.

### Added

- **`createTabsLayout(outlet, tabBar)`**: wraps an `IonRouterOutlet` and tab
  bar in `<ion-tabs>`, providing the correct CSS layout context. This is the
  recommended way to use tabs with `IonRouterOutlet`.
- **`BottomTabBarOptions.icons`**: `IconDefinitionMap` for registering tab
  bar icons that can't be auto-detected by the Vite plugin.

---

## [2.0.1]

### Fixed

- **Vite plugin: core tags no longer generate invalid imports** —
  `ion-app`, `ion-router-outlet`, `ion-back-button`, and `ion-icon` are
  registered by `initializeNixIonic()` and do not have individual
  component subpaths. The plugin now skips these tags instead of
  generating imports to `@deijose/nix-ionic/components/app` (which
  doesn't exist).

### Tests

- 236 unit tests (was 235) — added test for core-tag skipping.

---

## [2.0.0]

Major rewrite focused on tree-shakeable components, reactive overlays, cache
policies, optional Capacitor, and leak-free lifecycle.

### Breaking changes

- `setupNixIonic()` no longer registers all components by default. Use
  `initializeNixIonic()` + `registerIonicComponents()` or the Vite plugin.
- `unpkg@latest` asset URL removed. Uses `setAssetPath` — you control assets.
- Overlay factories renamed from React-style `use*` to Nix.js `create*` pattern:
  `createToast()`, `createAlert()`, `createLoading()`, `createActionSheet()`,
  `createPopover()`, `createModal()`.
- Single router authority — no more competing Ionic/Nix routers.
- `createPicker()` reimplemented for Ionic 8 inline `isOpen` pattern (no longer
  uses `pickerController.create()` which hangs in Ionic 8).

### Added

- **Tree-shakeable components**: per-component subpath imports
  (`@deijose/nix-ionic/components/button`) + bundle subpaths
  (`@deijose/nix-ionic/bundles/layout`).
- **Vite plugin** `nixIonic()`: auto-detects `<ion-*>` tags in `html```
  templates and generates registration imports.
- **Reactive overlays**: signal-based `create*` controllers with `presented`
  and `result` signals, latest-wins semantics, stale-result protection.
- **Cache policies**: LRU/FIFO max eviction, TTL expiry, per-route overrides,
  per-tab cache isolation.
- **Page-state persistence**: opt-in serializable state across navigation.
- **NavigationManager + StackManager**: reactive `canGoBack`, single authority.
- **Optional Capacitor**: `@deijose/nix-ionic/capacitor` subpath with zero web
  bundle cost. StatusBar, SplashScreen, Keyboard, Haptics, and App plugin
  wrappers with graceful web degradation (no-op on web).
- **Nix.js delegate** for modal/popover overlays: mounts NixTemplate/NixComponent
  inside Ionic overlays.
- **Bundle measurement script** (`npm run measure-bundles`): validates
  tree-shaking with 4 fixtures (minimal, partial, full, capacitor-only).
  Minimal fixture = 11.3% of full bundle (gzip), capacitor-only = 604 bytes.

### Fixed

- **Hash-mode navigation race**: transition race condition fixed — rapid
  navigations queue as pending instead of being silently dropped.
  `_isTransitioning` check moved before `cacheKey` early return.
- **Cached page visibility**: `ion-page-hidden` and inline `display` state
  removed before and after `commit()` to prevent stale hidden state with
  reduced-motion/zero-duration transitions.
- **Ionic 8 picker**: `createPicker()` reimplemented with `createInlineOverlayHandle()`
  using the `isOpen` property pattern (controller-based `pickerController.create()`
  hangs in Ionic 8).

### Tests

- 235 unit tests (13 files)
- 56 E2E tests with real `@ionic/core` (no mocks):
  - 19 application E2E (navigation, lifecycle, overlays, back button)
  - 24 contract tests (custom elements, commit, lifecycle, overlays, properties,
    events, network isolation)
  - 13 accessibility/leak tests (ARIA roles, shadow DOM, focus management,
    repeated navigation, overlay disposal, listener cleanup)

### Documentation

- [MIGRATION.md](./MIGRATION.md) — full 1.x → 2.0 migration guide
- Architecture document: `docs/arquitecturas/ARCHITECTURA_TECNICA_NIX_JS_IONIC.md`
  (in the monorepo `docs/` directory)
- README "Limitations" section: iOS swipe-back documented as unsupported

### Migration

See [MIGRATION.md](./MIGRATION.md) for the full 1.x → 2.0 migration guide.

---

## [1.4.14]

Previous release — basic Ionic lifecycle & router bridge.

- `setupNixIonic()` registered all components from `unpkg@latest`
- React-style `use*` overlay factories
- No cache policies
- No Vite plugin
- No Capacitor support
