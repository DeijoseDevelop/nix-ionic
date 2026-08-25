/**
 * Direct subpath import for ion-textarea — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonTextarea } from "@deijose/nix-ionic/components/textarea";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonTextarea);
 * ```
 */
export { defineCustomElement as defineIonTextarea } from "@ionic/core/components/ion-textarea.js";
