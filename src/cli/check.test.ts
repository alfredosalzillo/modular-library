import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { validatePackageExports } from "@/cli/check";

const createTempDir = () =>
  mkdtempSync(path.join(tmpdir(), "modular-library-"));

const writeJson = (filePath: string, data: unknown) => {
  writeFileSync(filePath, JSON.stringify(data, null, 2));
};

describe("validatePackageExports", () => {
  it("should validate when all exports exist", () => {
    const root = createTempDir();
    try {
      const distDir = path.join(root, "dist");
      mkdirSync(path.join(distDir, "vite"), { recursive: true });
      writeFileSync(path.join(distDir, "vite", "index.js"), "");
      writeFileSync(path.join(distDir, "vite", "index.d.ts"), "");

      writeJson(path.join(root, "package.json"), {
        exports: {
          "./vite": {
            import: "./dist/vite/index.js",
            types: "./dist/vite/index.d.ts",
          },
        },
      });

      const output = validatePackageExports({
        packageJsonPath: path.join(root, "package.json"),
        outDir: distDir,
      });

      expect(output.valid).toBe(true);
      expect(output.issues).toHaveLength(0);
      expect(output.checked).toBe(2);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("should report missing files", () => {
    const root = createTempDir();
    try {
      const distDir = path.join(root, "dist");
      mkdirSync(path.join(distDir, "vite"), { recursive: true });
      writeFileSync(path.join(distDir, "vite", "index.js"), "");

      writeJson(path.join(root, "package.json"), {
        exports: {
          "./vite": {
            import: "./dist/vite/index.js",
            types: "./dist/vite/index.d.ts",
          },
        },
      });

      const output = validatePackageExports({
        packageJsonPath: path.join(root, "package.json"),
        outDir: distDir,
      });

      expect(output.valid).toBe(false);
      expect(output.issues).toHaveLength(1);
      expect(output.issues[0]?.reason).toBe("file-not-found");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("should report targets outside of out-dir", () => {
    const root = createTempDir();
    try {
      const distDir = path.join(root, "dist");
      mkdirSync(path.join(root, "other"), { recursive: true });
      writeFileSync(path.join(root, "other", "index.js"), "");

      writeJson(path.join(root, "package.json"), {
        exports: {
          "./other": "./other/index.js",
        },
      });

      const output = validatePackageExports({
        packageJsonPath: path.join(root, "package.json"),
        outDir: distDir,
      });

      expect(output.valid).toBe(false);
      expect(output.issues).toHaveLength(1);
      expect(output.issues[0]?.reason).toBe("outside-out-dir");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
