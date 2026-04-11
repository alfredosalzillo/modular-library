import { rollup, RollupOptions } from "rollup";
import importJson from "@rollup/plugin-json";
import path from "node:path";
import modularLibrary from "./plugin";

const expectedOutput = ["fixture/input1.js", "fixture/input2.js"].sort();

const externalDependencies = ["node:fs", "path"];

describe.each([
  ["rollup 4", rollup],
])("modular-library/rollup using %s", (_, rollup) => {
  const generateBundle = (options: RollupOptions) =>
    rollup(options).then((bundle) =>
      bundle.generate({
        format: "cjs",
      }),
    );

  const generateOutputFileNames = (options: RollupOptions) =>
    generateBundle(options).then(({ output }) =>
      output.map((module) => module.fileName).sort(),
    );

  it("should have name modular-library/rollup", async () => {
    const plugin = modularLibrary({ relative: "./test" });
    expect("name" in plugin).toBeTruthy();
    expect(plugin.name).toBe("modular-library/rollup");
  });
  it("should resolve glob", async () => {
    const outputFiles = await generateOutputFileNames({
      input: ["test/fixture/**/*.js"],
      plugins: [modularLibrary({ relative: "./test" })],
    });
    expect(outputFiles).toEqual(expectedOutput);
  });
  it("should accept a simple string as input", async () => {
    const outputFiles = await generateOutputFileNames({
      input: "test/fixture/**/*.js",
      plugins: [modularLibrary({ relative: "./test" })],
    });
    expect(outputFiles).toEqual(expectedOutput);
  });
  it("should accept an array of strings as input", async () => {
    const outputFiles = await generateOutputFileNames({
      input: ["test/fixture/**/*.js"],
      plugins: [modularLibrary({ relative: "./test" })],
    });
    expect(outputFiles).toEqual(expectedOutput);
  });
  it("should remove unresolved glob", async () => {
    const outputFiles = await generateOutputFileNames({
      input: ["test/fixture/**/*.js", "/not-found/file.js"],
      plugins: [modularLibrary({ relative: "./test" })],
    });
    expect(outputFiles).toEqual(expectedOutput);
  });
  it("should preserve no string entries", async () => {
    const bundle = generateBundle({
      input: [
        "test/fixture/**/*.js",
        // @ts-expect-error
        {
          test: "path/to/test.js",
        },
      ],
      plugins: [modularLibrary({ relative: "./test" })],
    });
    await expect(bundle).rejects.toThrow(/^Could not resolve entry module/);
  });
  it('should resolve relative to "src" as default', async () => {
    const outputFilesWithNoOptions = await generateOutputFileNames({
      input: ["test/fixture/**/*.js"],
      plugins: [modularLibrary(), importJson()],
      external: externalDependencies,
    });
    const outputFilesWithNoRelativeOption = await generateOutputFileNames({
      input: ["./test/fixture/**/*.js"],
      plugins: [modularLibrary({}), importJson()],
      external: externalDependencies,
    });
    expect(outputFilesWithNoOptions).toEqual([
      "test/fixture/input1.js",
      "test/fixture/input2.js",
    ]);
    expect(outputFilesWithNoRelativeOption).toEqual([
      "test/fixture/input1.js",
      "test/fixture/input2.js",
    ]);
  });
  it('should resolve non relative to "relative" options path to root', async () => {
    const outputFiles = await generateOutputFileNames({
      input: ["test/fixture/**/*.js"],
      plugins: [modularLibrary(), importJson()],
      external: ["node:fs", "path"],
    });
    expect(outputFiles).toEqual([
      "test/fixture/input1.js",
      "test/fixture/input2.js",
    ]);
  });
  it('should resolve output to "dist" directory', async () => {
    const outputFiles = await generateOutputFileNames({
      input: ["test/fixture/**/*.js"],
      plugins: [
        modularLibrary({
          transformOutputPath: (output) => `dest/${path.basename(output)}`,
        }),
      ],
      external: ["node:fs", "path"],
    });
    expect(outputFiles).toEqual(["dest/input1.js", "dest/input2.js"]);
  });
});
