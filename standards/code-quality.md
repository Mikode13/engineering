# Code quality standard

- Status: Active
- Last reviewed: 2026-07-25
- Related ADRs: [ADR 0007: Use ESLint 10 with modern React plugins](../adr/0007-use-eslint-10-with-modern-react-plugins.md), which supersedes [ADR 0006: Use ESLint with a shared @mikode13/code-quality configuration](../adr/0006-use-eslint-via-code-quality-package.md)

## Scope

This standard applies to all MiKode TypeScript repositories. It defines linting rules
for correctness and structure. It does not define formatting (see the
[code formatting standard](code-formatting.md)) or compiler options (see the
[TypeScript standard](typescript.md)).

## Rules

Projects adopting this standard MUST:

1. Lint with ESLint 10.8 or later within the ESLint 10 release line using a flat
   `eslint.config.js`.
2. Install and extend the shared configuration: `@mikode13/code-quality/base` for
   TypeScript code or `@mikode13/code-quality/react` for React code.
3. Ensure every linted TypeScript file belongs to a TypeScript project, since the
   shared configuration applies type-aware rules (through
   `parserOptions.projectService`) to `*.ts` and `*.tsx` files. JavaScript tooling
   files are linted with syntax-only rules and do not need tsconfig coverage.
4. Provide a lint script and a CI check that fails on any error or warning.
5. Justify every rule suppression with a comment on the `eslint-disable` directive
   explaining why the rule does not apply there.

Projects MUST NOT:

- Enable formatting rules in ESLint; formatting is Prettier's responsibility.
- Disable a shared rule project-wide without documenting an exception.

## Required configuration

Install the shared package alongside ESLint:

```sh
pnpm add --save-dev @mikode13/code-quality eslint@^10.8.0
```

ESLint is the shared package's only consumer-managed peer dependency. The shared package
owns its TypeScript parser, TypeScript, import resolver, React plugins, accessibility
plugin, and shared presets so consuming projects do not coordinate those versions.

A project's `eslint.config.js`:

```js
import codeQuality from '@mikode13/code-quality/base';

export default [...codeQuality];
```

React projects import `@mikode13/code-quality/react` instead. Project-specific additions
(extra ignores, local rules) are appended after the shared entries.

Typical scripts:

```json
{
	"scripts": {
		"lint": "eslint . --max-warnings 0",
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
- `react`: everything in base, plus the recommended JavaScript and TypeScript rules of
  `@eslint-react/eslint-plugin`, the official recommended rules of
  `eslint-plugin-react-hooks`, and the recommended static accessibility rules of
  `eslint-plugin-jsx-a11y-x`. Experimental, React Server Component, and React 19-only
  migration rules are disabled so the baseline remains framework-neutral and supports
  React 18 and 19.

`eslint-plugin-jsx-a11y-x` is a pre-1.0 dependency. The shared package MUST pin it
exactly and hide it behind the `/react` export. Consumers MUST NOT depend on or configure
it directly. Any upgrade requires the shared package's React fixtures and adoption
trials to pass before release.

The executable configuration is maintained in the
[`mikode13/code-quality`](https://github.com/mikode13/code-quality) repository. Projects
MUST consume its package exports and MUST NOT assemble a project-local copy of the
shared presets. If the package is unavailable or does not yet implement the active
standard, project adoption is blocked until the package is corrected.

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

Shared-package verification MUST run `pnpm audit --prod`, and publication MUST be
blocked while that command reports a known vulnerability. The replacement dependency
graph selected by ADR 0007 removed
[GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) from fresh
installations as verified on 2026-07-25. A clean audit is time-sensitive and MUST be
rechecked for every release.

## References

- [ADR 0007: Use ESLint 10 with modern React plugins](../adr/0007-use-eslint-10-with-modern-react-plugins.md)
- [Superseded ADR 0006: Use ESLint with a shared @mikode13/code-quality configuration](../adr/0006-use-eslint-via-code-quality-package.md)
- [`@mikode13/code-quality` implementation](https://github.com/mikode13/code-quality)
- [ESLint flat configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [`@eslint-react/eslint-plugin`](https://www.npmjs.com/package/@eslint-react/eslint-plugin)
- [`eslint-plugin-jsx-a11y-x`](https://www.npmjs.com/package/eslint-plugin-jsx-a11y-x)
- [typescript-eslint shared configs](https://typescript-eslint.io/users/configs/)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [GHSA-mh99-v99m-4gvg: `brace-expansion` unbounded expansion length](https://github.com/advisories/GHSA-mh99-v99m-4gvg)
- [Code formatting standard](code-formatting.md)
- [TypeScript standard](typescript.md)
