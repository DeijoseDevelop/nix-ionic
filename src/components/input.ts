/**
 * Direct subpath import for ion-input — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonInput } from "@deijose/nix-ionic/components/input";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonInput);
 * ```
 */
export { defineCustomElement as defineIonInput } from "@ionic/core/components/ion-input.js";
