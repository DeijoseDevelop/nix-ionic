/**
 * Direct subpath import for ion-reorder — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonReorder } from "@deijose/nix-ionic/components/reorder";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonReorder);
 * ```
 */
export { defineCustomElement as defineIonReorder } from "@ionic/core/components/ion-reorder.js";
