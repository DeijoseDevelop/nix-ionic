/**
 * Direct subpath import for ion-grid — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonGrid } from "@deijose/nix-ionic/components/grid";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonGrid);
 * ```
 */
export { defineCustomElement as defineIonGrid } from "@ionic/core/components/ion-grid.js";
