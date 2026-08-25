/**
 * Direct subpath import for ion-radio — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonRadio } from "@deijose/nix-ionic/components/radio";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonRadio);
 * ```
 */
export { defineCustomElement as defineIonRadio } from "@ionic/core/components/ion-radio.js";
