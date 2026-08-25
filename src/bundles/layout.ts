/**
 * Layout bundle — essential page structure components.
 *
 * Includes: ion-header, ion-toolbar, ion-title, ion-content, ion-footer,
 *           ion-buttons, ion-grid, ion-row, ion-col, ion-split-pane,
 *           ion-text, ion-img, ion-backdrop
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonHeader } from "@ionic/core/components/ion-header.js";
import { defineCustomElement as defineIonToolbar } from "@ionic/core/components/ion-toolbar.js";
import { defineCustomElement as defineIonTitle } from "@ionic/core/components/ion-title.js";
import { defineCustomElement as defineIonContent } from "@ionic/core/components/ion-content.js";
import { defineCustomElement as defineIonFooter } from "@ionic/core/components/ion-footer.js";
import { defineCustomElement as defineIonButtons } from "@ionic/core/components/ion-buttons.js";
import { defineCustomElement as defineIonGrid } from "@ionic/core/components/ion-grid.js";
import { defineCustomElement as defineIonRow } from "@ionic/core/components/ion-row.js";
import { defineCustomElement as defineIonCol } from "@ionic/core/components/ion-col.js";
import { defineCustomElement as defineIonSplitPane } from "@ionic/core/components/ion-split-pane.js";
import { defineCustomElement as defineIonText } from "@ionic/core/components/ion-text.js";
import { defineCustomElement as defineIonImg } from "@ionic/core/components/ion-img.js";
import { defineCustomElement as defineIonBackdrop } from "@ionic/core/components/ion-backdrop.js";

export const layoutComponents: ComponentDefiner[] = [
  defineIonHeader,
  defineIonToolbar,
  defineIonTitle,
  defineIonContent,
  defineIonFooter,
  defineIonButtons,
  defineIonGrid,
  defineIonRow,
  defineIonCol,
  defineIonSplitPane,
  defineIonText,
  defineIonImg,
  defineIonBackdrop,
];
