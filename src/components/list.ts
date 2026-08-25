/**
 * Direct subpath import for ion-list — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonList } from "@deijose/nix-ionic/components/list";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonList);
 * ```
 */
export { defineCustomElement as defineIonList } from "@ionic/core/components/ion-list.js";
