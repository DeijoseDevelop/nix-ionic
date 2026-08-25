/**
 * Direct subpath import for ion-refresher — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonRefresher } from "@deijose/nix-ionic/components/refresher";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonRefresher);
 * ```
 */
export { defineCustomElement as defineIonRefresher } from "@ionic/core/components/ion-refresher.js";
