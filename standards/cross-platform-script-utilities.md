# Cross-platform script utilities standard

- Status: Active
- Last reviewed: 2026-09-05
- Related ADRs: [ADR 0016: Centralize cross-platform script utilities in a shared MiKode package](../adr/0016-centralize-cross-platform-script-utilities.md)

## Scope

This standard applies to MiKode Node.js and TypeScript repositories whose
`package.json` build or maintenance scripts need operations that are not portable
across supported platform shells. It currently covers cross-platform directory
removal through [`@mikode13/cross-platform`](https://github.com/Mikode13/cross-platform).

## Rules

When a script needs cross-platform directory removal, the repository MUST use
`@mikode13/cross-platform`:

- Use `mikode-scripts clean <path>` in a `package.json` script.
- Use `clean(path)` when calling the operation from code.
- Do not use a POSIX-only command such as `rm -rf` or add a separate per-repository
  dependency for the same operation.

`clean` is the only supported capability. Repositories MUST NOT assume that the package
provides other filesystem or shell utilities.

The CLI rejects an empty path, a filesystem root, and the current working directory.
Paths outside the current working directory are allowed.

## Required configuration

Install the package with pnpm:

```sh
pnpm add @mikode13/cross-platform
```

Use the CLI from a package script when cleaning a build directory:

```json
{
	"scripts": {
		"build": "mikode-scripts clean dist && tsc -p tsconfig.build.json"
	}
}
```

For programmatic use:

```ts
import { clean } from '@mikode13/cross-platform';

await clean('dist');
```

## Exceptions

If a required operation is not covered by the package, a repository MAY use another
cross-platform solution for that operation. The project documentation SHOULD record
material platform assumptions and the reason a shared capability is not being used.

Repeated use across MiKode repositories can justify proposing an extension to the shared
package.

## Adoption

New build and maintenance scripts MUST follow this standard. Existing scripts with an
equivalent directory-removal need SHOULD migrate when the relevant script or dependency
is next changed; adoption does not require a broad unrelated rewrite.

## References

- [ADR 0016: Centralize cross-platform script utilities in a shared MiKode package](../adr/0016-centralize-cross-platform-script-utilities.md)
- [`@mikode13/cross-platform` implementation repository](https://github.com/Mikode13/cross-platform)
