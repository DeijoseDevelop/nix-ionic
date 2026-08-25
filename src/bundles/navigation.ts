/**
 * Navigation bundle — menu and navigation-related components.
 *
 * Includes: ion-menu, ion-menu-button, ion-menu-toggle, ion-tabs, ion-tab,
 *           ion-tab-bar, ion-tab-button, ion-label, ion-nav, ion-nav-link,
 *           ion-router-link
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonMenu } from "@ionic/core/components/ion-menu.js";
import { defineCustomElement as defineIonMenuButton } from "@ionic/core/components/ion-menu-button.js";
import { defineCustomElement as defineIonMenuToggle } from "@ionic/core/components/ion-menu-toggle.js";
import { defineCustomElement as defineIonTabs } from "@ionic/core/components/ion-tabs.js";
import { defineCustomElement as defineIonTab } from "@ionic/core/components/ion-tab.js";
import { defineCustomElement as defineIonTabBar } from "@ionic/core/components/ion-tab-bar.js";
import { defineCustomElement as defineIonTabButton } from "@ionic/core/components/ion-tab-button.js";
import { defineCustomElement as defineIonLabel } from "@ionic/core/components/ion-label.js";
import { defineCustomElement as defineIonNav } from "@ionic/core/components/ion-nav.js";
import { defineCustomElement as defineIonNavLink } from "@ionic/core/components/ion-nav-link.js";
import { defineCustomElement as defineIonRouterLink } from "@ionic/core/components/ion-router-link.js";

export const navigationComponents: ComponentDefiner[] = [
  defineIonMenu,
  defineIonMenuButton,
  defineIonMenuToggle,
  defineIonTabs,
  defineIonTab,
  defineIonTabBar,
  defineIonTabButton,
  defineIonLabel,
  defineIonNav,
  defineIonNavLink,
  defineIonRouterLink,
];
