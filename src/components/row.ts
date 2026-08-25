/**
 * Direct subpath import for ion-row — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonRow } from "@deijose/nix-ionic/components/row";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonRow);
 * ```
 */
export { defineCustomElement as defineIonRow } from "@ionic/core/components/ion-row.js";
