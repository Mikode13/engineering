# ADR 0003: Use pnpm as the package manager

- Status: Accepted
- Date: 2026-07-24

## Context

MiKode projects need one package manager so that installation behavior, lockfiles,
scripts, and CI commands are consistent across repositories. Mixing package managers
produces incompatible lockfiles, divergent dependency resolution, and documentation that
works in one project but not another.

The team considered the following constraints:

- Installs must be reproducible locally and in CI.
- The dependency layout should prevent packages from importing dependencies they do not
  declare.
- Installing dependencies should not execute arbitrary code by default. Several recent
  npm supply-chain attacks delivered their payload through install-time lifecycle
  scripts (`postinstall` and similar), so the package manager's default behavior toward
  those scripts is a security property.
- The tool must work well for single-package repositories now and support workspaces if
  a monorepo is created later, without requiring one.
- The tool must support the Node.js versions MiKode targets.

## Decision

MiKode will use pnpm as the package manager for its JavaScript and TypeScript projects.

Each adopting project will pin its pnpm version in the `package.json` `packageManager`
field, commit `pnpm-lock.yaml`, and use pnpm commands in scripts, documentation, and CI.
The exact rules are defined in the
[package management standard](../standards/package-management.md).

Choosing pnpm does not imply adopting a monorepo. Workspace features remain available
but are a separate, project-level decision.

## Alternatives considered

### npm

npm ships with Node.js and requires no additional installation. It was not selected
because its flat, hoisted `node_modules` layout allows importing packages that are not
declared as dependencies (phantom dependencies), which pnpm's symlinked layout prevents
by default. pnpm also stores packages in a shared content-addressable store, so repeated
installs across MiKode projects use less disk space and time.

Defaults also differ on install-time scripts: npm executes dependency lifecycle scripts
during installation unless invoked with `--ignore-scripts`, while pnpm 10 and later
refuse to run them unless the dependency is explicitly allowlisted. Under pnpm, a
compromised transitive dependency cannot run code at install time merely by being
installed. This mitigates one common attack path; it is not complete protection, since
malicious code can still run when a compromised package is imported at runtime.

### Yarn

Modern Yarn is capable, but its Plug'n'Play installation model still creates
compatibility friction with some tools, and using its `node_modules` compatibility mode
gives up its main differentiator. The team saw no advantage over pnpm that would justify
the additional configuration surface.

### Bun

Bun's package manager is fast, but it is part of a larger runtime project whose primary
value is replacing Node.js itself. MiKode is standardizing on Node.js, and adopting
Bun's package manager alone would couple the toolchain to a second runtime ecosystem
without removing any existing dependency.

### No shared choice

Letting each project choose keeps local freedom but recreates the inconsistency this
decision exists to remove: different lockfiles, different CI steps, and
non-transferable documentation.

## Consequences

### Positive

- One set of install, script, and CI commands across all MiKode projects.
- Strict dependency isolation catches undeclared dependencies at development time.
- Install-time lifecycle scripts of dependencies do not run unless explicitly approved,
  closing the default install-script path used by several npm supply-chain attacks.
- The shared store makes installs fast and disk-efficient across many small projects.
- Workspaces are available later without changing package manager.

### Negative

- pnpm is an additional tool to install, since it does not ship with Node.js. Corepack,
  which previously shipped with Node.js and could provision pnpm automatically, is no
  longer distributed with Node.js 25 and later, so the standard must define an
  installation method that does not rely on it.
- The strict `node_modules` layout can surface latent bugs in dependencies that rely on
  hoisting; resolving these occasionally requires configuration overrides.
- Dependencies that legitimately need install scripts (native modules such as `sharp`
  or `esbuild`) fail to build until they are allowlisted, which adds a review step to
  adding such dependencies.
- Contributors coming from npm must learn minor command differences.

## Related standards

- [Package management standard](../standards/package-management.md)

## References

Version-sensitive research performed on 2026-07-24. pnpm 11.17.0 was the latest stable
release and requires Node.js 22.13 or later.

- [pnpm motivation](https://pnpm.io/motivation)
- [pnpm installation](https://pnpm.io/installation)
- [pnpm settings](https://pnpm.io/settings)
- [pnpm 10 release discussion (lifecycle scripts disabled by default)](https://github.com/orgs/pnpm/discussions/8945)
- [Socket: pnpm 10.0.0 blocks lifecycle scripts by default](https://socket.dev/blog/pnpm-10-0-0-blocks-lifecycle-scripts-by-default)
- [Node.js Corepack documentation](https://nodejs.org/api/corepack.html)
- [npm `packageManager` field](https://nodejs.org/api/packages.html#packagemanager)
