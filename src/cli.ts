#!/usr/bin/env node
import { Command, CommanderError } from "commander";
import path from "node:path";
import {
  type ExportValidationIssue,
  validatePackageExports,
} from "@/cli/check";

type StdoutLike = Pick<typeof process.stdout, "write">;
type StderrLike = Pick<typeof process.stderr, "write">;

type RunCliOptions = {
  stdout?: StdoutLike;
  stderr?: StderrLike;
  cwd?: string;
};

const printIssue = (stderr: StderrLike, issue: ExportValidationIssue) => {
  const condition = issue.condition ? ` (${issue.condition})` : "";
  stderr.write(
    `- ${issue.exportPath}${condition}: ${issue.target} -> ${issue.reason} (${issue.resolvedTarget})\n`,
  );
};

const createProgram = ({ stdout, stderr, cwd }: Required<RunCliOptions>) => {
  const program = new Command();

  program
    .name("modular-library")
    .description("CLI for modular-library")
    .showHelpAfterError()
    .configureOutput({
      writeOut: (str) => {
        stdout.write(str);
      },
      writeErr: (str) => {
        stderr.write(str);
      },
    })
    .exitOverride();

  program
    .command("check")
    .description("Validate that package.json exports exist inside out-dir")
    .option("--package-json <path>", "Path to package.json", "./package.json")
    .option(
      "--out-dir <path>",
      "Output directory to validate against",
      "./dist",
    )
    .action((options: { packageJson: string; outDir: string }) => {
      const packageJsonPath = path.resolve(cwd, options.packageJson);
      const outDir = path.resolve(cwd, options.outDir);

      const validation = validatePackageExports({ packageJsonPath, outDir });

      if (validation.valid) {
        stdout.write(
          `All exports are valid. Checked ${validation.checked} export target(s) in ${outDir}.\n`,
        );
        return;
      }

      stderr.write(
        `Found ${validation.issues.length} invalid export target(s) out of ${validation.checked}:\n`,
      );
      validation.issues.forEach((issue) => {
        printIssue(stderr, issue);
      });

      throw new CommanderError(1, "check.invalidExports", "");
    });

  return program;
};

export const runCli = (
  argv: string[],
  {
    stdout = process.stdout,
    stderr = process.stderr,
    cwd = process.cwd(),
  }: RunCliOptions = {},
) => {
  const program = createProgram({ stdout, stderr, cwd });

  try {
    if (argv.length === 0) {
      program.outputHelp();
      return 0;
    }

    program.parse(argv, { from: "user" });
    return 0;
  } catch (error) {
    if (error instanceof CommanderError) {
      if (error.code === "check.invalidExports") {
        return 1;
      }

      return error.exitCode;
    }

    const message = error instanceof Error ? error.message : String(error);
    stderr.write(`${message}\n`);
    return 1;
  }
};

export const main = async () => {
  process.exitCode = runCli(process.argv.slice(2));
};

if (typeof require !== "undefined" && require.main === module) {
  void main();
}
