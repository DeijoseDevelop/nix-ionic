/**
 * Feedback bundle — progress, loading, and status indicators.
 *
 * Includes: ion-spinner, ion-progress-bar, ion-skeleton-text,
 *           ion-badge, ion-avatar, ion-thumbnail
 */
import type { ComponentDefiner } from "../setup";

import { defineCustomElement as defineIonSpinner } from "@ionic/core/components/ion-spinner.js";
import { defineCustomElement as defineIonProgressBar } from "@ionic/core/components/ion-progress-bar.js";
import { defineCustomElement as defineIonSkeletonText } from "@ionic/core/components/ion-skeleton-text.js";
import { defineCustomElement as defineIonBadge } from "@ionic/core/components/ion-badge.js";
import { defineCustomElement as defineIonAvatar } from "@ionic/core/components/ion-avatar.js";
import { defineCustomElement as defineIonThumbnail } from "@ionic/core/components/ion-thumbnail.js";

export const feedbackComponents: ComponentDefiner[] = [
  defineIonSpinner,
  defineIonProgressBar,
  defineIonSkeletonText,
  defineIonBadge,
  defineIonAvatar,
  defineIonThumbnail,
];
