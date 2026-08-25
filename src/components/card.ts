/**
 * Direct subpath import for ion-card — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonCard } from "@deijose/nix-ionic/components/card";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonCard);
 * ```
 */
export { defineCustomElement as defineIonCard } from "@ionic/core/components/ion-card.js";
