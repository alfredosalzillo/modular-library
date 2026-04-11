import { type GlobOptions, globSync } from "node:fs";
import path from "node:path";

const isString = (value: unknown): value is string => typeof value === "string";
const outputFileName = (filePath: string) =>
  filePath.replace(/\.[^/.]+$/, "").replace(/\\/g, "/");

export type CreateEntryInput = string | string[] | Record<string, string>;
type CreateEntriesGlobOptions = GlobOptions;

export type CreateEntriesOptions = {
  glob?: CreateEntriesGlobOptions;
  relative?: string;
  transformOutputPath?: (path: string, fileName: string) => string;
};

const defaultOptions = {
  relative: `src/`,
};
const createEntries = (
  input: CreateEntryInput,
  options?: CreateEntriesOptions,
) => {
  // flat to enable input to be a string or an array
  const inputs = [input].flat();
  // separate globs inputs string from others to enable input to be a mixed array too
  const globs = inputs.filter((value) => isString(value));
  const others = inputs.filter((value) => !isString(value));
  const normalizedGlobs = globs.map((glob) => glob.replace(/\\/g, "/"));

  // get files from the strings and return as entries Object
  const entries = globSync(normalizedGlobs, {
    ...options?.glob,
    withFileTypes: true,
  })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => {
      const name = path.join(dirent.parentPath, dirent.name);
      const filePath = path.relative(
        options?.relative ?? defaultOptions.relative,
        name,
      );
      const isRelative = !filePath.startsWith(`../`);
      const relativeFilePath = isRelative
        ? filePath
        : path.relative(`./`, name);
      return [
        outputFileName(
          options?.transformOutputPath
            ? options.transformOutputPath(relativeFilePath, name)
            : relativeFilePath,
        ),
        name,
      ];
    });
  return Object.assign(
    {},
    Object.fromEntries(entries),
    // add no globs input to the result
    ...others,
  );
};

export default createEntries;
