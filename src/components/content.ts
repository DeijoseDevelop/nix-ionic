/**
 * Direct subpath import for ion-content — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonContent } from "@deijose/nix-ionic/components/content";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonContent);
 * ```
 */
export { defineCustomElement as defineIonContent } from "@ionic/core/components/ion-content.js";
