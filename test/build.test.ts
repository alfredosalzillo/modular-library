import { build, loadConfigFromFile } from "vite";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

describe("built package", () => {
  it("loads all plugin exports and the CLI in ESM and CommonJS", async () => {
    await mkdir(path.join(projectRoot, ".ai-tmp"), { recursive: true });
    const outputDirectory = await mkdtemp(
      path.join(projectRoot, ".ai-tmp", "package-build-"),
    );

    try {
      const loadedConfig = await loadConfigFromFile(
        { command: "build", mode: "production" },
        path.join(projectRoot, "vite.config.ts"),
      );

      if (!loadedConfig) {
        throw new Error("Could not load vite.config.ts");
      }

      const plugins = loadedConfig.config.plugins
        ?.flat(Infinity)
        .filter(
          (plugin) =>
            typeof plugin !== "object" ||
            plugin === null ||
            !("name" in plugin) ||
            plugin.name !== "unplugin-dts",
        );

      await build({
        ...loadedConfig.config,
        configFile: false,
        plugins,
        build: {
          ...loadedConfig.config.build,
          outDir: path.join(outputDirectory, "dist"),
          emptyOutDir: true,
          minify: false,
        },
      });

      await writeFile(
        path.join(outputDirectory, "package.json"),
        await readFile(path.join(projectRoot, "package.json"), "utf8"),
      );

      await writeFile(
        path.join(outputDirectory, "check-esm.mjs"),
        `import assert from "node:assert/strict";
import rollup from "modular-library/rollup";
import rolldown from "modular-library/rolldown";
import vite from "modular-library/vite";

assert.equal(rollup().name, "modular-library/rollup");
assert.equal(rolldown().name, "modular-library/rolldown");
assert.equal(vite().name, "modular-library/vite");
`,
      );
      await writeFile(
        path.join(outputDirectory, "check-cjs.cjs"),
        `const assert = require("node:assert/strict");
const rollup = require("modular-library/rollup");
const rolldown = require("modular-library/rolldown");
const vite = require("modular-library/vite");

assert.equal(rollup().name, "modular-library/rollup");
assert.equal(rolldown().name, "modular-library/rolldown");
assert.equal(vite().name, "modular-library/vite");
`,
      );

      const syntaxDetectionFlag = process.allowedNodeEnvironmentFlags.has(
        "--no-experimental-detect-module",
      )
        ? ["--no-experimental-detect-module"]
        : [];
      const runNode = (...args: string[]) =>
        execFileSync(process.execPath, [...syntaxDetectionFlag, ...args], {
          cwd: outputDirectory,
          encoding: "utf8",
        });

      runNode("check-esm.mjs");
      runNode("check-cjs.cjs");
      expect(
        runNode(path.join(outputDirectory, "dist", "cli.cjs.js"), "--help"),
      ).toContain("Usage: modular-library");
    } finally {
      await rm(outputDirectory, { recursive: true, force: true });
    }
  });
});
