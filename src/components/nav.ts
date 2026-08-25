/**
 * Direct subpath import for ion-nav — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonNav } from "@deijose/nix-ionic/components/nav";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonNav);
 * ```
 */
export { defineCustomElement as defineIonNav } from "@ionic/core/components/ion-nav.js";
