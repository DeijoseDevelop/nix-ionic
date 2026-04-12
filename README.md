# @deijose/nix-ionic

[![npm version](https://img.shields.io/npm/v/@deijose/nix-ionic.svg)](https://www.npmjs.com/package/@deijose/nix-ionic)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Ionic bridge for [Nix.js](https://nix-js.dev/) — routing, lifecycle hooks, and navigation powered by the official `ion-router` API.

---

## How it works

`@deijose/nix-ionic` bridges Nix.js components with Ionic Core's official vanilla JS routing system:

1. Each route is registered as a **Custom Element** (`nix-page-home`, `nix-page-detail`, etc.)
2. `ion-router` activates the correct custom element based on the URL
3. `ion-router-outlet` manages: **view cache, page transitions, back button, iOS swipe back** — all native, zero custom code
4. `connectedCallback` mounts the Nix component inside the custom element
5. `ionRouteWillChange` / `ionRouteDidChange` drive the Nix lifecycle hooks

This gives you the same integration depth as `@ionic/angular` and `@ionic/react`, using only the public `ion-router` API.

---

## Installation

```bash
npm install @deijose/nix-ionic @deijose/nix-js @ionic/core
```

Requires `@deijose/nix-js` 1.9+ (including 2.x).

---

## Modular component loading (v1.0.0+)

Starting with v1.0.0, `setupNixIonic()` only registers **6 minimal core components** needed for routing (`ion-app`, `ion-router`, `ion-route`, `ion-router-outlet`, `ion-back-button`, `ion-icon`). All other components are loaded **on demand**.

This means you **only pay for what you use**, reducing your initial bundle size dramatically.

### Three ways to load components

#### 1. Individual components (maximum tree-shaking) ✅

Import only the exact components you need:

```typescript
import { setupNixIonic } from "@deijose/nix-ionic";
import {
  defineIonHeader,
  defineIonToolbar,
  defineIonTitle,
  defineIonContent,
  defineIonButton,
} from "@deijose/nix-ionic/components";

setupNixIonic({
  components: [
    defineIonHeader,
    defineIonToolbar,
    defineIonTitle,
    defineIonContent,
    defineIonButton,
  ],
});
```

#### 2. Category bundles (balanced approach)

Load components by category:

```typescript
import { setupNixIonic } from "@deijose/nix-ionic";
import { layoutComponents } from "@deijose/nix-ionic/bundles/layout";
import { buttonComponents } from "@deijose/nix-ionic/bundles/buttons";
import { listComponents } from "@deijose/nix-ionic/bundles/lists";

setupNixIonic({
  components: [...layoutComponents, ...buttonComponents, ...listComponents],
});
```

**Available bundles:**

| Bundle | Import path | Components |
|---|---|---|
| Layout | `@deijose/nix-ionic/bundles/layout` | header, toolbar, title, content, footer, buttons |
| Navigation | `@deijose/nix-ionic/bundles/navigation` | menu, menu-button, tabs, tab, tab-bar, tab-button, label |
| Forms | `@deijose/nix-ionic/bundles/forms` | input, textarea, checkbox, toggle, select, select-option, radio, radio-group, range, searchbar |
| Lists | `@deijose/nix-ionic/bundles/lists` | list, list-header, item, item-divider, item-sliding, item-options, item-option, label, note, card, card-header, card-title, card-subtitle, card-content |
| Feedback | `@deijose/nix-ionic/bundles/feedback` | spinner, progress-bar, skeleton-text, badge, avatar, thumbnail |
| Buttons | `@deijose/nix-ionic/bundles/buttons` | button, fab, fab-button, fab-list, ripple-effect |
| Overlays | `@deijose/nix-ionic/bundles/overlays` | modal, popover, toast, alert |
| **All** | `@deijose/nix-ionic/bundles/all` | All of the above |

#### 3. All components (same as v0.2.x)

If you want backward-compatible behavior with all components loaded at once:

```typescript
import { setupNixIonic } from "@deijose/nix-ionic";
import { allComponents } from "@deijose/nix-ionic/bundles/all";

setupNixIonic({ components: allComponents });
```

### Migration from v0.2.x and earlier

```diff
  import { setupNixIonic } from "@deijose/nix-ionic";
+ import { allComponents } from "@deijose/nix-ionic/bundles/all";

- setupNixIonic();
+ setupNixIonic({ components: allComponents });
```

Or better yet, import only what you actually use for a smaller bundle.

---

## Quick start

### 1. Initialize and Mount in `main.ts`

```typescript
// 1. Core Styles (order matters)
import "@ionic/core/css/core.css";
import "@ionic/core/css/normalize.css";
import "@ionic/core/css/structure.css";
import "@ionic/core/css/typography.css";
import "@ionic/core/css/padding.css";
import "@ionic/core/css/flex-utils.css";
import "@ionic/core/css/display.css";
import "./style.css";

// 2. Framework Imports
import { NixComponent, html, mount } from "@deijose/nix-js";
import { setupNixIonic, IonRouterOutlet } from "@deijose/nix-ionic";
import { layoutComponents } from "@deijose/nix-ionic/bundles/layout";
import { navigationComponents } from "@deijose/nix-ionic/bundles/navigation";
import { defineIonButton } from "@deijose/nix-ionic/components";
import { home, homeOutline } from "ionicons/icons";

// 3. Pages
import { HomePage }   from "./pages/HomePage";
import { DetailPage } from "./pages/DetailPage";

// Configure and inject Ionic Core (only the components you use)
setupNixIonic({
  components: [...layoutComponents, ...navigationComponents, defineIonButton],
  icons: {
    home,
    "home-outline": homeOutline,
  },
});

// 4. Router Configuration
const outlet = new IonRouterOutlet([
  { path: "/",           component: (ctx) => new HomePage(ctx)   },
  { path: "/detail/:id", component: (ctx) => new DetailPage(ctx) }
]);

// 5. App Component
class App extends NixComponent {
  override render() {
    return html`<ion-app>${outlet}</ion-app>`;
  }
}

// 6. Bootstrap
mount(new App(), "#app");
```

---

## Pages

### Class component — `IonPage`

Use `IonPage` when you need navigation lifecycle hooks.

```typescript
import { html, signal } from "@deijose/nix-js";
import { IonPage, IonBackButton, nixIonicRouter } from "@deijose/nix-ionic";
import type { NixTemplate } from "@deijose/nix-js";
import type { PageContext } from "@deijose/nix-ionic";

export class DetailPage extends IonPage {
  private post = signal<Post | null>(null);
  private _id: string;

  constructor({ lc, params }: PageContext) {
    super(lc);
    this._id = params["id"] ?? "1";
  }

  // Called on EVERY activation — even when returning from cached stack
  override ionViewWillEnter(): void {
    this._loadPost(this._id);
  }

  // Called when leaving the view (still in cache)
  override ionViewWillLeave(): void {
    // pause timers, subscriptions, etc.
  }

  override render(): NixTemplate {
    return html`
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            ${IonBackButton()}
          </ion-buttons>
          <ion-title>Detail</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <p>${() => this.post.value?.title ?? ""}</p>
      </ion-content>
    `;
  }
}
```

### Function component — composables

```typescript
import { html, signal } from "@deijose/nix-js";
import { useIonViewWillEnter, useIonViewWillLeave, IonBackButton } from "@deijose/nix-ionic";
import type { NixTemplate } from "@deijose/nix-js";
import type { PageContext } from "@deijose/nix-ionic";

export function ProfilePage({ lc }: PageContext): NixTemplate {
  const visits = signal(0);

  useIonViewWillEnter(lc, () => {
    visits.update((n) => n + 1);
  });

  useIonViewWillLeave(lc, () => {
    console.log("leaving profile");
  });

  return html`
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          ${IonBackButton()}
        </ion-buttons>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>Visits: ${() => visits.value}</p>
    </ion-content>
  `;
}
```

---

## Navigation — `nixIonicRouter()`

Access the router singleton from anywhere without prop drilling:

```typescript
import { nixIonicRouter } from "@deijose/nix-ionic";

const router = nixIonicRouter();

// Navigate forward
router.navigate("/detail/42");

// Navigate back
router.back();

// Replace current view (no history entry)
router.replace("/home");

// Reactive signals
router.canGoBack.value   // boolean — true when back stack exists
router.params.value      // { id: "42" } for /detail/:id
router.path.value        // current pathname
```

### In a class component

```typescript
override render(): NixTemplate {
  const router = nixIonicRouter(); // safe to call inside render()

  return html`
    <ion-button @click=${() => router.navigate("/profile")}>
      Go to Profile
    </ion-button>
  `;
}
```

### `nixIonicRouterState()`

Use this helper when you only need reactive route state and not navigation methods.

```typescript
import { nixIonicRouterState } from "@deijose/nix-ionic";

const state = nixIonicRouterState();
state.path.value;
state.params.value;
state.canGoBack.value;
```

---

## Tabs — `createBottomTabBar()`

Build a bottom tab bar without manual route listeners or `setInterval` polling.

```typescript
import { html } from "@deijose/nix-js";
import { createBottomTabBar } from "@deijose/nix-ionic";

const tabs = createBottomTabBar(
  [
    { path: "/", label: "Home", icon: "home-outline", activeIcon: "home", exact: true },
    { path: "/map", label: "Map", icon: "map-outline", activeIcon: "map" },
    { path: "/profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
  ],
  {
    hiddenPaths: ["/login", "/auth/*"],
    navigationDirection: "root",
  },
);

html`<ion-app>${outlet}${tabs}</ion-app>`;
```

### Complete example — tabs + router + guards

This is a full `main.ts`-style setup showing how tabs work together with `IonRouterOutlet` and route guards.

```typescript
import "@ionic/core/css/core.css";
import "@ionic/core/css/normalize.css";
import "@ionic/core/css/structure.css";
import "@ionic/core/css/typography.css";
import "@ionic/core/css/padding.css";
import "@ionic/core/css/flex-utils.css";
import "@ionic/core/css/display.css";

import { signal, NixComponent, html, mount } from "@deijose/nix-js";
import {
  setupNixIonic,
  IonRouterOutlet,
  createBottomTabBar,
  IonPage,
  IonBackButton,
  nixIonicRouter,
  type PageContext,
} from "@deijose/nix-ionic";
import { layoutComponents } from "@deijose/nix-ionic/bundles/layout";
import { navigationComponents } from "@deijose/nix-ionic/bundles/navigation";
import { listComponents } from "@deijose/nix-ionic/bundles/lists";
import { buttonComponents } from "@deijose/nix-ionic/bundles/buttons";
import { home, homeOutline, map, mapOutline, person, personOutline, logInOutline } from "ionicons/icons";

// Tiny auth store for the demo
const isAuthenticated = signal(false);
const auth = {
  login: () => (isAuthenticated.value = true),
  logout: () => (isAuthenticated.value = false),
};

setupNixIonic({
  components: [...layoutComponents, ...navigationComponents, ...listComponents, ...buttonComponents],
  icons: {
    home,
    "home-outline": homeOutline,
    map,
    "map-outline": mapOutline,
    person,
    "person-outline": personOutline,
    "log-in-outline": logInOutline,
  },
});

class LoginPage extends IonPage {
  constructor(ctx: PageContext) {
    super(ctx.lc);
  }

  override render() {
    const router = nixIonicRouter();
    return html`
      <ion-header><ion-toolbar><ion-title>Login</ion-title></ion-toolbar></ion-header>
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-content>
            <ion-button
              expand="block"
              @click=${() => {
                auth.login();
                router.replace("/");
              }}
            >
              <ion-icon slot="start" name="log-in-outline"></ion-icon>
              Sign in
            </ion-button>
          </ion-card-content>
        </ion-card>
      </ion-content>
    `;
  }
}

class HomePage extends IonPage {
  constructor(ctx: PageContext) {
    super(ctx.lc);
  }
  override render() {
    return html`<ion-content class="ion-padding">Home tab</ion-content>`;
  }
}

class MapPage extends IonPage {
  constructor(ctx: PageContext) {
    super(ctx.lc);
  }
  override render() {
    const router = nixIonicRouter();
    return html`
      <ion-content class="ion-padding">
        <ion-button @click=${() => router.navigate("/map/route/101")}>Open Route #101</ion-button>
      </ion-content>
    `;
  }
}

class RouteDetailPage extends IonPage {
  private id: string;

  constructor(ctx: PageContext) {
    super(ctx.lc);
    this.id = ctx.params.id ?? "unknown";
  }

  override render() {
    return html`
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">${IonBackButton("/map")}</ion-buttons>
          <ion-title>Route ${this.id}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">Route detail page</ion-content>
    `;
  }
}

class ProfilePage extends IonPage {
  constructor(ctx: PageContext) {
    super(ctx.lc);
  }
  override render() {
    const router = nixIonicRouter();
    return html`
      <ion-content class="ion-padding">
        <ion-button
          color="danger"
          @click=${() => {
            auth.logout();
            router.replace("/login");
          }}
        >
          Sign out
        </ion-button>
      </ion-content>
    `;
  }
}

const requireAuth = () => (isAuthenticated.value ? true : "/login");

const outlet = new IonRouterOutlet([
  { path: "/login", component: (ctx) => new LoginPage(ctx) },
  { path: "/", component: (ctx) => new HomePage(ctx), beforeEnter: requireAuth },
  { path: "/map", component: (ctx) => new MapPage(ctx), beforeEnter: requireAuth },
  { path: "/map/route/:id", component: (ctx) => new RouteDetailPage(ctx), beforeEnter: requireAuth },
  { path: "/profile", component: (ctx) => new ProfilePage(ctx), beforeEnter: requireAuth },
]);

const tabs = createBottomTabBar(
  [
    { path: "/", label: "Home", icon: "home-outline", activeIcon: "home", exact: true },
    { path: "/map", label: "Map", icon: "map-outline", activeIcon: "map" },
    { path: "/profile", label: "Profile", icon: "person-outline", activeIcon: "person" },
  ],
  {
    navigationDirection: "root",
    hideWhen: (path) => path === "/login" || path.startsWith("/map/route/"),
  },
);

class App extends NixComponent {
  override render() {
    return html`<ion-app>${outlet}${tabs}</ion-app>`;
  }
}

mount(new App(), "#app");
```

---

## `IonBackButton()`

A lightweight wrapper around `<ion-back-button>` that works with the same `ion-router` stack configured by `IonRouterOutlet`. Use `defaultHref` as fallback when no back entry exists.

```typescript
import { IonBackButton } from "@deijose/nix-ionic";

// In any template — no arguments needed
html`
  <ion-buttons slot="start">
    ${IonBackButton()}
  </ion-buttons>
`

// Optional default href (navigates here if no back stack)
${IonBackButton("/")}
```

---

## Lifecycle hooks

All hooks are optional. For class components, implement the methods directly. For function components, use the composables.

| Hook | When it fires |
|---|---|
| `ionViewWillEnter` | Before the view becomes visible (every activation) |
| `ionViewDidEnter` | After the view is fully visible |
| `ionViewWillLeave` | Before the view is hidden (stays in cache) |
| `ionViewDidLeave` | After the view is hidden |

### Key difference from `onMount` / `onInit`

`onMount` and `onInit` (from Nix.js) only fire **once** when the component is first created. Ionic caches views in the stack — when the user returns to a cached view, `onMount` does NOT run again.

Use `ionViewWillEnter` for anything that needs to refresh on every visit (data fetching, resetting state, restarting timers):

```typescript
// ❌ Only runs once — misses subsequent visits
override onMount() {
  this._fetchData();
}

// ✅ Runs on every activation
override ionViewWillEnter() {
  this._fetchData();
}
```

---

## Route guards

```typescript
new IonRouterOutlet([
  { path: "/", component: (ctx) => new HomePage(ctx) },
  {
    path: "/admin",
    component: (ctx) => new AdminPage(ctx),
    beforeEnter: ({ params }) => {
      if (!isLoggedIn()) return "/login"; // redirect
      if (!isAdmin())    return false;    // cancel navigation
      console.log("route params", params);
      // return void or undefined to allow
    },
  },
]);
```

| Return value | Effect |
|---|---|
| `void` / `undefined` | Allow navigation |
| `false` | Cancel — stay on current view |
| `"string"` | Redirect to that path |
| `{ redirect: string }` | Redirect to `redirect` path |

---

## `PageContext`

Every route factory receives a `PageContext`:

```typescript
interface PageContext {
  lc:     PageLifecycle;        // navigation lifecycle signals
  params: Record<string,string>; // /detail/:id → { id: "42" }
}
```

---

## API Reference

### `setupNixIonic(options?)`

```typescript
setupNixIonic(options?: {
  iconAssetPath?: string;
  components?: ComponentDefiner[];
  icons?: Record<string, string>;
}): void
```

Initializes Ionic Core and registers the minimal routing components.

- `components`: register only the Ionic elements your app needs.
- `icons`: register custom Ionicons once during bootstrap (in addition to built-in back icons).

### `IonRouterOutlet`

```typescript
new IonRouterOutlet(routes: RouteDefinition[])
```

Mounts `ion-router` + `ion-router-outlet` in the DOM. Registers a custom element per route. Initialize once in your app entry point.

### `nixIonicRouter()`

```typescript
nixIonicRouter(): RouterInstance
```

Returns the active router instance with methods and reactive signals (`path`, `params`, `canGoBack`).

### `nixIonicRouterState()`

```typescript
nixIonicRouterState(): RouterState
```

Returns only reactive router state (`path`, `params`, `canGoBack`). Useful for UI components like tab bars.

### `createBottomTabBar(tabs, options?)`

```typescript
createBottomTabBar(tabs: BottomTabItem[], options?: BottomTabBarOptions): NixTemplate
```

Creates an Ionic `<ion-tab-bar>` bound to router state with active-tab logic and optional hide rules.

### `IonBackButton(defaultHref?)`

```typescript
IonBackButton(defaultHref?: string): NixTemplate
```

Back button that works with the Nix router. Hidden when `canGoBack` is false.

### `IonPage`

Abstract class. Extend for pages that need lifecycle hooks.

```typescript
abstract class IonPage extends NixComponent {
  constructor(lc: PageLifecycle)
  ionViewWillEnter?(): void
  ionViewDidEnter?():  void
  ionViewWillLeave?(): void
  ionViewDidLeave?():  void
  abstract render(): NixTemplate
}
```

### Composables

```typescript
useIonViewWillEnter(lc: PageLifecycle, fn: () => void): void
useIonViewDidEnter(lc:  PageLifecycle, fn: () => void): void
useIonViewWillLeave(lc: PageLifecycle, fn: () => void): void
useIonViewDidLeave(lc:  PageLifecycle, fn: () => void): void
```

---

## Comparison with other frameworks

| Feature | `@ionic/angular` | `@ionic/react` | `@deijose/nix-ionic` |
|---|---|---|---|
| Router integration | Angular Router | React Router | `ion-router` (vanilla) |
| View cache | ✅ | ✅ | ✅ native |
| Page transitions | ✅ | ✅ | ✅ native |
| iOS swipe back | ✅ | ✅ | ✅ native |
| `ion-back-button` | native | wrapper | wrapper |
| Lifecycle hooks | directive | hooks | `IonPage` / composables |
| Navigation API | `NavController` | `useHistory` | `nixIonicRouter()` |
| Modular loading | ❌ | ❌ | ✅ tree-shakeable |


## Project setup

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | included with Node |
| Capacitor CLI | latest | `npm i -g @capacitor/cli` |
| Android Studio | latest | [developer.android.com](https://developer.android.com/studio) |
| Xcode | ≥ 14 | Mac App Store |

---

## Create a new project

```bash
# 1. Scaffold a Vite + TypeScript project
npm create vite@latest my-app -- --template vanilla-ts
cd my-app

# 2. Install dependencies
npm install

# 3. Install Nix.js + Ionic + nix-ionic
npm install @deijose/nix-js @ionic/core @deijose/nix-ionic

# 4. Install Capacitor (for native iOS / Android)
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

---

## Recommended folder structure

```
my-app/
├── android/                      ← generated by Capacitor (do not edit manually)
├── ios/                          ← generated by Capacitor (do not edit manually)
├── public/
│   └── favicon.ico
├── src/
│   ├── ionic-nix/                ← copy from @deijose/nix-ionic if customizing
│   │   ├── IonRouterOutlet.ts
│   │   ├── lifecycle.ts
│   │   └── index.ts
│   │
│   ├── pages/                    ← one file per screen
│   │   ├── HomePage.ts
│   │   ├── DetailPage.ts
│   │   └── ProfilePage.ts
│   │
│   ├── components/               ← reusable UI components (not pages)
│   │   ├── PostCard.ts
│   │   └── Avatar.ts
│   │
│   ├── stores/                   ← global state via Nix.js createStore()
│   │   ├── auth.ts
│   │   └── cart.ts
│   │
│   ├── services/                 ← API calls, business logic
│   │   ├── api.ts
│   │   └── storage.ts
│   │
│   ├── style.css                 ← global styles + Ionic CSS imports
│   └── main.ts                   ← app entry point
│
├── index.html
├── capacitor.config.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### `main.ts` — entry point

```typescript
// 1. Core Styles (order matters)
import "@ionic/core/css/core.css";
import "@ionic/core/css/normalize.css";
import "@ionic/core/css/structure.css";
import "@ionic/core/css/typography.css";
import "@ionic/core/css/padding.css";
import "@ionic/core/css/flex-utils.css";
import "@ionic/core/css/display.css";
import "./style.css";

// 2. Framework Imports
import { NixComponent, html, mount } from "@deijose/nix-js";
import { setupNixIonic, IonRouterOutlet } from "@deijose/nix-ionic";
import { layoutComponents } from "@deijose/nix-ionic/bundles/layout";
import { buttonComponents } from "@deijose/nix-ionic/bundles/buttons";

// 3. Pages
import { HomePage }   from "./pages/HomePage";
import { DetailPage } from "./pages/DetailPage";

// Configure and inject Ionic Core
setupNixIonic({
  components: [...layoutComponents, ...buttonComponents],
});

// 4. Router Configuration
const outlet = new IonRouterOutlet([
  { path: "/",           component: (ctx) => new HomePage(ctx)   },
  { path: "/detail/:id", component: (ctx) => new DetailPage(ctx) }
]);

// 5. App Component
class App extends NixComponent {
  override render() {
    return html`<ion-app>${outlet}</ion-app>`;
  }
}

// 6. Bootstrap
mount(new App(), "#app");
```

### `index.html` — root HTML

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="viewport-fit=cover, width=device-width, initial-scale=1.0,
               minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

### `capacitor.config.ts`

```typescript
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.myapp",
  appName: "My App",
  webDir: "dist",
};

export default config;
```

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@ionic/core"],
  },
  build: {
    rollupOptions: {
      output: { manualChunks: undefined },
    },
  },
});
```

---

## Development commands

### Web

```bash
# Start dev server (hot reload)
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Android

