import { globSync, readFileSync } from "node:fs";
import path from "node:path";

interface ExportObject {
  [key: string]: ExportValue;
}

type ExportValue = string | ExportObject;

type PackageJson = {
  exports?: Record<string, ExportValue> | ExportValue;
};

export type ExportValidationIssue = {
  exportPath: string;
  condition: string | null;
  target: string;
  resolvedTarget: string;
  reason: "invalid-target" | "outside-out-dir" | "file-not-found";
};

export type ValidateExportsInput = {
  packageJsonPath: string;
  outDir: string;
};

type ExportTarget = {
  exportPath: string;
  condition: string | null;
  target: string;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const collectTargets = (
  value: ExportValue,
  exportPath: string,
  conditions: string[] = [],
): ExportTarget[] => {
  if (typeof value === "string") {
    return [
      {
        exportPath,
        condition: conditions.length > 0 ? conditions.join(".") : null,
        target: value,
      },
    ];
  }

  return Object.entries(value).flatMap(([key, nested]) => {
    if (typeof nested === "string" || isPlainObject(nested)) {
      return collectTargets(nested as ExportValue, exportPath, [
        ...conditions,
        key,
      ]);
    }

    return [];
  });
};

const getExportTargets = (
  exportsField: PackageJson["exports"],
): ExportTarget[] => {
  if (!exportsField) {
    return [];
  }

  if (typeof exportsField === "string" || isPlainObject(exportsField)) {
    if (typeof exportsField === "string") {
      return collectTargets(exportsField, ".");
    }

    const values = Object.values(exportsField);
    const isRootConditions = values.every(
      (value) => typeof value === "string" || isPlainObject(value),
    );

    if (
      isRootConditions &&
      Object.keys(exportsField).every((key) => !key.startsWith("."))
    ) {
      return collectTargets(exportsField as ExportValue, ".");
    }

    return Object.entries(exportsField).flatMap(([key, value]) => {
      if (typeof value === "string" || isPlainObject(value)) {
        return collectTargets(value as ExportValue, key);
      }

      return [];
    });
  }

  return [];
};

export const validatePackageExports = ({
  packageJsonPath,
  outDir,
}: ValidateExportsInput) => {
  const packageContent = readFileSync(packageJsonPath, "utf8");
  const packageJson = JSON.parse(packageContent) as PackageJson;
  const packageDir = path.dirname(packageJsonPath);
  const outDirPath = path.resolve(outDir);
  const targets = getExportTargets(packageJson.exports);

  const issues: ExportValidationIssue[] = [];
  targets.forEach((target) => {
    if (!target.target.startsWith("./")) {
      issues.push({
        ...target,
        resolvedTarget: target.target,
        reason: "invalid-target",
      });
      return;
    }

    const resolvedTarget = path.resolve(packageDir, target.target);
    const relativeToOutDir = path.relative(outDirPath, resolvedTarget);
    if (
      relativeToOutDir.startsWith("..") ||
      path.isAbsolute(relativeToOutDir)
    ) {
      issues.push({
        ...target,
        resolvedTarget,
        reason: "outside-out-dir",
      });
      return;
    }

    if (globSync(resolvedTarget).length === 0) {
      issues.push({
        ...target,
        resolvedTarget,
        reason: "file-not-found",
      });
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    checked: targets.length,
  };
};
