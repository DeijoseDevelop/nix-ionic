/**
 * Direct subpath import for ion-badge — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonBadge } from "@deijose/nix-ionic/components/badge";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonBadge);
 * ```
 */
export { defineCustomElement as defineIonBadge } from "@ionic/core/components/ion-badge.js";
