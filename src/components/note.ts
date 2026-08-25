/**
 * Direct subpath import for ion-note — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonNote } from "@deijose/nix-ionic/components/note";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonNote);
 * ```
 */
export { defineCustomElement as defineIonNote } from "@ionic/core/components/ion-note.js";
