/**
 * @deijose/nix-ionic — v2 single-router architecture
 *
 * BREAKING CHANGES (v1.x → v2):
 *
 *   ❌ Removed:
 *      - nixIonicRouter()          → use nixRouter() from @deijose/nix-js
 *      - nixIonicRouterState()     → use nixRouter() from @deijose/nix-js
 *      - RouterInstance type       → use Router from @deijose/nix-js
 *      - RouterState type          → use Router from @deijose/nix-js
 *      - <ion-router> and <ion-route> are no longer rendered/registered
 *
 *   ✅ Same API surface:
 *      - IonRouterOutlet          (rewrite internally; same constructor)
 *      - IonBackButton            (rewrite internally; same call signature)
 *      - IonPage                  (no changes)
 *      - PageLifecycle + helpers  (no changes)
 *      - createBottomTabBar       (same signature)
 *      - setupNixIonic            (same signature; smaller default bundle)
 *
 *   ➕ New:
 *      - IonRouterOutletOptions.tabs  for per-tab navigation stacks
 *      - IonRouterOutlet.invalidateCache / clearCache
 *      - Re-exports of core router types so apps don't need both imports
 *
 *   ⚠ User migration cheatsheet:
 *      v1                                          v2
 *      ──                                          ──
 *      const r = nixIonicRouter();                 const r = nixRouter();
 *      r.path.value                                r.current.value
 *      r.navigate("/x", "forward")                 r.navigate("/x", { direction: "forward" })
 *      r.replace("/x")                             r.replace("/x")
 *      r.canGoBack.value                           r.canGoBack.value   (now from core)
 *      r.params.value                              r.params.value
 *
 *   For tabs apps:
 *      new IonRouterOutlet(routes)
 *      → new IonRouterOutlet(routes, { tabs: ["/home", "/profile", "/settings"] })
 */

export {
    IonPage,
    createPageLifecycle,
    useIonViewWillEnter,
    useIonViewDidEnter,
    useIonViewWillLeave,
    useIonViewDidLeave,
    type PageLifecycle,
} from "./lifecycle";

export {
    setupNixIonic,
    type ComponentDefiner,
    type IconDefinitionMap,
    type SetupNixIonicOptions,
} from "./setup";

export {
    IonRouterOutlet,
    IonBackButton,
    type RouteDefinition,
    type PageContext,
    type GuardResult,
    type IonRouterOutletOptions,
} from "./IonRouterOutlet";

export {
    createBottomTabBar,
    type BottomTabItem,
    type BottomTabBarOptions,
} from "./tabs";

// Re-export the core router so consumers don't need a second import for the
// most common router calls.
export {
    nixRouter,
    type Router,
    type NavigationIntent,
    type NavigationDirection,
    type NavigationAction,
    type NavigateOptions,
} from "@deijose/nix-js";