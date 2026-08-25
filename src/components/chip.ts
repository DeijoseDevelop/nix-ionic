/**
 * Direct subpath import for ion-chip — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonChip } from "@deijose/nix-ionic/components/chip";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonChip);
 * ```
 */
export { defineCustomElement as defineIonChip } from "@ionic/core/components/ion-chip.js";
