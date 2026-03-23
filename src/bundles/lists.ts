/**
 * List bundle — list, item, and card components.
 *
 * Includes: ion-list, ion-list-header, ion-item, ion-item-divider,
 *           ion-item-sliding, ion-item-options, ion-item-option,
 *           ion-label, ion-note,
 *           ion-card, ion-card-header, ion-card-title, ion-card-subtitle, ion-card-content
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonList } from "@ionic/core/components/ion-list.js";
import { defineCustomElement as defineIonListHeader } from "@ionic/core/components/ion-list-header.js";
import { defineCustomElement as defineIonItem } from "@ionic/core/components/ion-item.js";
import { defineCustomElement as defineIonItemDivider } from "@ionic/core/components/ion-item-divider.js";
import { defineCustomElement as defineIonItemSliding } from "@ionic/core/components/ion-item-sliding.js";
import { defineCustomElement as defineIonItemOptions } from "@ionic/core/components/ion-item-options.js";
import { defineCustomElement as defineIonItemOption } from "@ionic/core/components/ion-item-option.js";
import { defineCustomElement as defineIonLabel } from "@ionic/core/components/ion-label.js";
import { defineCustomElement as defineIonNote } from "@ionic/core/components/ion-note.js";
import { defineCustomElement as defineIonCard } from "@ionic/core/components/ion-card.js";
import { defineCustomElement as defineIonCardHeader } from "@ionic/core/components/ion-card-header.js";
import { defineCustomElement as defineIonCardTitle } from "@ionic/core/components/ion-card-title.js";
import { defineCustomElement as defineIonCardSubtitle } from "@ionic/core/components/ion-card-subtitle.js";
import { defineCustomElement as defineIonCardContent } from "@ionic/core/components/ion-card-content.js";

export const listComponents: ComponentDefiner[] = [
  defineIonList,
  defineIonListHeader,
  defineIonItem,
  defineIonItemDivider,
  defineIonItemSliding,
  defineIonItemOptions,
  defineIonItemOption,
  defineIonLabel,
  defineIonNote,
  defineIonCard,
  defineIonCardHeader,
  defineIonCardTitle,
  defineIonCardSubtitle,
  defineIonCardContent,
];
