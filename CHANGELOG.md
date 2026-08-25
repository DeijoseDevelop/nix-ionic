# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- [PHASE0.md](./PHASE0.md) — development roadmap and status
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
