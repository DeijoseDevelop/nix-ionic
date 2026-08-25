/**
 * Direct subpath import for ion-segment — maximum tree-shaking.
 *
 * ```ts
 * import { defineIonSegment } from "@deijose/nix-ionic/components/segment";
 * import { registerIonicComponents } from "@deijose/nix-ionic";
 *
 * registerIonicComponents(defineIonSegment);
 * ```
 */
export { defineCustomElement as defineIonSegment } from "@ionic/core/components/ion-segment.js";
