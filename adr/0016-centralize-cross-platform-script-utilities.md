# ADR 0016: Centralize cross-platform script utilities in a shared MiKode package

- Status: Proposed
- Date: 2026-09-05
- Domains: Shared, Delivery
- Applies to: MiKode Node.js and TypeScript repositories with `package.json` build or
  maintenance scripts

## Context

A `package.json` script sometimes needs an operation that is not natively
cross-platform. The concrete case that surfaced this: `mikode-harness`'s `build`
script needed to delete a stale `dist/` output directory before recompiling (`tsc`
never removes output it no longer generates), and the straightforward fix —
`rm -rf dist && tsc -p tsconfig.build.json` — uses a POSIX shell command. `rm -rf`
works on macOS and Linux, and on Windows under Git Bash, WSL, or PowerShell with an
alias, but fails under native Windows `cmd.exe`, which is what `npm`/`pnpm` invoke by
default there.

Nothing in MiKode's shared tooling addresses this today. Without a shared answer,
each repository that hits the same problem — any build or maintenance script that
needs to delete a directory, copy a file, or perform another shell operation without
a native cross-platform command — would independently choose a fix: a third-party
package, an inline platform-specific command, or simply not supporting native
Windows. That produces an inconsistent, possibly reinvented solution per repository
for what is the same underlying problem.

## Decision

Create a dedicated, shared MiKode package that centralizes cross-platform-unsafe
operations needed by build and maintenance scripts, starting with cross-platform-safe
removal of a build output directory. MiKode repositories that need this kind of
operation in a `package.json` script depend on this one MiKode-owned package instead
of independently choosing a third-party tool or hand-rolling a platform-specific
command.

The package's internal implementation — Node's built-in `fs` APIs, conditional shell
dispatch, or another approach — is deliberately left open. It will be decided while
the package itself is designed and built, not fixed by this ADR. This ADR records
that the problem should be solved once, centrally, in a MiKode-owned package, not
which technique that package uses internally.

The package's name, scope, and full API are not yet finalized; they will be settled
when the package is built, following the existing pattern of `mikode-engineering`
documenting the decision and a separate repository (e.g. `mikode-code-style` for the
formatting standard) owning the implementation.

## Alternatives considered

### Use `rimraf` (or an equivalent third-party CLI) directly per repository

A standard, well-maintained package in the JavaScript ecosystem for exactly this
problem, and the option that was closest to being adopted directly in
`mikode-harness`. Rejected as the primary answer — if every repository independently
picks (or wires) a third-party dependency for the same recurring problem, the result
is inconsistent across MiKode repositories (some might pick `rimraf`, others a
different tool), and every consuming repository carries a third-party dependency for
a problem a single shared, MiKode-owned package could solve once.

### Inline Node one-liner per repository (for example `node -e "fs.rmSync(...)"`)

Zero new dependency, using only Node's own capabilities. Rejected as the primary
answer for the same reason as `rimraf` — it is unreused, repo-local boilerplate that
would be copy-pasted (and potentially rewritten inconsistently) into every
`package.json` that needs it, rather than centralized somewhere a future fix or
improvement only needs to happen once.

### Require a POSIX-compatible shell for all contributors (Git Bash or WSL on Windows)

Would make POSIX shell commands work everywhere without changing any script.
Rejected — it pushes an environment requirement onto every contributor's machine
setup instead of making MiKode's own tooling correct regardless of which shell a
contributor's platform defaults to.

## Consequences

### Positive

- One MiKode-owned package fixes cross-platform build and maintenance script
  problems for every consuming repository, instead of the problem being solved (or
  left unsolved) independently, once per repository.
- Consuming repositories depend on a single first-party MiKode package rather than
  scattering a third-party CLI dependency, or repeated inline platform-specific
  code, across many `package.json` files.
- Establishes a home for future cross-platform scripting needs beyond directory
  removal, without requiring a new ADR each time a similar need appears.

### Negative

- Requires designing, building, publishing, and maintaining a new package before any
  repository benefits from it. Until then, a repository with this problem (for
  example `mikode-harness`'s `build` script) keeps its known, documented,
  non-cross-platform limitation.
- Adds one more MiKode-owned dependency for consuming repositories to install and
  keep updated, in exchange for removing the alternative of a third-party or
  per-repository solution.

## Related standards

None yet. A standard covering the package's required usage in build or maintenance
scripts can be created once the package's design and API are settled and the
decision above moves to `Accepted`.

## References

None yet — this is an internal MiKode decision with no external source.
