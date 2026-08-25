/**
 * Direct subpath import for ion-tab — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonTab } from "@deijose/nix-ionic/components/tab";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonTab);
 * ```
 */
export { defineCustomElement as defineIonTab } from "@ionic/core/components/ion-tab.js";
