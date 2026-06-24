import { describe, it, expect } from "vitest";
import * as components from "../components.js";

describe("components re-exports", () => {
    it("exports every component definer", () => {
        const expected = [
            "defineIonHeader",
            "defineIonToolbar",
            "defineIonTitle",
            "defineIonContent",
            "defineIonFooter",
            "defineIonButtons",
            "defineIonMenu",
            "defineIonMenuButton",
            "defineIonTabs",
            "defineIonTab",
            "defineIonTabBar",
            "defineIonTabButton",
            "defineIonInput",
            "defineIonTextarea",
            "defineIonCheckbox",
            "defineIonToggle",
            "defineIonSelect",
            "defineIonSelectOption",
            "defineIonRadio",
            "defineIonRadioGroup",
            "defineIonRange",
            "defineIonSearchbar",
            "defineIonList",
            "defineIonListHeader",
            "defineIonItem",
            "defineIonItemDivider",
            "defineIonItemSliding",
            "defineIonItemOptions",
            "defineIonItemOption",
            "defineIonLabel",
            "defineIonNote",
            "defineIonCard",
            "defineIonCardHeader",
            "defineIonCardTitle",
            "defineIonCardSubtitle",
            "defineIonCardContent",
            "defineIonSpinner",
            "defineIonProgressBar",
            "defineIonSkeletonText",
            "defineIonBadge",
            "defineIonAvatar",
            "defineIonThumbnail",
            "defineIonButton",
            "defineIonFab",
            "defineIonFabButton",
            "defineIonFabList",
            "defineIonRippleEffect",
            "defineIonModal",
            "defineIonPopover",
            "defineIonToast",
            "defineIonAlert",
        ];
        for (const name of expected) {
            expect(typeof (components as any)[name]).toBe("function");
        }
    });

    it("each definer returns a function", () => {
        for (const [name, fn] of Object.entries(components)) {
            if (name.startsWith("define")) {
                expect(typeof fn).toBe("function");
            }
        }
    });
});
