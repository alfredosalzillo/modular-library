import type { Plugin } from "vite";
import createEntries, { type CreateEntriesOptions } from "@/createEntries";

const pluginName = "modular-library/vite";

export type ViteModularLibraryOptions = CreateEntriesOptions;

/**
 * viteModularLibrary is a vite plugin to use multiple entry points and preserve the directory
 * structure in the dist folder
 */
const viteModularLibrary = (options?: ViteModularLibraryOptions): Plugin => {
  return {
    name: pluginName,
    apply: "build",
    config(config) {
      if (!config.build?.lib) {
        if (this.warn) {
          this.warn("The build.lib option is required");
        }
        return config;
      }
      const entry = config.build?.lib?.entry;

      if (!entry) {
        if (this.warn) {
          this.warn("At least one entry is required");
        }

        return config;
      }

      config.build.lib.entry = createEntries(entry, options);

      return config;
    },
  };
};

export default viteModularLibrary;
