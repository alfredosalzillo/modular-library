import type { Plugin } from "rollup";
import createEntries, { type CreateEntriesOptions } from "@/createEntries";

const pluginName = "modular-library/rollup";

export type RollupModularLibraryOptions = CreateEntriesOptions;

/**
 *  modularLibrary is a rollup plugin to use multiple entry point and preserve the directory
 *  structure in the dist folder
 * */
const rollupModularLibrary = (
  options?: RollupModularLibraryOptions,
): Plugin => {
  return {
    name: pluginName,
    buildStart() {},
    options(conf) {
      if (!conf.input) {
        if (this.warn) {
          this.warn("At least one input is required");
        }
        return conf;
      }
      const input = createEntries(conf.input, options);
      return {
        ...conf,
        input,
      };
    },
  };
};

export default rollupModularLibrary;
