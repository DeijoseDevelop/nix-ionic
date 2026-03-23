/**
 * Layout bundle — essential page structure components.
 *
 * Includes: ion-header, ion-toolbar, ion-title, ion-content, ion-footer, ion-buttons
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonHeader } from "@ionic/core/components/ion-header.js";
import { defineCustomElement as defineIonToolbar } from "@ionic/core/components/ion-toolbar.js";
import { defineCustomElement as defineIonTitle } from "@ionic/core/components/ion-title.js";
import { defineCustomElement as defineIonContent } from "@ionic/core/components/ion-content.js";
import { defineCustomElement as defineIonFooter } from "@ionic/core/components/ion-footer.js";
import { defineCustomElement as defineIonButtons } from "@ionic/core/components/ion-buttons.js";

export const layoutComponents: ComponentDefiner[] = [
  defineIonHeader,
  defineIonToolbar,
  defineIonTitle,
  defineIonContent,
  defineIonFooter,
  defineIonButtons,
];
