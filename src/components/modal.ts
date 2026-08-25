/**
 * Direct subpath import for ion-modal — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonModal } from "@deijose/nix-ionic/components/modal";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonModal);
 * ```
 */
export { defineCustomElement as defineIonModal } from "@ionic/core/components/ion-modal.js";
