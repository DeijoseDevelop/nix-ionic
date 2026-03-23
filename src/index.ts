export {
  IonPage,
  createPageLifecycle,
  useIonViewWillEnter,
  useIonViewDidEnter,
  useIonViewWillLeave,
  useIonViewDidLeave,
  type PageLifecycle,
} from "./lifecycle";

export { setupNixIonic, type ComponentDefiner } from "./setup";

export {
  IonRouterOutlet,
  IonBackButton,
  useRouter,
  type RouteDefinition,
  type PageContext,
} from "./IonRouterOutlet";