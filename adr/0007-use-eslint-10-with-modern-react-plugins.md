# ADR 0007: Use ESLint 10 with modern React plugins

- Status: Accepted
- Date: 2026-07-25
- Domains: Shared, Frontend
- Applies to: TypeScript projects, with additional rules for React projects
- Supersedes: [ADR 0006](0006-use-eslint-via-code-quality-package.md)

## Context

[ADR 0006](0006-use-eslint-via-code-quality-package.md) selected ESLint 10, type-aware
TypeScript linting, and shared React and accessibility rules. Implementing its React
configuration revealed that the selected stable releases of `eslint-plugin-react` and
`eslint-plugin-jsx-a11y` only declare support through ESLint 9. Their dependency graphs
also retain `minimatch` 3 and `brace-expansion` 1.x.

On 2026-07-23, GitHub published
[GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg), a
high-severity denial-of-service advisory affecting `brace-expansion` through version
5.0.7. The only patched release is 5.0.8. Forcing that major into `minimatch` 3 is not a
safe fix because the export API changed, and package-manager overrides in the shared
configuration repository would not protect downstream consumers.

Current normal, non-prerelease releases provide a supported alternative:

- ESLint 10.8.0 uses `minimatch` 10.
- `@eslint-react/eslint-plugin` 5.18.0 supports ESLint 10, Node.js 22, TypeScript, and
  React 19.
- `eslint-plugin-jsx-a11y-x` 0.2.0 supports ESLint 9 and 10 and uses `minimatch` 10.
- `typescript-eslint` 8.65.0, `eslint-plugin-import-x` 4.17.1, and
  `eslint-plugin-react-hooks` 7.1.1 support ESLint 10.

A fresh installation of this dependency graph returned no known vulnerabilities from
`pnpm audit --prod` on 2026-07-25. Version-sensitive facts were verified against the npm
registry, upstream package documentation, and the GitHub advisory on that date.

## Decision

MiKode will implement `@mikode13/code-quality` on ESLint 10 with modern React lint
providers. The package will:

- declare ESLint `^10.8.0` as its only consumer-managed peer dependency;
- pin its parser, TypeScript, resolver, and lint plugin dependencies exactly;
- use `@eslint-react/eslint-plugin` 5.18.0 recommended JavaScript and TypeScript rules;
- retain the official `eslint-plugin-react-hooks` 7.1.1 recommended rules and disable
  duplicate rules from the React provider;
- use `eslint-plugin-jsx-a11y-x` 0.2.0 recommended static accessibility rules;
- disable experimental and React Server Component rules until MiKode selects an SSR
  framework;
- disable React 19-only migration suggestions that reject APIs required by supported
  React 18 projects;
- continue exporting composable `@mikode13/code-quality/base` and
  `@mikode13/code-quality/react` flat configuration arrays;
- reject warnings in CI; and
- run `pnpm audit --prod` as part of the package verification gate.

`eslint-plugin-jsx-a11y-x` is a normal published release but remains on a pre-1.0 version
line. MiKode accepts that API stability risk because the plugin is an exact-pinned
internal dependency hidden behind the shared `/react` export. Consumers do not configure
or version it directly. Any breaking plugin update must pass the package's React and
adoption tests and requires a new `@mikode13/code-quality` release.

The first package publication still requires successful validation in
`mikode-code-style` and at least one small TypeScript library, as selected in ADR 0006.

All parts of ADR 0006 that this decision does not change remain in effect.

## Alternatives considered

### Temporarily use ESLint 9 with the original plugins

This would satisfy the original plugins' peer ranges but retain the vulnerable
`minimatch` 3 and `brace-expansion` 1.x dependency line. Staying on a previous ESLint
major would therefore not resolve the audit finding and was rejected.

### Force the original plugins onto ESLint 10

Ignoring their peer ranges would preserve familiar rule names but create an unsupported
installation and retain their vulnerable transitive dependencies. It was rejected.

### Force or patch the transitive dependency

Forcing `brace-expansion` 5 into `minimatch` 3 would cross an incompatible API boundary.
A root-only patch or override would not propagate with the published configuration
package, while maintaining private forks of ESLint and both plugins would create an
unnecessary long-term security burden.

### Remove accessibility linting

Dropping static JSX accessibility checks would make the dependency graph smaller but
remove a requirement established by ADR 0006. The compatible replacement preserves that
coverage.

### Wait for the original plugins

Waiting could eventually restore the original providers, but it would block the shared
package even though a supported, audit-clean dependency graph is available now.

## Consequences

### Positive

- The package uses the current stable ESLint major with declared plugin compatibility.
- A fresh production dependency audit has no known vulnerabilities.
- React, Hooks, and static JSX accessibility coverage remain available.
- React 18 and 19 compatibility is protected by explicit fixtures.
- Consumers continue to coordinate only the ESLint peer dependency.
- Experimental and framework-specific React rules remain outside the shared baseline.

### Negative

- React rule names and some behavior change from the providers named in ADR 0006.
- The accessibility provider is pre-1.0 and may make breaking API changes.
- Exact dependency pins require deliberate shared-package upgrades to receive fixes.
- A clean audit is time-sensitive and must continue running for every release.
- Existing consumers will need a reviewed lint-adoption pass when they upgrade.

## Related standards

- [Code quality standard](../standards/code-quality.md)

## References

- [ADR 0006: Use ESLint with a shared @mikode13/code-quality configuration](0006-use-eslint-via-code-quality-package.md)
- [ESLint flat configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [`@eslint-react/eslint-plugin`](https://www.npmjs.com/package/@eslint-react/eslint-plugin)
- [ESLint React presets](https://www.eslint-react.xyz/docs/presets)
- [`eslint-plugin-jsx-a11y-x`](https://www.npmjs.com/package/eslint-plugin-jsx-a11y-x)
- [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks)
- [`eslint-plugin-import-x`](https://www.npmjs.com/package/eslint-plugin-import-x)
- [typescript-eslint dependency versions](https://typescript-eslint.io/users/dependency-versions/)
- [GHSA-mh99-v99m-4gvg: `brace-expansion` unbounded expansion length](https://github.com/advisories/GHSA-mh99-v99m-4gvg)
- [`@mikode13/code-quality` implementation](https://github.com/mikode13/code-quality)
