/**
 * Overlays bundle — modal, popover, toast, alert, action-sheet, loading, picker.
 *
 * Includes: ion-modal, ion-popover, ion-toast, ion-alert,
 *           ion-action-sheet, ion-loading, ion-picker, ion-picker-column,
 *           ion-picker-column-option
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonModal } from "@ionic/core/components/ion-modal.js";
import { defineCustomElement as defineIonPopover } from "@ionic/core/components/ion-popover.js";
import { defineCustomElement as defineIonToast } from "@ionic/core/components/ion-toast.js";
import { defineCustomElement as defineIonAlert } from "@ionic/core/components/ion-alert.js";
import { defineCustomElement as defineIonActionSheet } from "@ionic/core/components/ion-action-sheet.js";
import { defineCustomElement as defineIonLoading } from "@ionic/core/components/ion-loading.js";
import { defineCustomElement as defineIonPicker } from "@ionic/core/components/ion-picker.js";
import { defineCustomElement as defineIonPickerColumn } from "@ionic/core/components/ion-picker-column.js";
import { defineCustomElement as defineIonPickerColumnOption } from "@ionic/core/components/ion-picker-column-option.js";

export const overlayComponents: ComponentDefiner[] = [
  defineIonModal,
  defineIonPopover,
  defineIonToast,
  defineIonAlert,
  defineIonActionSheet,
  defineIonLoading,
  defineIonPicker,
  defineIonPickerColumn,
  defineIonPickerColumnOption,
];
