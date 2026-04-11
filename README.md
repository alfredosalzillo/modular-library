# modular-library

![npm version](https://img.shields.io/npm/v/modular-library)
![node version](https://img.shields.io/badge/node-%3E%3D22-blue)
![license](https://img.shields.io/github/license/alfredosalzillo/modular-library)

`modular-library` is a utility library for generating modular libraries.

## Why

Building a modular library manually is usually tedious and error-prone:

- keeping `package.json` `exports` in sync with your generated files,
- wiring and maintaining complex glob-based inputs,
- avoiding output path mistakes when your source tree grows.

`modular-library` is a **zero-config** way to generate modular outputs for `vite`, `rollup`, and `rolldown` with predictable structure.

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

### Why this is different from standard library mode

| Approach | Example import | What happens |
| --- | --- | --- |
| Standard library mode | `import { button } from "my-lib";` | Requires evaluating the full package entry. |
| Modular library (`modular-library`) | `import button from "my-lib/button";` | Loads only the `button` module code. |

### Before vs. After output

```text
# Before (standard single-entry build)
dist/
  index.js

# After (modular output with modular-library)
dist/
  button.js
  modal.js
  utils/
    formatDate.js
```

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

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `relative` | `string` | `"src/"` | Base path removed from generated output keys. |
| `glob` | [`GlobOptions`](https://nodejs.org/api/fs.html#fsglobsyncpattern-options) | `undefined` | Options forwarded to `fs.globSync`. |
| `transformOutputPath` | `(outputPath: string, inputPath: string) => string` | `undefined` | Customize each generated output path. |

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

### Exports tip

To make your package consumable with subpath imports, add an `exports` map in your `package.json`:

```json
{
  "exports": {
    "./*": "./dist/*.js"
  }
}
```

## Development

```bash
npm install
npm run build
npm test
```

To test GitHub workflows locally, you can use [`act`](https://nektosact.com/).

## License

ISC