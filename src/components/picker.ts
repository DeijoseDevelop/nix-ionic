/**
 * Direct subpath import for ion-picker — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonPicker } from "@deijose/nix-ionic/components/picker";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonPicker);
 * ```
 */
export { defineCustomElement as defineIonPicker } from "@ionic/core/components/ion-picker.js";
