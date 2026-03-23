/**
 * Buttons bundle — button and FAB components.
 *
 * Includes: ion-button, ion-fab, ion-fab-button, ion-fab-list, ion-ripple-effect
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonButton } from "@ionic/core/components/ion-button.js";
import { defineCustomElement as defineIonFab } from "@ionic/core/components/ion-fab.js";
import { defineCustomElement as defineIonFabButton } from "@ionic/core/components/ion-fab-button.js";
import { defineCustomElement as defineIonFabList } from "@ionic/core/components/ion-fab-list.js";
import { defineCustomElement as defineIonRippleEffect } from "@ionic/core/components/ion-ripple-effect.js";

export const buttonComponents: ComponentDefiner[] = [
  defineIonButton,
  defineIonFab,
  defineIonFabButton,
  defineIonFabList,
  defineIonRippleEffect,
];
