# ADR 0006: Use ESLint with a shared @mikode13/code-quality configuration

- Status: Superseded
- Date: 2026-07-24
- Superseded by: [ADR 0007](0007-use-eslint-10-with-modern-react-plugins.md)

## Context

With formatting handled by Prettier ([ADR 0001](0001-use-prettier.md)), MiKode projects
still need shared linting for correctness and consistency rules that a formatter cannot
express: promise misuse, unsafe `any` usage, unused code, import hygiene, and React
accessibility problems.

Relevant facts at the time of this decision:

- ESLint's flat config format (`eslint.config.js`) has been the default since ESLint 9;
  ESLint 10 is the current major version.
- typescript-eslint provides type-aware rules in tiered presets and supports ESLint 8.57
  through 10.
- MiKode code is TypeScript ([ADR 0005](0005-use-strict-shared-typescript-configuration.md)),
  so type-aware linting can rely on every linted file belonging to a TypeScript project.

## Decision

MiKode will lint with ESLint using flat config, shared through the independent
[`@mikode13/code-quality`](https://github.com/mikode13/code-quality) package.

The package name describes the purpose rather than the tool, parallel to
`@mikode13/code-style` (formatting) and `@mikode13/tsconfig` (compiler), so a future
migration to a different linter would not force a rename. Each tool's configuration
remains its own package.

The package ships two configurations:

- `@mikode13/code-quality/base` — for all TypeScript code:
  - typescript-eslint `strictTypeChecked` and `stylisticTypeChecked` presets, with
    type information provided by `parserOptions.projectService`;
  - basic import hygiene via `eslint-plugin-import-x`: no circular imports, no
    duplicate imports, and enforced type-only imports where applicable;
  - type-aware rules scoped to `*.ts` and `*.tsx` files only. JavaScript tooling files
    (`eslint.config.js`, `prettier.config.mjs`, standalone scripts) are linted with
    syntax-only rules so they do not need to belong to a TypeScript project.
- `@mikode13/code-quality/react` — extends base for React projects:
  - `eslint-plugin-react` and `eslint-plugin-react-hooks` recommended rules, with the
    plugin's modern JSX runtime configuration so components are not forced to import
    React solely for JSX;
  - accessibility rules from `eslint-plugin-jsx-a11y`.

The rule set must be validated in `mikode-code-style` and at least one small TypeScript
library before the shared package is released for project adoption; findings from that
trial must be handled through the normal change-review process.

The configuration MUST NOT enable formatting rules; formatting remains Prettier's
responsibility. Full architecture-boundary rules (ports and adapters, domain
boundaries) remain a future decision, as recorded in ADR 0001; the import hygiene rules
here are structural basics, not that architecture layer.

The exact rules and usage are defined in the
[code quality standard](../standards/code-quality.md). The executable configuration
lives in the independent
[`@mikode13/code-quality`](https://github.com/mikode13/code-quality) package, not in
this repository.

## Alternatives considered

### Biome

Biome bundles formatting and linting in one fast tool, but its rule set does not cover
typescript-eslint's type-aware rules, and MiKode already selected Prettier for
formatting. ADR 0001 records the intent to revisit Biome when architecture-specific
rules become concrete; that remains the plan.

### oxlint

oxlint is extremely fast but, at the time of this decision, does not provide the
type-aware rule depth of typescript-eslint, which is the main value sought here. It can
be reconsidered as the ecosystem matures.

### Lower typescript-eslint tiers

`recommended` (syntax-only) and `recommendedTypeChecked` produce less noise, but MiKode
projects are greenfield: adopting the strict tier from the start costs little now and
avoids ratcheting rules up across existing code later. Lint runs are slower with type
information; that is accepted.

### Legacy `.eslintrc` configuration

The legacy format is deprecated in favor of flat config and gone in current majors.
New configuration starts flat.

### Per-project ESLint configuration

Same drift problem as per-project tsconfig: local toggles never propagate. A shared
package makes rule changes a reviewed dependency update.

## Consequences

### Positive

- Type-aware rules catch real bug classes (floating promises, unsound casts) that
  neither the compiler defaults nor a formatter reports.
- Circular-import detection keeps module structure sound before any architecture
  tooling exists.
- React accessibility issues surface at lint time from the first component.
- One reviewed upgrade path for rule changes across all projects.

### Negative

- Type-aware linting requires a TypeScript program and is materially slower than
  syntax-only linting, especially on large projects.
- The strict tier flags patterns that are sometimes intentional; suppressions with
  justification comments become part of normal work.
- The toolchain gains several plugin dependencies that must be kept compatible with
  ESLint and TypeScript majors.
- typescript-eslint's TypeScript support range currently gates the TypeScript 7
  migration (see ADR 0005).

## Related standards

- [Code quality standard](../standards/code-quality.md)

## References

Version-sensitive research performed on 2026-07-24. ESLint 10.7.0 and
typescript-eslint 8.65.0 were the latest stable releases.

- [ESLint flat configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [typescript-eslint shared configs](https://typescript-eslint.io/users/configs/)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [eslint-plugin-import-x](https://github.com/un-ts/eslint-plugin-import-x)
- [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [`@mikode13/code-quality` implementation](https://github.com/mikode13/code-quality)
