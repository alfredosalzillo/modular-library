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
        "rolldown/index": resolve(__dirname, "src/rolldown/index.ts"),
        "rollup/index": resolve(__dirname, "src/rollup/index.ts"),
        "vite/index": resolve(__dirname, "src/vite/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rolldownOptions: {
      output: {
        chunkFileNames: "chunks/[name].js",
      },
      external: ["node:path", "node:fs"],
    },
  },
});
