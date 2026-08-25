/**
 * Direct subpath import for ion-breadcrumbs — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonBreadcrumbs } from "@deijose/nix-ionic/components/breadcrumbs";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonBreadcrumbs);
 * ```
 */
export { defineCustomElement as defineIonBreadcrumbs } from "@ionic/core/components/ion-breadcrumbs.js";
