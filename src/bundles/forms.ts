/**
 * Forms bundle — input and form-related components.
 *
 * Includes: ion-input, ion-textarea, ion-checkbox, ion-toggle, ion-select,
 *           ion-select-option, ion-radio, ion-radio-group, ion-range, ion-searchbar
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonInput } from "@ionic/core/components/ion-input.js";
import { defineCustomElement as defineIonTextarea } from "@ionic/core/components/ion-textarea.js";
import { defineCustomElement as defineIonCheckbox } from "@ionic/core/components/ion-checkbox.js";
import { defineCustomElement as defineIonToggle } from "@ionic/core/components/ion-toggle.js";
import { defineCustomElement as defineIonSelect } from "@ionic/core/components/ion-select.js";
import { defineCustomElement as defineIonSelectOption } from "@ionic/core/components/ion-select-option.js";
import { defineCustomElement as defineIonRadio } from "@ionic/core/components/ion-radio.js";
import { defineCustomElement as defineIonRadioGroup } from "@ionic/core/components/ion-radio-group.js";
import { defineCustomElement as defineIonRange } from "@ionic/core/components/ion-range.js";
import { defineCustomElement as defineIonSearchbar } from "@ionic/core/components/ion-searchbar.js";

export const formComponents: ComponentDefiner[] = [
  defineIonInput,
  defineIonTextarea,
  defineIonCheckbox,
  defineIonToggle,
  defineIonSelect,
  defineIonSelectOption,
  defineIonRadio,
  defineIonRadioGroup,
  defineIonRange,
  defineIonSearchbar,
];
