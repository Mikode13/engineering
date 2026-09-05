# ADR 0016: Centralize cross-platform script utilities in a shared MiKode package

- Status: Proposed
- Date: 2026-09-05
- Domains: Shared, Delivery
- Applies to: MiKode Node.js and TypeScript repositories with `package.json` build or
  maintenance scripts

## Context

Two MiKode repositories have already needed to delete a directory from a
`package.json` script in a way that works under native Windows `cmd.exe`, not only
macOS, Linux, or Windows shells like Git Bash, WSL, or PowerShell:

- `fetch` already solves this with its own `scripts/clean.mjs`, calling
  `rm(path, { recursive: true, force: true })` from `node:fs/promises`.
- `mikode-harness`'s `build` script needs the same operation before recompiling
  (`tsc` never removes output it no longer generates), but currently uses
  `rm -rf dist && tsc -p tsconfig.build.json`, a POSIX shell command that fails
  under native `cmd.exe`, which is what `npm`/`pnpm` invoke by default on Windows.

Nothing in MiKode's shared tooling addresses this today, so each repository that
needs it solves it independently: `fetch` wrote its own Node-based script, and
`mikode-harness` still carries a shell command that does not work on native
Windows. This is demonstrated duplication, not a hypothetical future one — the same
operation (cross-platform-safe directory removal) has already been implemented
twice, once correctly for Windows and once not.

## Decision

Create a dedicated, shared MiKode package that centralizes cross-platform-unsafe
operations needed by `package.json` build and maintenance scripts. The first
version of this package implements exactly one operation, `clean`
(cross-platform-safe removal of a directory). No other utility (`copy`, `move`,
`mkdir`, `env`, or anything else) is added until a real need for it appears in a
MiKode repository, the same way `clean` did.

`clean` is implemented using Node's standard library (`node:fs` /
`node:fs/promises`), not `rm -rf` and not a third-party dependency such as
`rimraf`: every consumer is already a Node.js project, so a built-in API
introduces no additional runtime. This is a current implementation decision, not a
permanent architectural one — a future version could change how `clean` is
implemented internally without affecting consumers, as long as the public function
and CLI contract below stay stable.

The package exposes `clean` in two forms, matching how consumers already use this
kind of operation:

- A reusable function, `clean(path)`, for programmatic use (as `fetch`'s own
  script does today).
- A CLI entry point meant to be called directly from `package.json`, for example
  `mikode-scripts clean dist`, so a script like `mikode-harness`'s `build` becomes
  `mikode-scripts clean dist && tsc -p tsconfig.build.json`.

The CLI validates its target path before deleting anything and errors on:

- an empty path;
- the root of the filesystem (`/`, `C:\`, and equivalent);
- the current working directory (`.` or the resolved `process.cwd()`).

The first version does not restrict the target path to be inside the current
working directory — `../other-dir` and similar are permitted — because there is no
current evidence that this restriction is needed. Whether to add it is left as an
open question for the package itself, to be decided (and recorded in the package's
own decision log) if and when a real case for it appears.

The package's name and full API surface beyond `clean` are not yet finalized; they
will be settled when the package is built, following the existing pattern of
`mikode-engineering` documenting the decision and a separate repository (e.g.
`mikode-code-style` for the formatting standard) owning the implementation.

## Alternatives considered

### Each repository keeps solving this independently (status quo)

This is what is already happening: `fetch` wrote its own `node:fs/promises`-based
script, and `mikode-harness` uses a shell command that does not work on native
Windows. Rejected as the ongoing answer — it has already produced two different
implementations of the same operation, one of them broken on native Windows, and
gives no shared place to fix or improve the logic once.

### Use `rimraf` (or an equivalent third-party CLI) directly per repository

A standard, well-maintained package in the JavaScript ecosystem for exactly this
problem. Rejected as the primary answer — if every repository independently picks
(or wires) a third-party dependency for the same recurring problem, the result is
inconsistent across MiKode repositories, and every consuming repository carries a
third-party dependency for a problem a single shared, MiKode-owned package can
solve once using only Node's own standard library.

### Require a POSIX-compatible shell for all contributors (Git Bash or WSL on Windows)

Would make POSIX shell commands work everywhere without changing any script.
Rejected — it pushes an environment requirement onto every contributor's machine
setup instead of making MiKode's own tooling correct regardless of which shell a
contributor's platform defaults to.

### Design a broader cross-platform filesystem toolkit or command catalog up front

Instead of shipping only `clean`, design the package's API around an anticipated
set of future operations (`copy`, `move`, `mkdir`, environment-variable handling,
and so on). Rejected for the first version — `clean` is the only operation with a
demonstrated, real need (`fetch` and `mikode-harness`); designing for operations no
repository has actually needed yet risks a speculative API that does not match
whatever the real second need turns out to be.

## Consequences

### Positive

- Replaces two independent, already-diverged implementations of the same operation
  (`fetch`'s working `node:fs/promises` script and `mikode-harness`'s
  Windows-incompatible shell command) with one shared, correct implementation.
- Consuming repositories depend on a single first-party MiKode package, using only
  Node's built-in APIs, rather than a third-party CLI dependency or repeated inline
  platform-specific code across `package.json` files.
- A minimal first version (`clean` only) ships sooner and avoids committing to API
  design for operations no repository has actually needed yet.

### Negative

- Requires designing, building, publishing, and maintaining a new package before
  any repository benefits from it. Until then, `mikode-harness`'s `build` script
  keeps its known, documented, non-cross-platform limitation.
- Adds one more MiKode-owned dependency for consuming repositories to install and
  keep updated, in exchange for removing the alternative of a third-party or
  per-repository solution.
- Scoping the first version to `clean` only means a repository with a different
  cross-platform-unsafe need (for example copying a file) still has no shared
  solution until that need is demonstrated and a later version adds it.

## Related standards

None yet. A standard covering the package's required usage in build or maintenance
scripts can be created once the package's design and API are settled and the
decision above moves to `Accepted`.

## References

None yet — this is an internal MiKode decision with no external source.
