/**
 * Direct subpath import for ion-datetime — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonDatetime } from "@deijose/nix-ionic/components/datetime";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonDatetime);
 * ```
 */
export { defineCustomElement as defineIonDatetime } from "@ionic/core/components/ion-datetime.js";
