/**
 * Partial fixture — imports a few components via bundle subpaths.
 *
 * Expected: only layout + buttons code is included. No forms, lists,
 * feedback, overlays, or navigation component code.
 */
import { initializeNixIonic, registerIonicComponents } from "@deijose/nix-ionic";
import { layoutComponents } from "@deijose/nix-ionic/bundles/layout";
import { buttonComponents } from "@deijose/nix-ionic/bundles/buttons";

initializeNixIonic();
registerIonicComponents(...layoutComponents, ...buttonComponents);

export { layoutComponents, buttonComponents };
