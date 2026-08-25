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
    _connectIonicLifecycle,
    type PageLifecycle,
} from "./lifecycle";

export {
    setupNixIonic,
    initializeNixIonic,
    registerIonicComponents,
    registerIonicons,
    addIcons,
    setAssetPath,
    type ComponentDefiner,
    type IconDefinitionMap,
    type SetupNixIonicOptions,
    type InitializeOptions,
    type SetupHandle,
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
    createTabsLayout,
    type BottomTabItem,
    type BottomTabBarOptions,
} from "./tabs";

export {
    createToast,
    createAlert,
    createLoading,
    createActionSheet,
    createPopover,
    createModal,
    createPicker,
    createModalController,
    createPopoverController,
    createNixDelegate,
    showToast,
    withLoading,
    confirm,
    toastController,
    alertController,
    loadingController,
    actionSheetController,
    popoverController,
    modalController,
    pickerController,
    type OverlayHandle,
    type NixOverlayDelegate,
    type ModalOptions,
    type PopoverOptions,
    type PickerOptions,
    type PickerColumnOption,
} from "./overlays";

export {
    createPageState,
    clearAllPageState,
    isSerializable,
    type PageState,
    type PageStateOptions,
    type StorageBackend,
    type SignalMap,
} from "./page-state";

export {
    NavigationManager,
    StackManager,
    type NavigationManagerOptions,
    type BeforeNavHook,
    type AfterNavHook,
    type TabChangeHook,
} from "./navigation";

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