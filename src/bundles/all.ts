/**
 * All components bundle — convenience re-export of every bundle.
 *
 * Use this to register ALL components at once (same behavior as v0.2.x):
 * ```ts
 * import { setupNixIonic } from "@deijose/nix-ionic";
 * import { allComponents } from "@deijose/nix-ionic/bundles/all";
 *
 * setupNixIonic({ components: allComponents });
 * ```
 */
import type { ComponentDefiner } from "../setup";

import { layoutComponents } from "./layout";
import { navigationComponents } from "./navigation";
import { formComponents } from "./forms";
import { listComponents } from "./lists";
import { feedbackComponents } from "./feedback";
import { buttonComponents } from "./buttons";
import { overlayComponents } from "./overlays";

export const allComponents: ComponentDefiner[] = [
  ...layoutComponents,
  ...navigationComponents,
  ...formComponents,
  ...listComponents,
  ...feedbackComponents,
  ...buttonComponents,
  ...overlayComponents,
];
