/**
 * Direct subpath import for ion-router-link — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonRouterLink } from "@deijose/nix-ionic/components/router-link";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonRouterLink);
 * ```
 */
export { defineCustomElement as defineIonRouterLink } from "@ionic/core/components/ion-router-link.js";
