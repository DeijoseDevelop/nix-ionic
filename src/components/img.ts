/**
 * Direct subpath import for ion-img — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonImg } from "@deijose/nix-ionic/components/img";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonImg);
 * ```
 */
export { defineCustomElement as defineIonImg } from "@ionic/core/components/ion-img.js";
