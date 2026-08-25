/**
 * Direct subpath import for ion-alert — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonAlert } from "@deijose/nix-ionic/components/alert";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonAlert);
 * ```
 */
export { defineCustomElement as defineIonAlert } from "@ionic/core/components/ion-alert.js";
