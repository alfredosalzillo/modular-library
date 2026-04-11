import type { InputOptions } from "rolldown";
import modularLibrary from "./plugin";

const expectedOutput = ["fixture/input1", "fixture/input2"].sort();

const applyOptions = (
  options: InputOptions,
  pluginOptions?: Parameters<typeof modularLibrary>[0],
) => {
  const plugin = modularLibrary(pluginOptions);
  if (!plugin.options) {
    throw new Error("options hook is required");
  }

  const context = {
    warn: vi.fn(),
  };

  const result = plugin.options.call(context as never, options);
  return {
    result,
    warn: context.warn,
  };
};

describe("modular-library/rolldown", () => {
  it("should have name modular-library/rolldown", () => {
    const plugin = modularLibrary({ relative: "./test" });
    expect(plugin.name).toBe("modular-library/rolldown");
  });

  it("should resolve glob", () => {
    const { result } = applyOptions(
      {
        input: ["test/fixture/**/*.js"],
      },
      { relative: "./test" },
    );

    expect(Object.keys(result.input as Record<string, string>).sort()).toEqual(
      expectedOutput,
    );
  });

  it("should accept a simple string as input", () => {
    const { result } = applyOptions(
      {
        input: "test/fixture/**/*.js",
      },
      { relative: "./test" },
    );

    expect(Object.keys(result.input as Record<string, string>).sort()).toEqual(
      expectedOutput,
    );
  });

  it("should accept an array of strings as input", () => {
    const { result } = applyOptions(
      {
        input: ["test/fixture/**/*.js"],
      },
      { relative: "./test" },
    );

    expect(Object.keys(result.input as Record<string, string>).sort()).toEqual(
      expectedOutput,
    );
  });

  it("should remove unresolved glob", () => {
    const { result } = applyOptions(
      {
        input: ["test/fixture/**/*.js", "/not-found/file.js"],
      },
      { relative: "./test" },
    );

    expect(Object.keys(result.input as Record<string, string>).sort()).toEqual(
      expectedOutput,
    );
  });

  it("should resolve relative to src as default", () => {
    const { result: outputFilesWithNoOptions } = applyOptions({
      input: ["test/fixture/**/*.js"],
    });
    const { result: outputFilesWithNoRelativeOption } = applyOptions(
      {
        input: ["./test/fixture/**/*.js"],
      },
      {},
    );

    expect(
      Object.keys(
        outputFilesWithNoOptions.input as Record<string, string>,
      ).sort(),
    ).toEqual(["test/fixture/input1", "test/fixture/input2"]);
    expect(
      Object.keys(
        outputFilesWithNoRelativeOption.input as Record<string, string>,
      ).sort(),
    ).toEqual(["test/fixture/input1", "test/fixture/input2"]);
  });

  it("should resolve output with transformOutputPath option", () => {
    const { result } = applyOptions(
      {
        input: ["test/fixture/**/*.js"],
      },
      {
        transformOutputPath: (output) => `dest/${output.split("/").at(-1)}`,
      },
    );

    expect(Object.keys(result.input as Record<string, string>).sort()).toEqual([
      "dest/input1",
      "dest/input2",
    ]);
  });

  it("should warn when input is missing", () => {
    const { result, warn } = applyOptions({}, { relative: "./test" });

    expect(warn).toHaveBeenCalledWith("At least one input is required");
    expect(result).toEqual({});
  });
});
