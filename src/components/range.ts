/**
 * Direct subpath import for ion-range — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonRange } from "@deijose/nix-ionic/components/range";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonRange);
 * ```
 */
export { defineCustomElement as defineIonRange } from "@ionic/core/components/ion-range.js";
