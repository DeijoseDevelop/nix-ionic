import { initialize } from "@ionic/core/components";

// Layout & Core
import { defineCustomElement as defineIonApp } from "@ionic/core/components/ion-app.js";
import { defineCustomElement as defineIonHeader } from "@ionic/core/components/ion-header.js";
import { defineCustomElement as defineIonToolbar } from "@ionic/core/components/ion-toolbar.js";
import { defineCustomElement as defineIonTitle } from "@ionic/core/components/ion-title.js";
import { defineCustomElement as defineIonContent } from "@ionic/core/components/ion-content.js";
import { defineCustomElement as defineIonFooter } from "@ionic/core/components/ion-footer.js";

// Navigation
import { defineCustomElement as defineIonButtons } from "@ionic/core/components/ion-buttons.js";
import { defineCustomElement as defineIonBackButton } from "@ionic/core/components/ion-back-button.js";
import { defineCustomElement as defineIonRouter } from "@ionic/core/components/ion-router.js";
import { defineCustomElement as defineIonRoute } from "@ionic/core/components/ion-route.js";
import { defineCustomElement as defineIonRouterOutlet } from "@ionic/core/components/ion-router-outlet.js";
import { defineCustomElement as defineIonMenu } from "@ionic/core/components/ion-menu.js";
import { defineCustomElement as defineIonMenuButton } from "@ionic/core/components/ion-menu-button.js";

// Forms & Inputs
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

// List & Cards
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

// Feedback & Progress
import { defineCustomElement as defineIonSpinner } from "@ionic/core/components/ion-spinner.js";
import { defineCustomElement as defineIonProgressBar } from "@ionic/core/components/ion-progress-bar.js";
import { defineCustomElement as defineIonSkeletonText } from "@ionic/core/components/ion-skeleton-text.js";
import { defineCustomElement as defineIonBadge } from "@ionic/core/components/ion-badge.js";
import { defineCustomElement as defineIonAvatar } from "@ionic/core/components/ion-avatar.js";
import { defineCustomElement as defineIonThumbnail } from "@ionic/core/components/ion-thumbnail.js";

// Buttons & Actions
import { defineCustomElement as defineIonButton } from "@ionic/core/components/ion-button.js";
import { defineCustomElement as defineIonFab } from "@ionic/core/components/ion-fab.js";
import { defineCustomElement as defineIonFabButton } from "@ionic/core/components/ion-fab-button.js";
import { defineCustomElement as defineIonFabList } from "@ionic/core/components/ion-fab-list.js";
import { defineCustomElement as defineIonRippleEffect } from "@ionic/core/components/ion-ripple-effect.js";

// Overlays (Elementos)
import { defineCustomElement as defineIonModal } from "@ionic/core/components/ion-modal.js";
import { defineCustomElement as defineIonPopover } from "@ionic/core/components/ion-popover.js";
import { defineCustomElement as defineIonToast } from "@ionic/core/components/ion-toast.js";
import { defineCustomElement as defineIonAlert } from "@ionic/core/components/ion-alert.js";

// Icons
import { defineCustomElement as defineIonIcon } from "ionicons/components/ion-icon.js";

import { addIcons } from "ionicons";
import { arrowBack, arrowBackSharp, chevronBack, chevronBackSharp } from "ionicons/icons";

let isInitialized = false;

export function setupNixIonic(options: { iconAssetPath?: string } = {}) {
  if (isInitialized) return;

  // Configuración de Ionicons antes del registro
  const assetPath = options.iconAssetPath || "https://unpkg.com/ionicons@latest/dist/ionicons/svg/";
  (window as any).ionicons = { assets: assetPath };

  initialize();

  const components = [
    defineIonApp, defineIonHeader, defineIonToolbar, defineIonTitle, defineIonContent, defineIonFooter,
    defineIonButtons, defineIonBackButton, defineIonRouter, defineIonRoute, defineIonRouterOutlet, defineIonMenu, defineIonMenuButton,
    defineIonInput, defineIonTextarea, defineIonCheckbox, defineIonToggle, defineIonSelect, defineIonSelectOption, defineIonRadio, defineIonRadioGroup, defineIonRange, defineIonSearchbar,
    defineIonList, defineIonListHeader, defineIonItem, defineIonItemDivider, defineIonItemSliding, defineIonItemOptions, defineIonItemOption, defineIonLabel, defineIonNote,
    defineIonCard, defineIonCardHeader, defineIonCardTitle, defineIonCardSubtitle, defineIonCardContent,
    defineIonSpinner, defineIonProgressBar, defineIonSkeletonText, defineIonBadge, defineIonAvatar, defineIonThumbnail,
    defineIonButton, defineIonFab, defineIonFabButton, defineIonFabList, defineIonRippleEffect,
    defineIonModal, defineIonPopover, defineIonToast, defineIonAlert,
    defineIonIcon
  ];

  for (let i = 0; i < components.length; i++) {
    const def = components[i];
    def();
  }

  // Registrar iconos críticos
  addIcons({
    'arrow-back': arrowBack,
    'arrow-back-sharp': arrowBackSharp,
    'chevron-back': chevronBack,
    'chevron-back-sharp': chevronBackSharp
  });

  isInitialized = true;
}

export { addIcons };