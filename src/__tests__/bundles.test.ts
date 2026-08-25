import { describe, it, expect } from "vitest";
import { layoutComponents } from "../bundles/layout.js";
import { navigationComponents } from "../bundles/navigation.js";
import { formComponents } from "../bundles/forms.js";
import { listComponents } from "../bundles/lists.js";
import { feedbackComponents } from "../bundles/feedback.js";
import { buttonComponents } from "../bundles/buttons.js";
import { overlayComponents } from "../bundles/overlays.js";
import { allComponents } from "../bundles/all.js";
import {
    COMPONENT_MANIFEST,
    getComponentsByCategory,
    getAllSupportedTags,
    isSupportedTag,
    getDependencyChain,
    tagToSubpath,
    tagToDefinerName,
} from "../components/manifest.js";

describe("component bundles", () => {
    it("layoutComponents contains expected definers", () => {
        expect(layoutComponents.length).toBe(13);
        expect(layoutComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("navigationComponents contains expected definers", () => {
        expect(navigationComponents.length).toBe(11);
        expect(navigationComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("formComponents contains expected definers", () => {
        expect(formComponents.length).toBe(20);
        expect(formComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("listComponents contains expected definers", () => {
        expect(listComponents.length).toBe(29);
        expect(listComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("feedbackComponents contains expected definers", () => {
        expect(feedbackComponents.length).toBe(6);
        expect(feedbackComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("buttonComponents contains expected definers", () => {
        expect(buttonComponents.length).toBe(5);
        expect(buttonComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("overlayComponents contains expected definers", () => {
        expect(overlayComponents.length).toBe(9);
        expect(overlayComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("allComponents combines all bundles", () => {
        const expected =
            layoutComponents.length +
            navigationComponents.length +
            formComponents.length +
            listComponents.length +
            feedbackComponents.length +
            buttonComponents.length +
            overlayComponents.length;
        expect(allComponents.length).toBe(expected);
        expect(allComponents.every((fn) => typeof fn === "function")).toBe(true);
        expect(allComponents.length).toBe(93);
    });
});

describe("component manifest", () => {
    it("contains entries for all supported Ionic 8 tags", () => {
        expect(COMPONENT_MANIFEST.length).toBeGreaterThan(80);
    });

    it("every non-legacy entry has a valid tag and import path", () => {
        for (const entry of COMPONENT_MANIFEST) {
            expect(entry.tag).toMatch(/^ion-[a-z-]+$/);
            expect(entry.importPath).toMatch(/^ion-[a-z-]+\.js$/);
            expect(entry.minIonicMajor).toBe(8);
        }
    });

    it("getComponentByTag returns the right entry", () => {
        const button = COMPONENT_MANIFEST.find((e) => e.tag === "ion-button");
        expect(button).toBeDefined();
        expect(button?.category).toBe("buttons");
    });

    it("getComponentsByCategory returns non-legacy entries only", () => {
        const legacy = getComponentsByCategory("routing-legacy" as any);
        // routing-legacy is filtered out by getComponentsByCategory
        expect(legacy.length).toBe(0);
    });

    it("isSupportedTag returns true for non-legacy tags", () => {
        expect(isSupportedTag("ion-button")).toBe(true);
        expect(isSupportedTag("ion-router")).toBe(false); // legacy
        expect(isSupportedTag("ion-nonexistent")).toBe(false);
    });

    it("getDependencyChain resolves recursively", () => {
        // ion-col depends on ion-grid and ion-row
        const deps = getDependencyChain("ion-col");
        expect(deps).toContain("ion-grid");
        expect(deps).toContain("ion-row");
    });

    it("tagToSubpath strips ion- prefix", () => {
        expect(tagToSubpath("ion-button")).toBe("button");
        expect(tagToSubpath("ion-datetime-button")).toBe("datetime-button");
    });

    it("tagToDefinerName converts to PascalCase", () => {
        expect(tagToDefinerName("ion-button")).toBe("defineIonButton");
        expect(tagToDefinerName("ion-datetime-button")).toBe("defineIonDatetimeButton");
        expect(tagToDefinerName("ion-action-sheet")).toBe("defineIonActionSheet");
    });

    it("getAllSupportedTags excludes legacy", () => {
        const tags = getAllSupportedTags();
        expect(tags).toContain("ion-button");
        expect(tags).not.toContain("ion-router");
        expect(tags).not.toContain("ion-route");
    });

    it("manifest includes previously missing components", () => {
        const tags = getAllSupportedTags();
        for (const tag of [
            "ion-action-sheet",
            "ion-loading",
            "ion-picker",
            "ion-datetime",
            "ion-datetime-button",
            "ion-grid",
            "ion-row",
            "ion-col",
            "ion-chip",
            "ion-text",
            "ion-accordion",
            "ion-accordion-group",
            "ion-breadcrumb",
            "ion-breadcrumbs",
            "ion-infinite-scroll",
            "ion-refresher",
            "ion-reorder",
            "ion-segment",
            "ion-segment-button",
            "ion-split-pane",
            "ion-menu-toggle",
            "ion-nav",
            "ion-nav-link",
        ]) {
            expect(tags).toContain(tag);
        }
    });
});
