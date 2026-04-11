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
      beforeWriteFile: (filePath, content) => ({
        filePath: filePath.replace(/([\\/])dist\1src\1/, "$1dist$1"),
        content,
      }),
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
      },
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
      },
      external: [],
    },
  },
});
