import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
    plugins: [
        dts({
            tsconfigPath: "./tsconfig.lib.json",
            rollupTypes: true,
            insertTypesEntry: true,
        }),
    ],

    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "NixIonic",
            fileName: "index",
            formats: ["es", "cjs"],
        },
        rollupOptions: {
            external: ["@deijose/nix-js"],
            output: {
                globals: {
                    "@deijose/nix-js": "NixJs",
                },
            },
        },
        // No minificar: la lib la bundlea el proyecto del usuario
        minify: false,
        sourcemap: true,
    },
    test: {
        environment: "happy-dom",
    },
});