### First-time setup

```bash
# 1. Build the web app
npm run build

# 2. Initialize Capacitor (only once)
npx cap init "My App" "com.example.myapp" --web-dir dist

# 3. Add Android platform
npx cap add android

# 4. Sync web assets to native project
npx cap sync android
```

### Daily workflow

```bash
# After any change to web code:
npm run build
npx cap sync android

# Open in Android Studio (run / debug from there)
npx cap open android

# Or run directly on a connected device / emulator
npx cap run android
```

### Live reload on Android (dev)

```bash
# Start dev server first
npm run dev

# In a second terminal — live reload on device
npx cap run android --livereload --external
```

> **Note:** device and computer must be on the same Wi-Fi network for live reload.

---

## iOS

> Requires macOS + Xcode.

### First-time setup

```bash
# 1. Build the web app
npm run build

# 2. Add iOS platform
npx cap add ios

# 3. Sync
npx cap sync ios
```

### Daily workflow

```bash
npm run build
npx cap sync ios

# Open in Xcode (run / debug from there)
npx cap open ios

# Or run on simulator
npx cap run ios
```

### Live reload on iOS (dev)

```bash
npm run dev
npx cap run ios --livereload --external
```

---

## Capacitor plugins

Add any official Capacitor plugin the same way:

```bash
# Camera
npm install @capacitor/camera
npx cap sync

# Filesystem
npm install @capacitor/filesystem
npx cap sync

# Push notifications
npm install @capacitor/push-notifications
npx cap sync
```

