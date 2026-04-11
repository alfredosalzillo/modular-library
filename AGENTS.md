# AGENTS.md

This file provides context and instructions for AI coding agents working on this project.

## Setup Commands

-   Install dependencies: `npm install`
-   Build the project: `npm run build`
-   Run tests: `npm test`
-   Run lint checks: `npm run lint`

## Technology Stack

-   **TypeScript**: Use TypeScript for all code changes. Follow the existing configuration in `tsconfig.json`.
-   Keep this `AGENTS.md` technology stack section up to date whenever the project tech stack changes.

## Development Workflow

1.  **Keep changes minimal**: Implement the smallest safe change that resolves the issue.
2.  **Build**: Before submitting, ensure the project compiles by running `npm run build`.
3.  **Validate**: Run relevant tests with `npm test` when behavior changes.
4.  **Code Style**: Follow the existing style and naming patterns in the codebase.

## Temporary Files

-   **Temporary Directory**: Always place temporary files in the `.ai-tmp` directory.

## Commit Message Guidelines

When creating commits, use **Conventional Commits**.

### Format

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

-   `feat`: A new feature (minor version update).
-   `fix`: A bug fix (patch version update).
-   `docs`: Documentation changes only.
-   `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc).
-   `refactor`: A code change that neither fixes a bug nor adds a feature.
-   `perf`: A code change that improves performance.
-   `test`: Adding missing tests or correcting existing tests.
-   `build`: Changes that affect the build system or external dependencies.
-   `ci`: Changes to CI configuration files and scripts.
-   `chore`: Other changes that don't modify src or test files.

### Breaking Changes

Breaking changes must be indicated by a `!` after the type/scope or by including `BREAKING CHANGE:` in the footer.
