/**
 * Direct subpath import for ion-menu — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonMenu } from "@deijose/nix-ionic/components/menu";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonMenu);
 * ```
 */
export { defineCustomElement as defineIonMenu } from "@ionic/core/components/ion-menu.js";
