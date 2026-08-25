/**
 * Direct subpath import for ion-buttons — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonButtons } from "@deijose/nix-ionic/components/buttons";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonButtons);
 * ```
 */
export { defineCustomElement as defineIonButtons } from "@ionic/core/components/ion-buttons.js";
