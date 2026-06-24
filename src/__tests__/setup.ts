import { cleanup } from "@deijose/nix-js-testing";
import { afterEach } from "vitest";

afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    history.replaceState(null, "", "/");
});
