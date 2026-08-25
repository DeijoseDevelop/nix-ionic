/**
 * Full fixture — imports all components + overlays + navigation.
 *
 * Expected: all Ionic component code is included. This is the worst-case
 * bundle size for consumers who import everything.
 */
import {
    initializeNixIonic,
    registerIonicComponents,
    createToast,
    createAlert,
    createModalController,
    createNixDelegate,
    IonRouterOutlet,
    IonPage,
} from "@deijose/nix-ionic";
import { allComponents } from "@deijose/nix-ionic/bundles/all";

initializeNixIonic();
registerIonicComponents(...allComponents);

export {
    createToast,
    createAlert,
    createModalController,
    createNixDelegate,
    IonRouterOutlet,
    IonPage,
    allComponents,
};
