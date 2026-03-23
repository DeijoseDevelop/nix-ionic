# @deijose/nix-ionic

[![npm version](https://img.shields.io/npm/v/@deijose/nix-ionic.svg)](https://www.npmjs.com/package/@deijose/nix-ionic)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Ionic bridge for [Nix.js](https://nix-js-landing.vercel.app/) — routing, lifecycle hooks, and navigation powered by the official `ion-router` API.

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

---

## Quick start

### 1. Initialize Ionic in `main.ts`

```typescript
import { defineCustomElements } from "@ionic/core/loader";
defineCustomElements();

import "@ionic/core/css/core.css";
import "@ionic/core/css/normalize.css";
import "@ionic/core/css/structure.css";
import "@ionic/core/css/typography.css";
import "@ionic/core/css/padding.css";
import "@ionic/core/css/flex-utils.css";
import "@ionic/core/css/display.css";
```

### 2. Define your routes

```typescript
import { NixComponent, html, mount } from "@deijose/nix-js";
import { IonRouterOutlet } from "@deijose/nix-ionic";
import { HomePage }   from "./pages/HomePage";
import { DetailPage } from "./pages/DetailPage";

const outlet = new IonRouterOutlet([
  { path: "/",           component: (ctx) => new HomePage(ctx)   },
  { path: "/detail/:id", component: (ctx) => new DetailPage(ctx) },
  { path: "/profile",    component: (ctx) => ProfilePage(ctx)    },
]);

class App extends NixComponent {
  render() {
    return html`<ion-app>${outlet}</ion-app>`;
  }
}

mount(new App(), "#app");
```

---

## Pages

### Class component — `IonPage`

Use `IonPage` when you need navigation lifecycle hooks.

```typescript
import { html, signal } from "@deijose/nix-js";
import { IonPage, IonBackButton, useRouter } from "@deijose/nix-ionic";
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

## Navigation — `useRouter()`

Access the router singleton from anywhere without prop drilling:

```typescript
import { useRouter } from "@deijose/nix-ionic";

const router = useRouter();

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
  const router = useRouter(); // safe to call inside render()

  return html`
    <ion-button @click=${() => router.navigate("/profile")}>
      Go to Profile
    </ion-button>
  `;
}
```

---

## `IonBackButton()`

A wrapper around `<ion-back-button>` that intercepts the click before Ionic's internal router processes it, calling `router.back()` directly. Automatically hidden on the root page.

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
    beforeEnter: (to, from) => {
      if (!isLoggedIn()) return "/login"; // redirect
      if (!isAdmin())    return false;    // cancel navigation
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

### `IonRouterOutlet`

```typescript
new IonRouterOutlet(routes: RouteDefinition[])
```

Mounts `ion-router` + `ion-router-outlet` in the DOM. Registers a custom element per route. Initialize once in your app entry point.

### `useRouter()`

```typescript
useRouter(): RouterStore
```

Returns the active router store. Must be called after `IonRouterOutlet` is instantiated.

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
| Navigation API | `NavController` | `useHistory` | `useRouter()` |


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
// ── Ionic loader ─────────────────────────────────────────────────────────────
import { defineCustomElements } from "@ionic/core/loader";
defineCustomElements();

// ── Ionic CSS (order matters) ─────────────────────────────────────────────────
import "@ionic/core/css/core.css";
import "@ionic/core/css/normalize.css";
import "@ionic/core/css/structure.css";
import "@ionic/core/css/typography.css";
import "@ionic/core/css/padding.css";
import "@ionic/core/css/flex-utils.css";
import "@ionic/core/css/display.css";

// ── App styles ────────────────────────────────────────────────────────────────
import "./style.css";

// ── App ───────────────────────────────────────────────────────────────────────
import { NixComponent, html, mount } from "@deijose/nix-js";
import type { NixTemplate } from "@deijose/nix-js";
import { IonRouterOutlet } from "@deijose/nix-ionic";

import { HomePage }    from "./pages/HomePage";
import { DetailPage }  from "./pages/DetailPage";
import { ProfilePage } from "./pages/ProfilePage";

const outlet = new IonRouterOutlet([
  { path: "/",           component: (ctx) => new HomePage(ctx)   },
  { path: "/detail/:id", component: (ctx) => new DetailPage(ctx) },
  { path: "/profile",    component: (ctx) => ProfilePage(ctx)    },
]);

class App extends NixComponent {
  override render(): NixTemplate {
    return html`<ion-app>${outlet}</ion-app>`;
  }
}

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
import { IonPage, IonBackButton, useRouter } from "@deijose/nix-ionic";
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
    const router = useRouter();

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