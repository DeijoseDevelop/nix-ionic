/**
 * Direct subpath import for ion-toast — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonToast } from "@deijose/nix-ionic/components/toast";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonToast);
 * ```
 */
export { defineCustomElement as defineIonToast } from "@ionic/core/components/ion-toast.js";
