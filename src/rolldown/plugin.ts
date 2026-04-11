import type { Plugin } from "rolldown";
import createEntries, { type CreateEntriesOptions } from "@/createEntries";

const pluginName = "modular-library/rolldown";

export type RolldownModularLibraryOptions = CreateEntriesOptions;

/**
 * rolldownModularLibrary is a rolldown plugin to use multiple entry points and preserve the directory
 * structure in the dist folder
 */
const rolldownModularLibrary = (
  options?: RolldownModularLibraryOptions,
): Plugin => {
  return {
    name: pluginName,
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

export default rolldownModularLibrary;
