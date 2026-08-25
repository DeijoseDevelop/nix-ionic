/**
 * List bundle — list, item, card, and data display components.
 *
 * Includes: ion-list, ion-list-header, ion-item, ion-item-divider,
 *           ion-item-group, ion-item-sliding, ion-item-options, ion-item-option,
 *           ion-label, ion-note, ion-reorder, ion-reorder-group,
 *           ion-card, ion-card-header, ion-card-title, ion-card-subtitle, ion-card-content,
 *           ion-chip, ion-badge, ion-avatar, ion-thumbnail,
 *           ion-accordion, ion-accordion-group,
 *           ion-breadcrumb, ion-breadcrumbs,
 *           ion-infinite-scroll, ion-infinite-scroll-content,
 *           ion-refresher, ion-refresher-content
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonList } from "@ionic/core/components/ion-list.js";
import { defineCustomElement as defineIonListHeader } from "@ionic/core/components/ion-list-header.js";
import { defineCustomElement as defineIonItem } from "@ionic/core/components/ion-item.js";
import { defineCustomElement as defineIonItemDivider } from "@ionic/core/components/ion-item-divider.js";
import { defineCustomElement as defineIonItemGroup } from "@ionic/core/components/ion-item-group.js";
import { defineCustomElement as defineIonItemSliding } from "@ionic/core/components/ion-item-sliding.js";
import { defineCustomElement as defineIonItemOptions } from "@ionic/core/components/ion-item-options.js";
import { defineCustomElement as defineIonItemOption } from "@ionic/core/components/ion-item-option.js";
import { defineCustomElement as defineIonLabel } from "@ionic/core/components/ion-label.js";
import { defineCustomElement as defineIonNote } from "@ionic/core/components/ion-note.js";
import { defineCustomElement as defineIonReorder } from "@ionic/core/components/ion-reorder.js";
import { defineCustomElement as defineIonReorderGroup } from "@ionic/core/components/ion-reorder-group.js";
import { defineCustomElement as defineIonCard } from "@ionic/core/components/ion-card.js";
import { defineCustomElement as defineIonCardHeader } from "@ionic/core/components/ion-card-header.js";
import { defineCustomElement as defineIonCardTitle } from "@ionic/core/components/ion-card-title.js";
import { defineCustomElement as defineIonCardSubtitle } from "@ionic/core/components/ion-card-subtitle.js";
import { defineCustomElement as defineIonCardContent } from "@ionic/core/components/ion-card-content.js";
import { defineCustomElement as defineIonChip } from "@ionic/core/components/ion-chip.js";
import { defineCustomElement as defineIonBadge } from "@ionic/core/components/ion-badge.js";
import { defineCustomElement as defineIonAvatar } from "@ionic/core/components/ion-avatar.js";
import { defineCustomElement as defineIonThumbnail } from "@ionic/core/components/ion-thumbnail.js";
import { defineCustomElement as defineIonAccordion } from "@ionic/core/components/ion-accordion.js";
import { defineCustomElement as defineIonAccordionGroup } from "@ionic/core/components/ion-accordion-group.js";
import { defineCustomElement as defineIonBreadcrumb } from "@ionic/core/components/ion-breadcrumb.js";
import { defineCustomElement as defineIonBreadcrumbs } from "@ionic/core/components/ion-breadcrumbs.js";
import { defineCustomElement as defineIonInfiniteScroll } from "@ionic/core/components/ion-infinite-scroll.js";
import { defineCustomElement as defineIonInfiniteScrollContent } from "@ionic/core/components/ion-infinite-scroll-content.js";
import { defineCustomElement as defineIonRefresher } from "@ionic/core/components/ion-refresher.js";
import { defineCustomElement as defineIonRefresherContent } from "@ionic/core/components/ion-refresher-content.js";

export const listComponents: ComponentDefiner[] = [
  defineIonList,
  defineIonListHeader,
  defineIonItem,
  defineIonItemDivider,
  defineIonItemGroup,
  defineIonItemSliding,
  defineIonItemOptions,
  defineIonItemOption,
  defineIonLabel,
  defineIonNote,
  defineIonReorder,
  defineIonReorderGroup,
  defineIonCard,
  defineIonCardHeader,
  defineIonCardTitle,
  defineIonCardSubtitle,
  defineIonCardContent,
  defineIonChip,
  defineIonBadge,
  defineIonAvatar,
  defineIonThumbnail,
  defineIonAccordion,
  defineIonAccordionGroup,
  defineIonBreadcrumb,
  defineIonBreadcrumbs,
  defineIonInfiniteScroll,
  defineIonInfiniteScrollContent,
  defineIonRefresher,
  defineIonRefresherContent,
];
