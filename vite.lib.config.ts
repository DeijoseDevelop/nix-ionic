import { defineConfig } from "vite";
import { resolve } from "path";

// ── Library build configuration ───────────────────────────────────────────────
//
//   npm run build:lib
//
// Produces:
//   dist/lib/nix-ionic.js    — ES module  (primary)
//   dist/lib/nix-ionic.cjs   — CommonJS   (legacy Node.js / bundlers)
//   dist/lib/*.d.ts          — Type declarations (generated separately by tsc)

export default defineConfig({
    // Do not copy the public/ folder into the library output
    publicDir: false,

    build: {
        outDir: "dist/lib",
        // vite clears the dir before building JS — tsc adds .d.ts files after
        emptyOutDir: true,
        sourcemap: true,

        lib: {
            entry: resolve("src/index.ts"),
            name: "NixIonic",
            formats: ["es", "cjs"],
            fileName: (format) => (format === "cjs" ? "nix-ionic.cjs" : "nix-ionic.js"),
        },

        rollupOptions: {
            // nix-ionic depends on nix-js
            external: ["@deijose/nix-js", /^@ionic\/core.*/],
            output: {
                // Preserve module structure for better tree-shaking in ES builds
                preserveModules: false,
                globals: {
                    "@deijose/nix-js": "NixJs",
                },
            },
        },
    },
});
