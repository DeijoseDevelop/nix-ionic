# Migration guide: 1.x → 2.0

This guide covers breaking changes, deprecations, and new features when upgrading from `@deijose/nix-ionic` 1.x to 2.0.

## Summary

2.0 is a major rewrite focused on:

- **Tree-shakeable components** — import only what you use, auto-detected by Vite plugin
- **Reactive overlays** — `create*` pattern controllers with signal-based state
- **Cache policies** — LRU/FIFO max eviction, TTL expiry, per-route overrides
- **Page-state persistence** — opt-in serializable state across navigation
- **Optional Capacitor** — zero web bundle cost, isolated subpath
- **Single router** — no more competing Ionic/Nix routers
- **Leak-free lifecycle** — proper cleanup of effects, watchers, timers, overlays

## Breaking changes

### 1. `setupNixIonic()` no longer registers all components

**Before (1.x):**
```ts
setupNixIonic(); // registers everything including unpkg@latest assets
```

**After (2.0):**
```ts
import { initializeNixIonic, registerIonicComponents } from "@deijose/nix-ionic";
import { defineIonButton } from "@deijose/nix-ionic/components/button";

initializeNixIonic();
registerIonicComponents(defineIonButton);
```

**Migration:** Use the compatibility facade or the Vite plugin:

```ts
// Option A: compatibility facade (registers everything)
import { setupNixIonic } from "@deijose/nix-ionic";
import { allComponents } from "@deijose/nix-ionic/bundles/all";
setupNixIonic({ components: allComponents });

// Option B: Vite plugin (auto-detects from html`` templates)
import { nixIonic } from "@deijose/nix-ionic/vite-plugin";
// vite.config.ts: plugins: [nixIonic()]
// app entry: import "virtual:nix-ionic/registration";
```

### 2. `unpkg@latest` asset URL removed

**Before:** Ionic/Ionicons assets loaded from `unpkg.com@latest` by default.
**After:** Uses official `setAssetPath` — you control where assets are served from.

**Migration:** If you relied on the CDN, configure it explicitly:

```ts
initializeNixIonic({
  // assets are resolved relative to your bundle by default
  // for CDN: setAssetPath("https://unpkg.com/@ionic/core@8/dist/")
});
```

### 3. `@ionic/core` and `ionicons` are now peer dependencies

**Before:** Bundled with `@deijose/nix-ionic`.
**After:** You install them directly — ensures version compatibility.

```bash
npm install @ionic/core ionicons
```

### 4. Overlay API renamed from `use*` to `create*`

**Before (never released, but if you used the initial overlay API):**
```ts
const toast = useToast(); // React-style naming
```

**After (2.0):**
```ts
const toast = createToast(); // Nix.js create* pattern
```

| Old | New |
|---|---|
| `useToast()` | `createToast()` |
| `useAlert()` | `createAlert()` |
| `useLoading()` | `createLoading()` |
| `useActionSheet()` | `createActionSheet()` |
| `usePopover()` | `createPopover()` |
| `useModal()` | `createModal()` |

> **Note**: `createPicker()` was also added in 2.0, but it uses the Ionic 8
> inline `isOpen` pattern instead of `pickerController.create()` (which hangs
> in Ionic 8). The API is the same `OverlayHandle` as other overlays.

### 5. `Signal.set()` removed

Nix.js signals use `.value` for both reads and writes:

```ts
// Correct
sig.value = newValue;
sig.value; // read

// Wrong (never existed in Nix.js, but was incorrectly used in early overlay code)
sig.set(newValue);
```

### 6. `onCleanup` not exported from Nix.js

Nix.js uses `effect()` return value or `NixComponent.onUnmount()` for cleanup:

```ts
// Correct — effect returns a dispose function
const dispose = effect(() => { /* ... */ });
dispose(); // cleanup

// Correct — class component lifecycle
class MyPage extends IonPage {
  override onUnmount() {
    // cleanup here
  }
}
```

## New features in 2.0

### Cache policies

```ts
new IonRouterOutlet(routes, {
  cachePolicy: { max: 10, ttl: 60000, strategy: "lru" },
});

// Per-route override
{ path: "/volatile", cache: { ttl: 5000 }, component: ... }
{ path: "/transient", cache: false, component: ... }
```

### Reactive overlays

```ts
const modal = createModalController();
await modal.present({
  component: () => html`<ion-content><h1>Mounted by Nix.js!</h1></ion-content>`,
});
// modal.presented.value → true (reactive)
// modal.result.value → dismiss detail (reactive)
```

### Page-state persistence

```ts
const state = createPageState("search", {
  query: searchSignal,
  results: resultsSignal,
}, { storage: "local" });

state.restore(); // on page enter
state.save();    // on page leave
```

### Capacitor integration

```ts
import { createCapacitorApp } from "@deijose/nix-ionic/capacitor";

const app = createCapacitorApp({
  statusBar: { style: "dark" },
  splashScreen: { fadeOutDuration: 200 },
  backButton: { defaultHref: "/" },
});
await app.ready();
```

### Vite plugin

```ts
// vite.config.ts
import { nixIonic } from "@deijose/nix-ionic/vite-plugin";
export default defineConfig({ plugins: [nixIonic()] });

// app entry
import "virtual:nix-ionic/registration";
```

### Direct component subpaths

```ts
import { defineIonButton } from "@deijose/nix-ionic/components/button";
import { defineIonCard } from "@deijose/nix-ionic/components/card";
```

## Deprecations

| Deprecated | Replacement | Notes |
|---|---|---|
| `setupNixIonic()` | `initializeNixIonic()` + `registerIonicComponents()` | Facade kept for migration |
| `allComponents` | Vite plugin or explicit imports | Kept for migration only |
| `components` export | `components/*` subpaths | Use direct subpath imports |

## Bug fixes in 2.0

1. **`cache:false` cleanup leak** — uncached pages now run lifecycle/effect cleanup before DOM removal
2. **Active cache invalidation** — invalidating the active page no longer disposes live reactivity
3. **Lifecycle watcher disposal** — `watch()` disposers are now retained and released on cleanup
4. **Subclass `onInit()` without `super()`** — lifecycle wiring no longer depends on `super.onInit()`
5. **Guard double-execution** — guards run exactly once, not twice
6. **`PageContext.query`** — query parameters now available in page context
7. **Wildcard route fallback** — `*` routes now work as fallback
8. **Duplicate route diagnostics** — warns on duplicate paths
9. **Pending navigation preservation** — navigation intent (direction, animation) preserved across deferred transitions
10. **Query-only navigation** — same path with different query now triggers a transition; cache keys include query

## Test counts

| Version | Tests | Description |
|---|---|---|
| 1.x | ~63 | Basic routing, lifecycle, setup |
| 2.0 | 187 | + cache policies, overlays, delegate, page-state, capacitor, vite-plugin |
