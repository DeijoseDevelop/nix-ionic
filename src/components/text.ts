/**
 * Direct subpath import for ion-text — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonText } from "@deijose/nix-ionic/components/text";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonText);
 * ```
 */
export { defineCustomElement as defineIonText } from "@ionic/core/components/ion-text.js";
