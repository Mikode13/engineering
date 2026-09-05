# ADR 0016: Centralize cross-platform script utilities in a shared MiKode package

- Status: Proposed
- Date: 2026-09-05
- Domains: Shared, Delivery
- Applies to: MiKode Node.js and TypeScript repositories with `package.json` build or
  maintenance scripts

## Context

MiKode repositories need to run build and maintenance operations through
`package.json` scripts. A POSIX command such as `rm -rf dist` fails under native
Windows `cmd.exe`, which is the default shell used by `npm` and `pnpm` there.

This need already exists in two repositories. `fetch` has a Node-based clean script,
while `mikode-harness` still uses the incompatible shell command in its build script.
The same operation therefore has two different solutions, one of which does not work
on every supported platform.

## Decision

Create a separate, shared MiKode package for cross-platform-unsafe operations needed by
`package.json` scripts. Its first version is limited to one demonstrated need:
cross-platform-safe directory removal through `clean`.

The initial contract is:

- a reusable `clean(path)` function; and
- a CLI for scripts, such as `mikode-scripts clean dist`.

The CLI rejects an empty path, a filesystem root, and the current working directory.
It allows paths outside the current working directory because no current requirement
justifies a narrower scope.

The implementation uses Node's built-in `node:fs` APIs. This is an implementation
choice, not a permanent architectural constraint; the public function and CLI
contract are the stable boundary. Additional utilities are deferred until another
MiKode repository demonstrates a concrete need.

## Alternatives considered

### Keep solving the problem in each repository

Rejected because it duplicates ownership and produces inconsistent behavior, as the
existing `fetch` and `mikode-harness` implementations demonstrate. This includes
choosing `rimraf` or embedding a Node one-liner independently in each repository.

### Require a POSIX-compatible shell on Windows

Rejected because it makes contributor environment setup a prerequisite for correct
MiKode scripts instead of making the shared operation portable by construction.

### Design a broader toolkit before another need exists

Rejected because it would commit the package to speculative operations and API surface.
The first version should follow demonstrated reuse and add another utility only when a
real use case requires it.

## Consequences

### Positive

- Consuming repositories get one first-party implementation of the demonstrated
  operation.
- The initial API stays small while covering both programmatic and script usage.
- A future implementation fix can be made in one package rather than repeated across
  repositories.

### Negative

- MiKode must design, publish, and maintain another package before consumers can adopt
  it.
- Repositories with a different cross-platform need remain responsible for that need
  until it is demonstrated and added in a later version.

## Related standards

None yet. A usage standard can be considered after the package contract is settled and
this ADR moves to `Accepted`.

## References

- [`fetch` clean script](https://github.com/Mikode13/fetch/blob/main/scripts/clean.mjs)
- [`harness` build script](https://github.com/Mikode13/harness/blob/main/package.json)
- [`@mikode13/cross-platform` implementation repository](https://github.com/Mikode13/cross-platform)
- [Node.js `fs/promises.rm` API](https://nodejs.org/api/fs.html#fspromisesrmpath-options)
