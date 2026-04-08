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
  useRouter,
  useRouterState,
  type RouterInstance,
  type RouterState,
  type RouteDefinition,
  type PageContext,
} from "./IonRouterOutlet";

export {
  createBottomTabBar,
  type BottomTabItem,
  type BottomTabBarOptions,
} from "./tabs";