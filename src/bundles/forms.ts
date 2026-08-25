/**
 * Forms bundle — input and form-related components.
 *
 * Includes: ion-input, ion-input-otp, ion-input-password-toggle, ion-textarea,
 *           ion-checkbox, ion-toggle, ion-select, ion-select-option,
 *           ion-select-modal, ion-select-popover, ion-radio, ion-radio-group,
 *           ion-range, ion-searchbar, ion-datetime, ion-datetime-button,
 *           ion-segment, ion-segment-button, ion-segment-view, ion-segment-content
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonInput } from "@ionic/core/components/ion-input.js";
import { defineCustomElement as defineIonInputOtp } from "@ionic/core/components/ion-input-otp.js";
import { defineCustomElement as defineIonInputPasswordToggle } from "@ionic/core/components/ion-input-password-toggle.js";
import { defineCustomElement as defineIonTextarea } from "@ionic/core/components/ion-textarea.js";
import { defineCustomElement as defineIonCheckbox } from "@ionic/core/components/ion-checkbox.js";
import { defineCustomElement as defineIonToggle } from "@ionic/core/components/ion-toggle.js";
import { defineCustomElement as defineIonSelect } from "@ionic/core/components/ion-select.js";
import { defineCustomElement as defineIonSelectOption } from "@ionic/core/components/ion-select-option.js";
import { defineCustomElement as defineIonSelectModal } from "@ionic/core/components/ion-select-modal.js";
import { defineCustomElement as defineIonSelectPopover } from "@ionic/core/components/ion-select-popover.js";
import { defineCustomElement as defineIonRadio } from "@ionic/core/components/ion-radio.js";
import { defineCustomElement as defineIonRadioGroup } from "@ionic/core/components/ion-radio-group.js";
import { defineCustomElement as defineIonRange } from "@ionic/core/components/ion-range.js";
import { defineCustomElement as defineIonSearchbar } from "@ionic/core/components/ion-searchbar.js";
import { defineCustomElement as defineIonDatetime } from "@ionic/core/components/ion-datetime.js";
import { defineCustomElement as defineIonDatetimeButton } from "@ionic/core/components/ion-datetime-button.js";
import { defineCustomElement as defineIonSegment } from "@ionic/core/components/ion-segment.js";
import { defineCustomElement as defineIonSegmentButton } from "@ionic/core/components/ion-segment-button.js";
import { defineCustomElement as defineIonSegmentView } from "@ionic/core/components/ion-segment-view.js";
import { defineCustomElement as defineIonSegmentContent } from "@ionic/core/components/ion-segment-content.js";

export const formComponents: ComponentDefiner[] = [
  defineIonInput,
  defineIonInputOtp,
  defineIonInputPasswordToggle,
  defineIonTextarea,
  defineIonCheckbox,
  defineIonToggle,
  defineIonSelect,
  defineIonSelectOption,
  defineIonSelectModal,
  defineIonSelectPopover,
  defineIonRadio,
  defineIonRadioGroup,
  defineIonRange,
  defineIonSearchbar,
  defineIonDatetime,
  defineIonDatetimeButton,
  defineIonSegment,
  defineIonSegmentButton,
  defineIonSegmentView,
  defineIonSegmentContent,
];
