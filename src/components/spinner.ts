/**
 * Direct subpath import for ion-spinner — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonSpinner } from "@deijose/nix-ionic/components/spinner";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonSpinner);
 * ```
 */
export { defineCustomElement as defineIonSpinner } from "@ionic/core/components/ion-spinner.js";