Then use them in your services:

```typescript
// src/services/camera.ts
import { Camera, CameraResultType } from "@capacitor/camera";

export async function takePhoto(): Promise<string> {
  const photo = await Camera.getPhoto({
    quality:      90,
    allowEditing: false,
    resultType:   CameraResultType.DataUrl,
  });
  return photo.dataUrl ?? "";
}
```

---

## Page template

Copy this as a starting point for any new page:

```typescript
// src/pages/MyPage.ts
import { html, signal } from "@deijose/nix-js";
import type { NixTemplate } from "@deijose/nix-js";
import { IonPage, IonBackButton, nixIonicRouter } from "@deijose/nix-ionic";
import type { PageContext } from "@deijose/nix-ionic";

export class MyPage extends IonPage {
  private data = signal<string | null>(null);

  constructor({ lc, params }: PageContext) {
    super(lc);
    // params contains dynamic route segments
    // e.g. for /my/:id → params["id"]
  }

  // Runs on EVERY visit (initial + returning from stack)
  override ionViewWillEnter(): void {
    this._load();
  }

  // Runs when navigating away (view stays cached)
  override ionViewWillLeave(): void {
    // pause subscriptions, timers, etc.
  }

  private async _load(): Promise<void> {
    // fetch data
  }

  override render(): NixTemplate {
    const router = nixIonicRouter();

    return html`
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            ${IonBackButton()}
          </ion-buttons>
          <ion-title>My Page</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content class="ion-padding">
        <p>${() => this.data.value ?? "Loading..."}</p>

        <ion-button @click=${() => router.navigate("/other")}>
          Go somewhere
        </ion-button>
      </ion-content>
    `;
  }
}
```

Register it in `main.ts`:

```typescript
{ path: "/my/:id", component: (ctx) => new MyPage(ctx) },
```

---

## Build for production

```bash
# Web PWA
npm run build
# Output in dist/ — deploy to any static host (Vercel, Netlify, etc.)

# Android APK / AAB
npm run build
npx cap sync android
npx cap open android
# In Android Studio: Build → Generate Signed Bundle/APK

# iOS IPA
npm run build
npx cap sync ios
npx cap open ios
# In Xcode: Product → Archive
```


## License

[MIT](https://opensource.org/licenses/MIT)

---