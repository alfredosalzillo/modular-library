import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { runCli } from "@/cli";

const createWriter = () => {
  const chunks: string[] = [];
  return {
    write: (value: string) => {
      chunks.push(value);
      return true;
    },
    value: () => chunks.join(""),
  };
};

const createTempDir = () =>
  mkdtempSync(path.join(tmpdir(), "modular-library-"));

describe("runCli", () => {
  it("should return 0 for help", () => {
    const stdout = createWriter();
    const stderr = createWriter();

    const exitCode = runCli(["--help"], { stdout, stderr });

    expect(exitCode).toBe(0);
    expect(stdout.value()).toContain(
      "Usage: modular-library [options] [command]",
    );
    expect(stderr.value()).toBe("");
  });

  it("should return 1 for unknown command", () => {
    const stdout = createWriter();
    const stderr = createWriter();

    const exitCode = runCli(["unknown"], { stdout, stderr });

    expect(exitCode).toBe(1);
    expect(stderr.value()).toContain("unknown command");
  });

  it("should validate package exports with check command", () => {
    const root = createTempDir();
    try {
      const distDir = path.join(root, "dist", "vite");
      mkdirSync(distDir, { recursive: true });
      writeFileSync(path.join(distDir, "index.js"), "");

      writeFileSync(
        path.join(root, "package.json"),
        JSON.stringify(
          {
            exports: {
              "./vite": {
                import: "./dist/vite/index.js",
              },
            },
          },
          null,
          2,
        ),
      );

      const stdout = createWriter();
      const stderr = createWriter();
      const exitCode = runCli(["check"], { stdout, stderr, cwd: root });

      expect(exitCode).toBe(0);
      expect(stdout.value()).toContain("All exports are valid");
      expect(stderr.value()).toBe("");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
