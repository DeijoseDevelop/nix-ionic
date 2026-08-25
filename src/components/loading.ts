/**
 * Direct subpath import for ion-loading — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonLoading } from "@deijose/nix-ionic/components/loading";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonLoading);
 * ```
 */
export { defineCustomElement as defineIonLoading } from "@ionic/core/components/ion-loading.js";
