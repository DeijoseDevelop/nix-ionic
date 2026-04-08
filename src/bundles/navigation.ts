/**
 * Navigation bundle — menu and navigation-related components.
 *
 * Includes: ion-menu, ion-menu-button, ion-tabs, ion-tab, ion-tab-bar, ion-tab-button, ion-label
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonMenu } from "@ionic/core/components/ion-menu.js";
import { defineCustomElement as defineIonMenuButton } from "@ionic/core/components/ion-menu-button.js";
import { defineCustomElement as defineIonTabs } from "@ionic/core/components/ion-tabs.js";
import { defineCustomElement as defineIonTab } from "@ionic/core/components/ion-tab.js";
import { defineCustomElement as defineIonTabBar } from "@ionic/core/components/ion-tab-bar.js";
import { defineCustomElement as defineIonTabButton } from "@ionic/core/components/ion-tab-button.js";
import { defineCustomElement as defineIonLabel } from "@ionic/core/components/ion-label.js";

export const navigationComponents: ComponentDefiner[] = [
  defineIonMenu,
  defineIonMenuButton,
  defineIonTabs,
  defineIonTab,
  defineIonTabBar,
  defineIonTabButton,
  defineIonLabel,
];
