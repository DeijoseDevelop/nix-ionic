/**
 * Direct subpath import for ion-item — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonItem } from "@deijose/nix-ionic/components/item";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonItem);
 * ```
 */
export { defineCustomElement as defineIonItem } from "@ionic/core/components/ion-item.js";
