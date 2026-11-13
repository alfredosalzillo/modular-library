import react from "@vitejs/plugin-react";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [
    react(),
    dts({
      copyDtsFiles: true,
      outDirs: ["dist"],
      exclude: ["src/**/*.test.ts"],
      beforeWriteFile: (filePath, content) => ({
        filePath: filePath.replace(/([\\/])dist\1src\1/, "$1dist$1"),
        content,
      }),
    }),
  ],
  build: {
    lib: {
      entry: {
        cli: resolve(__dirname, "src/cli.ts"),
        "rolldown/index": resolve(__dirname, "src/rolldown/index.ts"),
        "rollup/index": resolve(__dirname, "src/rollup/index.ts"),
        "vite/index": resolve(__dirname, "src/vite/index.ts"),
      },
    },
    rolldownOptions: {
      output: [
        {
          format: "es",
          entryFileNames: "[name].es.mjs",
          chunkFileNames: "chunks/[name].mjs",
        },
        {
          format: "cjs",
          entryFileNames: "[name].cjs.js",
          chunkFileNames: "chunks/[name].cjs",
        },
      ],
      external: [
        "commander",
        "node:path",
        "node:fs",
        "node:process",
        "node:child_process",
        "node:events",
      ],
    },
  },
});
