import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@ionic/core/components", () => ({
    initialize: vi.fn(),
}));

vi.mock("@ionic/core/components/ion-app.js", () => ({
    defineCustomElement: vi.fn(() => {
        if (!customElements.get("ion-app")) {
            customElements.define("ion-app", class extends HTMLElement { });
        }
    }),
}));

vi.mock("@ionic/core/components/ion-router-outlet.js", () => ({
    defineCustomElement: vi.fn(() => {
        if (!customElements.get("ion-router-outlet")) {
            customElements.define("ion-router-outlet", class extends HTMLElement { });
        }
    }),
}));

vi.mock("@ionic/core/components/ion-back-button.js", () => ({
    defineCustomElement: vi.fn(() => {
        if (!customElements.get("ion-back-button")) {
            customElements.define("ion-back-button", class extends HTMLElement { });
        }
    }),
}));

vi.mock("ionicons/components/ion-icon.js", () => ({
    defineCustomElement: vi.fn(() => {
        if (!customElements.get("ion-icon")) {
            customElements.define("ion-icon", class extends HTMLElement { });
        }
    }),
}));

vi.mock("ionicons", () => ({
    addIcons: vi.fn(),
}));

vi.mock("ionicons/icons", () => ({
    arrowBack: "arrowBackIcon",
    arrowBackSharp: "arrowBackSharpIcon",
    chevronBack: "chevronBackIcon",
    chevronBackSharp: "chevronBackSharpIcon",
}));

import { addIcons as mockAddIcons } from "ionicons";

describe("setupNixIonic", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        delete (window as any).ionicons;
        vi.resetModules();
    });

    async function loadSetup() {
        const mod = await import("../setup.js");
        return { setupNixIonic: mod.setupNixIonic, exportedAddIcons: mod.addIcons };
    }

    it("initializes Ionic with default icon asset path", async () => {
        const { setupNixIonic } = await loadSetup();
        setupNixIonic();
        expect((window as any).ionicons.assets).toBe("https://unpkg.com/ionicons@latest/dist/ionicons/svg/");
    });

    it("uses custom icon asset path", async () => {
        const { setupNixIonic } = await loadSetup();
        setupNixIonic({ iconAssetPath: "/assets/icons/" });
        expect((window as any).ionicons.assets).toBe("/assets/icons/");
    });

    it("registers core components and adds default icons", async () => {
        const { setupNixIonic } = await loadSetup();
        setupNixIonic();
        expect(mockAddIcons).toHaveBeenCalledWith(
            expect.objectContaining({
                "arrow-back": "arrowBackIcon",
                "arrow-back-sharp": "arrowBackSharpIcon",
                "chevron-back": "chevronBackIcon",
                "chevron-back-sharp": "chevronBackSharpIcon",
            }),
        );
    });

    it("registers extra components and merges icons", async () => {
        const { setupNixIonic } = await loadSetup();
        const customComponent = vi.fn();
        setupNixIonic({ components: [customComponent], icons: { home: "homeIcon" } });
        expect(customComponent).toHaveBeenCalled();
        expect(mockAddIcons).toHaveBeenCalledWith(
            expect.objectContaining({
                home: "homeIcon",
                "arrow-back": "arrowBackIcon",
            }),
        );
    });

    it("is idempotent", async () => {
        const { setupNixIonic } = await loadSetup();
        setupNixIonic();
        setupNixIonic();
        setupNixIonic();
        expect(mockAddIcons).toHaveBeenCalledTimes(1);
    });

    it("re-exports addIcons", async () => {
        const { setupNixIonic, exportedAddIcons } = await loadSetup();
        setupNixIonic();
        expect(exportedAddIcons).toBe(mockAddIcons);
    });
});

