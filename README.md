# modular-library

`modular-library` is a utility library for generating modular libraries.

## What is a modular library?

A **modular library** is a library split into small, focused modules instead of one large, monolithic package.

This approach helps you:

- keep each part of the library easier to understand and maintain,
- reuse modules independently across projects,
- reduce coupling between features,
- improve scalability as the codebase grows,
- be tree-shakeable so consumers only bundle what they import,
- expose clear entry points for each public feature or component.

Typical examples of modular libraries include:

- UI libraries exposing per-component entries (for example `@acme/ui/button`, `@acme/ui/modal`),
- utility libraries exposing per-domain modules (for example `@acme/utils/date`, `@acme/utils/string`),
- SDKs exposing feature-based modules (for example `@acme/sdk/auth`, `@acme/sdk/storage`).

With `modular-library`, the goal is to make the creation of this kind of modular architecture faster and more consistent.

## Installation

> **Node.js requirement:** This library supports only Node.js `22` or newer.

```bash
npm install modular-library
```

## Usage

`modular-library` provides dedicated plugins for `vite`, `rollup`, and `rolldown`.

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import modularLibrary from "modular-library/vite";

export default defineConfig({
  plugins: [modularLibrary()],
  build: {
    lib: {
      entry: ["src/**/*.ts"],
      formats: ["es"],
    },
  },
});
```

### Rollup

```ts
// rollup.config.ts
import modularLibrary from "modular-library/rollup";

export default {
  input: ["src/**/*.ts"],
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [modularLibrary()],
};
```

### Rolldown

```ts
// rolldown.config.ts
import modularLibrary from "modular-library/rolldown";

export default {
  input: ["src/**/*.ts"],
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [modularLibrary()],
};
```

### Options

All plugin variants support the same options:

- `relative` (default: `"src/"`): base path removed from generated output keys.
- `glob`: [`fs.globSync`](https://nodejs.org/api/fs.html#fsglobsyncpattern-options) options.
- `transformOutputPath(outputPath, inputPath)`: customize each generated output path.

Example with options:

```ts
import modularLibrary from "modular-library/rollup";

export default {
  input: ["src/**/*.ts"],
  output: {
    dir: "dist",
    format: "es",
  },
  plugins: [
    modularLibrary({
      relative: "src/",
      transformOutputPath: (outputPath) => `modules/${outputPath}`,
    }),
  ],
};
```

## Development

```bash
npm install
npm run build
npm test
```

## License

ISC