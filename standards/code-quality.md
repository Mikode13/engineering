# Code quality standard

- Status: Active
- Last reviewed: 2026-07-24
- Related ADRs: [ADR 0006: Use ESLint with a shared @mikode/code-quality configuration](../adr/0006-use-eslint-via-code-quality-package.md)

## Scope

This standard applies to all MiKode TypeScript repositories. It defines linting rules
for correctness and structure. It does not define formatting (see the
[code formatting standard](code-formatting.md)) or compiler options (see the
[TypeScript standard](typescript.md)).

## Rules

Projects adopting this standard MUST:

1. Lint with ESLint 10 or later using a flat `eslint.config.js`.
2. Extend the shared configuration: `@mikode/code-quality/base` for TypeScript code,
   `@mikode/code-quality/react` for React code.
3. Ensure every linted TypeScript file belongs to a TypeScript project, since the
   shared configuration applies type-aware rules (through
   `parserOptions.projectService`) to `*.ts` and `*.tsx` files. JavaScript tooling
   files are linted with syntax-only rules and do not need tsconfig coverage.
4. Provide a lint script and a CI check that fails on any error.
5. Justify every rule suppression with a comment on the `eslint-disable` directive
   explaining why the rule does not apply there.

Projects MUST NOT:

- Enable formatting rules in ESLint; formatting is Prettier's responsibility.
- Disable a shared rule project-wide without documenting an exception.

## Required configuration

A project's `eslint.config.js`:

```js
import codeQuality from '@mikode/code-quality/base';

export default [...codeQuality];
```

React projects import `@mikode/code-quality/react` instead. Project-specific additions
(extra ignores, local rules) are appended after the shared entries.

Typical scripts:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

The shared configurations contain:

- `base`: typescript-eslint `strictTypeChecked` and `stylisticTypeChecked` presets with
  `projectService` enabled, plus `eslint-plugin-import-x` rules for circular-import
  detection, duplicate imports, and consistent type-only imports. Type-aware rules
  apply to `*.ts` and `*.tsx` only; JavaScript tooling files (configuration files,
  standalone scripts) get syntax-only rules.
- `react`: everything in base, plus the recommended rules of `eslint-plugin-react` and
  `eslint-plugin-react-hooks` with the modern JSX runtime configured (no React import
  required for JSX), and the accessibility rules of `eslint-plugin-jsx-a11y`.

Until `@mikode/code-quality` is published, projects assemble the same presets directly
in their `eslint.config.js` and switch to the package when it is available.

## Exceptions

A project MAY disable a specific shared rule project-wide when it demonstrably conflicts
with the project's domain (for example, a rule misfiring on a required external API
pattern). The project MUST record the disabled rule and reason in its repository
documentation. Changing the shared rule set itself requires a new or superseding ADR.

Generated files and build output MUST be excluded via the flat config `ignores` entry
rather than suppressed inline.

## Adoption

New projects add the configuration and CI check before their first feature. Existing
projects adopt in one change, fix or explicitly suppress all findings before merging,
and review suppressions rather than lowering the shared tier.

The shared rule set MUST be validated in `mikode-code-style` and at least one small
TypeScript library before the shared package is released for project adoption.

## References

- [ADR 0006: Use ESLint with a shared @mikode/code-quality configuration](../adr/0006-use-eslint-via-code-quality-package.md)
- [ESLint flat configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [typescript-eslint shared configs](https://typescript-eslint.io/users/configs/)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [Code formatting standard](code-formatting.md)
- [TypeScript standard](typescript.md)
