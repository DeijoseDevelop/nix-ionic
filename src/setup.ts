import { initialize } from "@ionic/core/components";

// Minimal core components required for any nix-ionic app
import { defineCustomElement as defineIonApp } from "@ionic/core/components/ion-app.js";
import { defineCustomElement as defineIonRouter } from "@ionic/core/components/ion-router.js";
import { defineCustomElement as defineIonRoute } from "@ionic/core/components/ion-route.js";
import { defineCustomElement as defineIonRouterOutlet } from "@ionic/core/components/ion-router-outlet.js";
import { defineCustomElement as defineIonBackButton } from "@ionic/core/components/ion-back-button.js";

// Icons
import { defineCustomElement as defineIonIcon } from "ionicons/components/ion-icon.js";
import { addIcons } from "ionicons";
import { arrowBack, arrowBackSharp, chevronBack, chevronBackSharp } from "ionicons/icons";

export type ComponentDefiner = () => void;
export type IconDefinitionMap = Record<string, string>;

export interface SetupNixIonicOptions {
  iconAssetPath?: string;
  components?: ComponentDefiner[];
  icons?: IconDefinitionMap;
}

let isInitialized = false;

/**
 * Initialize Ionic Core for Nix.js.
 *
 * By default only the **minimal** components needed for routing are registered
 * (ion-app, ion-router, ion-route, ion-router-outlet, ion-back-button, ion-icon).
 *
 * Pass additional components via `options.components` to register only what you use:
 *
 * ```ts
 * import { setupNixIonic } from "@deijose/nix-ionic";
 * import { layoutComponents } from "@deijose/nix-ionic/bundles/layout";
 * import { defineIonButton } from "@deijose/nix-ionic/components";
 * import { home, homeOutline } from "ionicons/icons";
 *
 * setupNixIonic({
 *   components: [...layoutComponents, defineIonButton],
 *   icons: { home, "home-outline": homeOutline },
 * });
 * ```
 */
export function setupNixIonic(
  options: SetupNixIonicOptions = {}
) {
  if (isInitialized) return;

  // Ionicons asset configuration
  const assetPath =
    options.iconAssetPath ||
    "https://unpkg.com/ionicons@latest/dist/ionicons/svg/";
  (window as any).ionicons = { assets: assetPath };

  initialize();

  // Register minimal core components (always needed)
  const coreComponents: ComponentDefiner[] = [
    defineIonApp,
    defineIonRouter,
    defineIonRoute,
    defineIonRouterOutlet,
    defineIonBackButton,
    defineIonIcon,
  ];

  for (let i = 0; i < coreComponents.length; i++) {
    const def = coreComponents[i];
    def();
  }

  // Register user-provided components
  if (options.components) {
    for (let i = 0; i < options.components.length; i++) {
      const def = options.components[i];
      def();
    }
  }

  // Register critical navigation icons + optional app icons
  const defaultIcons: IconDefinitionMap = {
    "arrow-back": arrowBack,
    "arrow-back-sharp": arrowBackSharp,
    "chevron-back": chevronBack,
    "chevron-back-sharp": chevronBackSharp,
  };

  addIcons({
    ...defaultIcons,
    ...(options.icons ?? {}),
  });

  isInitialized = true;
}

export { addIcons };