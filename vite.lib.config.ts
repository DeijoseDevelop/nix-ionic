import { defineConfig } from "vite";
import { resolve } from "path";

// ── Library build configuration ───────────────────────────────────────────────
//
//   npm run build:lib
//
// Produces:
//   dist/lib/nix-ionic.js    — ES module  (primary)
//   dist/lib/nix-ionic.cjs   — CommonJS   (legacy Node.js / bundlers)
//   dist/lib/components.js   — Individual component re-exports
//   dist/lib/bundles/*.js    — Category bundles
//   dist/lib/tabs.js         — Bottom tab helpers
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
            entry: {
                "nix-ionic": resolve("src/index.ts"),
                "components": resolve("src/components.ts"),
                "bundles/layout": resolve("src/bundles/layout.ts"),
                "bundles/forms": resolve("src/bundles/forms.ts"),
                "bundles/lists": resolve("src/bundles/lists.ts"),
                "bundles/feedback": resolve("src/bundles/feedback.ts"),
                "bundles/buttons": resolve("src/bundles/buttons.ts"),
                "bundles/overlays": resolve("src/bundles/overlays.ts"),
                "bundles/navigation": resolve("src/bundles/navigation.ts"),
                "bundles/all": resolve("src/bundles/all.ts"),
                "tabs": resolve("src/tabs.ts"),
            },
            formats: ["es", "cjs"],
            fileName: (format, entryName) =>
                format === "cjs" ? `${entryName}.cjs` : `${entryName}.js`,
        },

        rollupOptions: {
            // nix-ionic depends on nix-js
            external: ["@deijose/nix-js", /^@ionic\/core.*/, /^ionicons.*/],
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
