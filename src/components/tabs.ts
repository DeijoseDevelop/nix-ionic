/**
 * Direct subpath import for ion-tabs — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonTabs } from "@deijose/nix-ionic/components/tabs";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonTabs);
 * ```
 */
export { defineCustomElement as defineIonTabs } from "@ionic/core/components/ion-tabs.js";
