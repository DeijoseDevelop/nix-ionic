/**
 * Direct subpath import for ion-select — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonSelect } from "@deijose/nix-ionic/components/select";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonSelect);
 * ```
 */
export { defineCustomElement as defineIonSelect } from "@ionic/core/components/ion-select.js";
