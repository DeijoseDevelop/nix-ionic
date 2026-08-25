/**
 * Direct subpath import for ion-nav-link — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonNavLink } from "@deijose/nix-ionic/components/nav-link";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonNavLink);
 * ```
 */
export { defineCustomElement as defineIonNavLink } from "@ionic/core/components/ion-nav-link.js";
