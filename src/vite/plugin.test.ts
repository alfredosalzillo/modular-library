import type { UserConfig } from "vite";
import modularLibrary from "./plugin";

const expectedOutput = ["fixture/input1", "fixture/input2"].sort();

const applyConfig = (
  config: UserConfig,
  pluginOptions?: Parameters<typeof modularLibrary>[0],
) => {
  const plugin = modularLibrary(pluginOptions);
  if (!plugin.config) {
    throw new Error("config hook is required");
  }

  const context = {
    warn: vi.fn(),
  };

  // @ts-expect-error
  const result = plugin.config.call(context as never, config);
  return {
    result,
    warn: context.warn,
  };
};

describe("modular-library/vite", () => {
  it("should have name modular-library/vite", () => {
    const plugin = modularLibrary({ relative: "./test" });
    expect(plugin.name).toBe("modular-library/vite");
    expect(plugin.apply).toBe("build");
  });

  it("should warn when build.lib is missing", () => {
    const { result, warn } = applyConfig({});

    expect(warn).toHaveBeenCalledWith("The build.lib option is required");
    expect(result).toEqual({});
  });

  it("should warn when build.lib.entry is missing", () => {
    const { result, warn } = applyConfig({
      build: {
        // @ts-expect-error
        lib: {},
      },
    });

    expect(warn).toHaveBeenCalledWith("At least one entry is required");
    expect(result).toEqual({
      build: {
        lib: {},
      },
    });
  });

  it("should resolve glob", () => {
    const { result } = applyConfig(
      {
        build: {
          lib: {
            entry: ["test/fixture/**/*.js"],
          },
        },
      },
      { relative: "./test" },
    );

    expect(
      Object.keys(
        (result.build?.lib as { entry: Record<string, string> }).entry,
      ).sort(),
    ).toEqual(expectedOutput);
  });

  it("should accept a simple string as input", () => {
    const { result } = applyConfig(
      {
        build: {
          lib: {
            entry: "test/fixture/**/*.js",
          },
        },
      },
      { relative: "./test" },
    );

    expect(
      Object.keys(
        (result.build?.lib as { entry: Record<string, string> }).entry,
      ).sort(),
    ).toEqual(expectedOutput);
  });

  it("should accept an array of strings as input", () => {
    const { result } = applyConfig(
      {
        build: {
          lib: {
            entry: ["test/fixture/**/*.js"],
          },
        },
      },
      { relative: "./test" },
    );

    expect(
      Object.keys(
        (result.build?.lib as { entry: Record<string, string> }).entry,
      ).sort(),
    ).toEqual(expectedOutput);
  });

  it("should remove unresolved glob", () => {
    const { result } = applyConfig(
      {
        build: {
          lib: {
            entry: ["test/fixture/**/*.js", "/not-found/file.js"],
          },
        },
      },
      { relative: "./test" },
    );

    expect(
      Object.keys(
        (result.build?.lib as { entry: Record<string, string> }).entry,
      ).sort(),
    ).toEqual(expectedOutput);
  });

  it("should resolve relative to src as default", () => {
    const { result: outputFilesWithNoOptions } = applyConfig({
      build: {
        lib: {
          entry: ["test/fixture/**/*.js"],
        },
      },
    });
    const { result: outputFilesWithNoRelativeOption } = applyConfig(
      {
        build: {
          lib: {
            entry: ["./test/fixture/**/*.js"],
          },
        },
      },
      {},
    );

    expect(
      Object.keys(
        (
          outputFilesWithNoOptions.build?.lib as {
            entry: Record<string, string>;
          }
        ).entry,
      ).sort(),
    ).toEqual(["test/fixture/input1", "test/fixture/input2"]);
    expect(
      Object.keys(
        (
          outputFilesWithNoRelativeOption.build?.lib as {
            entry: Record<string, string>;
          }
        ).entry,
      ).sort(),
    ).toEqual(["test/fixture/input1", "test/fixture/input2"]);
  });

  it("should resolve output with transformOutputPath option", () => {
    const { result } = applyConfig(
      {
        build: {
          lib: {
            entry: ["test/fixture/**/*.js"],
          },
        },
      },
      {
        transformOutputPath: (output) => `dest/${output.split("/").at(-1)}`,
      },
    );

    expect(
      Object.keys(
        (result.build?.lib as { entry: Record<string, string> }).entry,
      ).sort(),
    ).toEqual(["dest/input1", "dest/input2"]);
  });
});
