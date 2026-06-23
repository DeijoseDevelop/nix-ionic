/**
 * @deijose/nix-ionic / setup.ts  —  v2
 *
 * BREAKING vs v1: <ion-router> and <ion-route> are NO LONGER registered
 * automatically. The single-router architecture doesn't use them — all
 * routing goes through the core router. Removing the imports also drops
 * a few KB from the bundle.
 *
 * If you previously declared <ion-router> directly in your HTML or built
 * a custom layer on top of it, you now need to register it yourself by
 * passing `defineIonRouter` and `defineIonRoute` to `setupNixIonic` via the
 * `components` option. This is intentional — the lib should not pay the
 * cost of components nobody uses anymore.
 */

import { initialize } from "@ionic/core/components";

// Minimal core components — the bare minimum any nix-ionic app needs.
import { defineCustomElement as defineIonApp } from "@ionic/core/components/ion-app.js";
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
 * Only the minimal set is registered automatically:
 *   - ion-app
 *   - ion-router-outlet  (motor de animación; usado por IonRouterOutlet)
 *   - ion-back-button    (envuelto por IonBackButton)
 *   - ion-icon
 *
 * Pass extra Ionic components explicitly:
 *
 * ```ts
 * import { setupNixIonic } from "@deijose/nix-ionic";
 * import { layoutComponents } from "@deijose/nix-ionic/bundles/layout";
 * import { home, homeOutline } from "ionicons/icons";
 *
 * setupNixIonic({
 *   components: [...layoutComponents],
 *   icons: { home, "home-outline": homeOutline },
 * });
 * ```
 */
export function setupNixIonic(options: SetupNixIonicOptions = {}) {
    if (isInitialized) return;

    const assetPath =
        options.iconAssetPath ||
        "https://unpkg.com/ionicons@latest/dist/ionicons/svg/";
    (window as any).ionicons = { assets: assetPath };

    initialize();

    const coreComponents: ComponentDefiner[] = [
        defineIonApp,
        defineIonRouterOutlet,
        defineIonBackButton,
        defineIonIcon,
    ];

    for (let i = 0; i < coreComponents.length; i++) {
        coreComponents[i]();
    }

    if (options.components) {
        for (let i = 0; i < options.components.length; i++) {
            options.components[i]();
        }
    }

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