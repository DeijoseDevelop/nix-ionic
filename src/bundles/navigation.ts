/**
 * Navigation bundle — menu and navigation-related components.
 *
 * Includes: ion-menu, ion-menu-button
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonMenu } from "@ionic/core/components/ion-menu.js";
import { defineCustomElement as defineIonMenuButton } from "@ionic/core/components/ion-menu-button.js";

export const navigationComponents: ComponentDefiner[] = [
  defineIonMenu,
  defineIonMenuButton,
];
