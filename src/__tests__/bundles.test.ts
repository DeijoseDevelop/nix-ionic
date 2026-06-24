import { describe, it, expect } from "vitest";
import { layoutComponents } from "../bundles/layout.js";
import { navigationComponents } from "../bundles/navigation.js";
import { formComponents } from "../bundles/forms.js";
import { listComponents } from "../bundles/lists.js";
import { feedbackComponents } from "../bundles/feedback.js";
import { buttonComponents } from "../bundles/buttons.js";
import { overlayComponents } from "../bundles/overlays.js";
import { allComponents } from "../bundles/all.js";

describe("component bundles", () => {
    it("layoutComponents contains expected definers", () => {
        expect(layoutComponents.length).toBe(6);
        expect(layoutComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("navigationComponents contains expected definers", () => {
        expect(navigationComponents.length).toBe(7);
        expect(navigationComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("formComponents contains expected definers", () => {
        expect(formComponents.length).toBe(10);
        expect(formComponents.every((fn) => typeof fn === "function")).toBe(true);
    });

    it("listComponents contains expected definers", () => {
        expect(listComponents.length).toBe(14);
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
        expect(overlayComponents.length).toBe(4);
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
        expect(allComponents.length).toBe(52);
    });
});
