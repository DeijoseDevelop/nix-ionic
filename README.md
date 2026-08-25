# @deijose/nix-ionic

[![npm version](https://img.shields.io/npm/v/@deijose/nix-ionic.svg)](https://www.npmjs.com/package/@deijose/nix-ionic)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Ionic mobile integration for [Nix.js](https://nix-js.dev/) — tree-shakeable components, reactive overlays, cache policies, page-state persistence, optional Capacitor, and a Vite plugin for auto-registration.

## Why?

`@deijose/nix-ionic` bridges Nix.js signal-based reactivity with Ionic Core 8's native routing, transitions, and overlays. Unlike `@ionic/angular` or `@ionic/react`, it adds **zero framework runtime overhead** — no virtual DOM, no dependency arrays, no hooks rules.

## Install

```bash
npm install @deijose/nix-ionic @deijose/nix-js @ionic/core ionicons
```

For native mobile (optional):

```bash
npm install @capacitor/core @capacitor/app @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard @capacitor/haptics
```

## Quick start

```ts
// main.ts
import "@ionic/core/css/core.css";
import "@ionic/core/css/normalize.css";
import "@ionic/core/css/structure.css";
import "@ionic/core/css/typography.css";
import "@ionic/core/css/padding.css";
import "@ionic/core/css/flex-utils.css";
import "@ionic/core/css/display.css";

import { NixComponent, html, mount } from "@deijose/nix-js";
import { IonRouterOutlet, IonPage, IonBackButton } from "@deijose/nix-ionic";
import { initializeNixIonic, registerIonicComponents } from "@deijose/nix-ionic";
import { defineIonHeader, defineIonToolbar, defineIonTitle, defineIonContent, defineIonButton } from "@deijose/nix-ionic/components";
import { home, homeOutline } from "ionicons/icons";

// 1. Initialize + register only what you use
initializeNixIonic();
registerIonicComponents(defineIonHeader, defineIonToolbar, defineIonTitle, defineIonContent, defineIonButton);

// 2. Define routes
const outlet = new IonRouterOutlet([
  { path: "/", component: () => html`<ion-content><h1>Home</h1></ion-content>` },
  { path: "/detail/:id", component: (ctx) => new DetailPage(ctx) },
]);

// 3. Mount
class App extends NixComponent {
  override render() {
    return html`<ion-app>${outlet}</ion-app>`;
  }
}
mount(new App(), "#app");
```

## Subpaths

| Import | What it gives you |
|---|---|
| `@deijose/nix-ionic` | Core: router outlet, pages, lifecycle, setup, overlays, page-state |
| `@deijose/nix-ionic/components/*` | Individual component definers (tree-shakeable) |
| `@deijose/nix-ionic/bundles/*` | Category bundles (layout, forms, lists, etc.) |
| `@deijose/nix-ionic/overlays` | Reactive overlay controllers |
| `@deijose/nix-ionic/page-state` | Page-state persistence protocol |
| `@deijose/nix-ionic/navigation` | NavigationManager (single authority, hooks, tab switching) |
| `@deijose/nix-ionic/capacitor` | Optional Capacitor integration (zero web bundle cost) |

## Testing

- **Unit tests**: `npm test` — 234 tests with happy-dom mocks
- **E2E tests**: `npm run e2e` — 12 Playwright tests with real `@ionic/core`
  - Navigation, lifecycle, overlays, back button, contract tests
  - Chromium mobile viewport, `prefers-reduced-motion: reduce`
  - No mocks — real `ion-router-outlet.commit()`, real custom elements
| `@deijose/nix-ionic/vite-plugin` | Vite plugin for auto component/icon registration |

## Setup

### Incremental (recommended)

```ts
import { initializeNixIonic, registerIonicComponents, registerIonicons } from "@deijose/nix-ionic";
import { defineIonButton, defineIonCard } from "@deijose/nix-ionic/components/button";
import { star, starOutline } from "ionicons/icons";

initializeNixIonic();
registerIonicComponents(defineIonButton, defineIonCard);
registerIonicons({ star, "star-outline": starOutline });
```

### Compatibility facade (1.x migration)

```ts
import { setupNixIonic } from "@deijose/nix-ionic";
import { allComponents } from "@deijose/nix-ionic/bundles/all";

setupNixIonic({ components: allComponents });
```

### Vite plugin (auto-registration)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { nix } from "@deijose/vite-plugin-nix-js";
import { nixIonic } from "@deijose/nix-ionic/vite-plugin";

export default defineConfig({
  plugins: [
    nix(),
    nixIonic(), // scans html`` for <ion-*> tags + static icons
  ],
});

// Then in your app entry:
import "virtual:nix-ionic/registration";
```

The plugin scans `html\`\`` templates for `<ion-*>` tags and `name="icon-name"` attributes, then generates a virtual module that imports and registers only what you use.

## Pages

### Class component with lifecycle

```ts
import { html, signal } from "@deijose/nix-js";
import { IonPage, IonBackButton, type PageContext } from "@deijose/nix-ionic";

class DetailPage extends IonPage {
  private data = signal<unknown>(null);
  private id: string;

  constructor({ lc, params }: PageContext) {
    super(lc);
    this.id = params.id;
  }

  override ionViewWillEnter() {
    // Runs on every activation — even from cache
    fetch(`/api/items/${this.id}`).then(r => r.json()).then(d => this.data.value = d);
  }

  override ionViewWillLeave() {
    // Pause timers, subscriptions, etc.
  }

  override render() {
    return html`
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">${IonBackButton()}</ion-buttons>
          <ion-title>Detail</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p>${() => JSON.stringify(this.data.value)}</p>
      </ion-content>
    `;
  }
}
```

### Function component with composables

```ts
import { html, signal } from "@deijose/nix-js";
import { useIonViewWillEnter, useIonViewWillLeave, type PageContext } from "@deijose/nix-ionic";

function ProfilePage({ lc }: PageContext) {
  const visits = signal(0);
  useIonViewWillEnter(lc, () => visits.value++);
  useIonViewWillLeave(lc, () => console.log("leaving"));
  return html`<ion-content><p>Visits: ${() => visits.value}</p></ion-content>`;
}
```

### Lifecycle hooks

| Hook | When | Use for |
|---|---|---|
| `ionViewWillEnter` | Before visible (every activation) | Data refresh, restart timers |
| `ionViewDidEnter` | After fully visible | Analytics, scroll position |
| `ionViewWillLeave` | Before hidden | Pause timers, save state |
| `ionViewDidLeave` | After hidden | Cleanup subscriptions |

> **Key**: `onMount`/`onInit` fire once. `ionViewWillEnter` fires on every visit — even from cache.

## Navigation

```ts
import { nixRouter } from "@deijose/nix-js";

const router = nixRouter();
router.navigate("/detail/42");
router.navigate("/search", { query: { q: "hello" } });
router.replace("/home");
router.back();

router.current.value;     // "/detail/42"
router.params.value;      // { id: "42" }
router.query.value;       // { q: "hello" }
router.canGoBack.value;   // true/false
```

### Route guards

```ts
new IonRouterOutlet([
  {
    path: "/admin",
    component: (ctx) => new AdminPage(ctx),
    beforeEnter: ({ params }) => {
      if (!isLoggedIn()) return "/login";  // redirect
      if (!isAdmin()) return false;         // cancel
      // void/undefined = allow
    },
  },
]);
```

## Cache policies

Control how many pages stay cached and for how long.

```ts
new IonRouterOutlet(routes, {
  cachePolicy: { max: 10, ttl: 60000, strategy: "lru" },
});
```

| Option | Default | Description |
|---|---|---|
| `max` | unlimited | Max cached entries per tab. Excess evicted by strategy. |
| `ttl` | unlimited | Time-to-live in ms. Entries auto-evicted on expiry. |
| `strategy` | `"lru"` | `"lru"` = evict least-recently-used, `"fifo"` = evict oldest |

### Per-route override

```ts
new IonRouterOutlet([
  { path: "/", component: () => html`...` },
  { path: "/transient", cache: false, component: () => html`...` },        // never cache
  { path: "/heavy", cache: { max: 1 }, component: () => html`...` },      // max 1 instance
  { path: "/volatile", cache: { ttl: 5000 }, component: () => html`...` }, // 5s TTL
]);
```

## NavigationManager

A single coordination authority for navigation — hooks, tab switching, and cache invalidation by route pattern.

```ts
import { NavigationManager, IonRouterOutlet } from "@deijose/nix-ionic";

const nav = new NavigationManager({ tabs: ["/home", "/search", "/profile"] });

// Navigation hooks
nav.beforeNav((path, intent) => {
  console.log("navigating to", path);
  // return false to cancel
});

nav.afterNav((path, direction) => {
  analytics.track("page_view", { path, direction });
});

nav.onTabChange((tab, prev) => {
  console.log("tab changed:", prev, "→", tab);
});

// Programmatic tab switching
const target = nav.switchTab("/search");
if (target) nixRouter().navigate(target);

// Cache invalidation by route pattern
nav.invalidateRoute("/user/:id", { id: "42" }); // invalidate user 42
nav.invalidatePattern("/admin/*");              // invalidate all admin pages

// Pass to outlet
const outlet = new IonRouterOutlet(routes, { navigation: nav });
```

### Stack inspection

```ts
nav.stackDepth();        // current tab stack depth
nav.stackTop();          // current tab stack top path
nav.stackEntries();      // copy of current tab stack
nav.activeTab;           // active tab prefix
```

## Overlays

Reactive overlay controllers using the `create*` pattern (like `createStore`, `createRouter`).

```ts
import { html } from "@deijose/nix-js";
import { createToast, createAlert, createModalController, confirm, withLoading } from "@deijose/nix-ionic";

function MyPage() {
  const toast = createToast();
  const modal = createModalController();

  const save = async () => {
    await withLoading({ message: "Saving..." }, async () => {
      await fetch("/api/save", { method: "POST" });
    });
    toast.present({ message: "Saved!", duration: 1500 });
  };

  const openModal = () => modal.present({
    component: () => html`<ion-content><h1>Modal content mounted by Nix.js!</h1></ion-content>`,
  });

  return html`
    <ion-content>
      <ion-button @click=${save}>Save</ion-button>
      <ion-button @click=${openModal}>Open Modal</ion-button>
      ${() => modal.presented.value ? html`<p>Modal is open</p>` : null}
    </ion-content>
  `;
}
```

### Available controllers

| Controller | Description |
|---|---|
| `createToast()` | Reactive toast |
| `createAlert()` | Reactive alert |
| `createLoading()` | Reactive loading spinner |
| `createActionSheet()` | Reactive action sheet |
| `createPopover()` | Reactive popover |
| `createModal()` | Basic modal (no delegate) |
| `createModalController()` | Modal with Nix.js delegate (mounts `html\`\`` inside) |
| `createPopoverController()` | Popover with Nix.js delegate |
| `createPicker()` | Column-based picker |

### One-shot helpers

```ts
import { showToast, withLoading, confirm } from "@deijose/nix-ionic";

showToast({ message: "Done!", duration: 1000 });

const data = await withLoading({ message: "Fetching..." },
  () => fetch("/api/data").then(r => r.json()));

const yes = await confirm({ header: "Delete", message: "Sure?", confirmText: "Delete" });
```

## Page-state persistence

Opt-in persistence of serializable state across navigation and app restarts.

```ts
import { signal } from "@deijose/nix-js";
import { createPageState, IonPage } from "@deijose/nix-ionic";

class SearchPage extends IonPage {
  private query = signal("");
  private results = signal<string[]>([]);
  private state = createPageState("search", {
    query: this.query,
    results: this.results,
  }, { storage: "local" }); // persists across app restarts

  override ionViewWillEnter() { this.state.restore(); }
  override ionViewWillLeave() { this.state.save(); }
}
```

**Rules:**
- Only serializable data (primitives, plain arrays/objects)
- DOM nodes, functions, symbols, class instances → rejected with warning
- `sessionStorage` (default) or `localStorage` (opt-in)
- `clearAllPageState()` for logout flows

## Capacitor (optional native)

Isolated behind `@deijose/nix-ionic/capacitor` — **zero web bundle cost** (0 bytes of `@capacitor/*` in main bundle).

```ts
import { createCapacitorApp } from "@deijose/nix-ionic/capacitor";

const app = createCapacitorApp({
  statusBar: { style: "dark", backgroundColor: "#1a1a2e" },
  splashScreen: { fadeOutDuration: 200 },
  backButton: { defaultHref: "/home" },
});

await app.ready(); // configures status bar, hides splash, wires back button
```

### Individual plugins

```ts
import { Haptics, StatusBar, App, Keyboard } from "@deijose/nix-ionic/capacitor";

await Haptics.impact("medium");     // no-op on web
await StatusBar.setStyle({ style: "dark" }); // no-op on web
App.onBackButton((info) => { /* ... */ });   // no-op on web
```

All methods are **no-ops on web** — safe to call unconditionally.

## Tabs

```ts
import { createBottomTabBar } from "@deijose/nix-ionic";

const tabs = createBottomTabBar([
  { path: "/", label: "Home", icon: "home-outline", activeIcon: "home", exact: true },
  { path: "/search", label: "Search", icon: "search-outline", activeIcon: "search" },
  { path: "/profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
], {
  hideWhen: (path) => path === "/login",
});

html`<ion-app>${outlet}${tabs}</ion-app>`;
```

## Vite plugin

Auto-registers only the Ionic components and icons you actually use in `html\`\`` templates.

```ts
// vite.config.ts
import { nixIonic } from "@deijose/nix-ionic/vite-plugin";

export default defineConfig({
  plugins: [nixIonic()],
});
```

```ts
// app entry — imports the auto-generated virtual module
import "virtual:nix-ionic/registration";
```

Features:
- Scans `html\`\`` for `<ion-*>` tags → generates direct subpath imports
- Scans `name="icon-name"` on `<ion-icon>` → generates `ionicons/icons` imports
- Warns on dynamic tags/icons (with allowlist suppression)
- `nixIonic({ allowTags: [...], allowIcons: [...] })` for dynamic usage

## API reference

### Core

| Export | Description |
|---|---|
| `IonRouterOutlet` | Router outlet with cache policies, guards, tabs |
| `IonPage` | Base class for pages with lifecycle hooks |
| `IonBackButton(defaultHref?)` | Back button component |
| `createBottomTabBar(tabs, opts?)` | Bottom tab bar |
| `initializeNixIonic()` | Initialize Ionic Core (incremental) |
| `registerIonicComponents(...definers)` | Register specific components |
| `registerIonicons(icons)` | Register specific icons |
| `setupNixIonic(opts?)` | 1.x compatibility facade |
| `createPageState(pageId, signals, opts?)` | Page-state persistence |
| `clearAllPageState(backend?, ns?)` | Clear all persisted state |
| `NavigationManager` | Single navigation authority (hooks, tabs, invalidation) |
| `StackManager` | Per-tab navigation stack management |

### Overlays

| Export | Description |
|---|---|
| `createToast()` / `createAlert()` / `createLoading()` | Reactive overlay controllers |
| `createActionSheet()` / `createPopover()` / `createModal()` | Reactive overlay controllers |
| `createPicker()` | Column-based picker |
| `createModalController(delegate?)` | Modal with Nix.js delegate |
| `createPopoverController(delegate?)` | Popover with Nix.js delegate |
| `createNixDelegate()` | Nix.js FrameworkDelegate for overlays |
| `showToast(opts)` | One-shot toast |
| `withLoading(opts, task)` | Loading + async task + auto-dismiss |
| `confirm(opts)` | Promise-based confirm dialog |

### Capacitor (`@deijose/nix-ionic/capacitor`)

| Export | Description |
|---|---|
| `createCapacitorApp(opts)` | Bootstrap helper (status bar, splash, back button) |
| `StatusBar` / `SplashScreen` / `Keyboard` | Plugin wrappers (no-op on web) |
| `Haptics` / `App` | Plugin wrappers (no-op on web) |
| `isNative()` / `isWeb()` | Platform detection |

### Vite plugin (`@deijose/nix-ionic/vite-plugin`)

| Export | Description |
|---|---|
| `nixIonic(opts?)` | Vite plugin for auto-registration |
| `generateRegistrationModule(tags, icons, opts)` | Code generator (for testing) |

## Comparison

| Feature | `@ionic/angular` | `@ionic/react` | `@deijose/nix-ionic` |
|---|---|---|---|
| Virtual DOM | Angular | React | **None** |
| Bundle size overhead | Angular runtime | React runtime | **Zero** |
| Tree-shakeable components | No | No | **Yes** |
| Auto-registration plugin | No | No | **Yes** (Vite) |
| Cache policies (LRU/TTL) | No | No | **Yes** |
| Page-state persistence | Manual | Manual | **Built-in** |
| Capacitor integration | External | External | **Optional subpath** |
| Reactive overlays | Manual | Manual | **`create*` pattern** |

## Testing

All tests run against real `@ionic/core` (no mocks).

| Suite | Tests | What it covers |
|---|---|---|
| Unit (Vitest) | 235 | Cache policies, navigation, overlays, page-state, Capacitor, Vite plugin, bundles |
| E2E application | 19 | Navigation, lifecycle, overlays (toast/modal/alert/loading/action-sheet/picker), back button |
| E2E contract | 24 | Custom elements, `commit()`, lifecycle events, overlay present/dismiss, properties, form events, network isolation |
| E2E accessibility/leaks | 13 | ARIA roles, shadow DOM, focus management, repeated navigation, overlay disposal, listener cleanup |

**Total: 291 tests, all passing.**

### Bundle validation

```bash
npm run measure-bundles
```

Validates tree-shaking with 4 fixtures:

| Fixture | Gzip | Purpose |
|---|---|---|
| minimal (1 component) | 0.82 KB | Only `ion-button` — no other component code |
| partial (layout + buttons) | 1.05 KB | Two bundles — no forms/lists/overlays |
| full (all + overlays + nav) | 7.26 KB | Worst-case bundle |
| capacitor-only | 0.59 KB | Zero `@capacitor/*` in web bundle |

Minimal = 11.3% of full bundle (gzip) — tree-shaking works.

## Limitations

### iOS swipe-back gesture

iOS swipe-back (interactive pop gesture) is **not supported**. The integration
does not assign `swipeHandler` on `ion-router-outlet`. Native swipe-back requires
a WebKit/mobile test that reproduces both a completed swipe and a cancelled
swipe with correct lifecycle rollback — this has not been demonstrated.

Use `ion-back-button` or programmatic `router.back()` for back navigation.

## License

MIT
