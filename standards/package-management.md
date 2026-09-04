# Package management standard

- Status: Active
- Last reviewed: 2026-09-05
- Related ADRs: [ADR 0003: Use pnpm as the package manager](../adr/0003-use-pnpm.md)

## Scope

This standard applies to all MiKode JavaScript and TypeScript repositories that install
npm-registry dependencies.

## Rules

Projects adopting this standard MUST:

1. Use pnpm for installing dependencies and running package scripts.
2. Pin the exact pnpm version in the `package.json` `packageManager` field.
3. Commit `pnpm-lock.yaml` and keep it in sync with `package.json`.
4. Use `pnpm install --frozen-lockfile` in CI so builds fail when the lockfile is out of
   date instead of silently resolving different versions.
5. Use pnpm commands in scripts, documentation, and contributor instructions.
6. Keep pnpm's default of not running dependency lifecycle scripts. When a dependency
   legitimately needs its install scripts (typically native modules), allow that
   specific dependency in the `allowBuilds` map in `pnpm-workspace.yaml` and treat the
   entry as a reviewable change.
7. Use a `preinstall` package-manager guard when the repository is not published as an npm
   package and preventing accidental npm or Yarn installs is useful.

Projects MUST NOT:

- Mix package managers in one repository: no `package-lock.json`, `yarn.lock`, or Bun
  lockfiles, and no npm, Yarn, or Bun commands in scripts, CI, or documentation.
- Enable `dangerouslyAllowAllBuilds` or otherwise re-enable dependency lifecycle
  scripts globally; install-time script execution stays opt-in per dependency.
- Publish a lifecycle script whose only purpose is enforcing the package manager used by
  contributors to the source repository. A consumer of a MiKode package must not need to
  approve or explicitly deny an install script that has no consumer-facing build purpose.
- Depend on Corepack. Corepack is not distributed with Node.js 25 and later, so no
  script, CI step, or documented setup path may assume it is present.

Developers SHOULD install pnpm explicitly with one of the
[documented installation methods](https://pnpm.io/installation); once installed, pnpm
reads the `packageManager` field and switches to the pinned version itself. A developer
MAY use Corepack on their own machine to provision pnpm, provided the project works
without it.

## Required configuration

Every adopting `package.json` MUST pin pnpm exactly:

```json
{
	"packageManager": "pnpm@11.17.0"
}
```

The version is an exact version, not a range. Renovate-style tooling or a deliberate
manual update changes it; individual developers do not need matching global installs
because pnpm defers to the pinned version.

A repository that is not published as an npm package SHOULD also fail fast when a
contributor invokes another package manager:

```json
{
	"scripts": {
		"preinstall": "npx only-allow pnpm"
	}
}
```

Published packages MUST omit this guard from the package manifest that consumers install.
Repository package-manager policy is a contributor concern, not a dependency build step.
The committed pnpm lockfile, CI, and review still enforce the repository's package-manager
choice.

The CI install step is:

```sh
pnpm install --frozen-lockfile
```

When a dependency needs its install scripts, allow it explicitly in
`pnpm-workspace.yaml` (pnpm 11 removed the earlier `onlyBuiltDependencies` family of
settings and no longer reads the `pnpm` field in `package.json`):

```yaml
# pnpm-workspace.yaml
allowBuilds:
  sharp: true
```

A dependency whose lifecycle scripts are intentionally unnecessary MAY be explicitly
denied with `false`. MiKode-owned published packages SHOULD avoid unnecessary lifecycle
scripts rather than requiring every consumer to carry such denials.

## Exceptions

A project MAY use a different package manager only when an external platform requires it
(for example, a deployment target that only supports npm). The project MUST document the
exception and its reason in its README.

## Adoption

New projects start with `pnpm init`, pin pnpm, and add the package-manager guard only when
the repository will not publish that script to consumers. Existing projects with another
lockfile migrate with `pnpm import`, which converts the existing lockfile, then delete the
old lockfile in the same change.

Existing MiKode packages that publish a contributor-only `preinstall` guard SHOULD remove
it in their next meaningful package-maintenance change. Consumers MAY explicitly deny the
legacy script with `allowBuilds: false` until the published package no longer contains it.

## References

- [ADR 0003: Use pnpm as the package manager](../adr/0003-use-pnpm.md)
- [pnpm installation](https://pnpm.io/installation)
- [pnpm CLI: install](https://pnpm.io/cli/install)
- [pnpm CLI: import](https://pnpm.io/cli/import)
- [pnpm build settings](https://pnpm.io/settings/build)
- [pnpm 11.0 release notes](https://pnpm.io/blog/releases/11.0)
- [pnpm: only allow pnpm](https://pnpm.io/only-allow-pnpm)
- [npm `packageManager` field](https://nodejs.org/api/packages.html#packagemanager)
