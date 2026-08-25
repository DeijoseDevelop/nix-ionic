/**
 * Minimal fixture — imports only one component.
 *
 * Expected: only ion-button code is included in the bundle.
 * No other Ionic component code should be present.
 */
import { initializeNixIonic, registerIonicComponents } from "@deijose/nix-ionic";
import { defineIonButton } from "@deijose/nix-ionic/components/button";

initializeNixIonic();
registerIonicComponents(defineIonButton);

export { defineIonButton };
