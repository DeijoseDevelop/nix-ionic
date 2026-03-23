/**
 * Overlays bundle — modal, popover, toast, and alert components.
 *
 * Includes: ion-modal, ion-popover, ion-toast, ion-alert
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonModal } from "@ionic/core/components/ion-modal.js";
import { defineCustomElement as defineIonPopover } from "@ionic/core/components/ion-popover.js";
import { defineCustomElement as defineIonToast } from "@ionic/core/components/ion-toast.js";
import { defineCustomElement as defineIonAlert } from "@ionic/core/components/ion-alert.js";

export const overlayComponents: ComponentDefiner[] = [
  defineIonModal,
  defineIonPopover,
  defineIonToast,
  defineIonAlert,
];
