# Architecture Decision Records

ADRs record significant cross-project decisions, the alternatives considered, and the
consequences accepted. They are numbered sequentially and use lowercase kebab-case file
names. New ADRs should start from the [ADR template](../templates/ADR.template.md).

## Proposed decisions

- [ADR 0008: Use Conventional Commits and squash merges with shared Git hooks](0008-use-conventional-commits-and-squash-merges.md) — proposes Conventional Commit pull request titles, squash-only default-branch history, shared pre-push checks, and an independent `@mikode13/git-hooks` package.

Proposed decisions are open for review and are not current policy until accepted.

## Accepted decisions

- [ADR 0001: Use Prettier for cross-project code formatting](0001-use-prettier.md) — establishes Prettier as the default formatter while leaving room to revisit Biome and oxfmt.
- [ADR 0002: Use the Commons Clause with the MIT License for source-available software](0002-use-commons-clause-with-mit.md) — establishes the source-available licensing model for MiKode software.
- [ADR 0003: Use pnpm as the package manager](0003-use-pnpm.md) — establishes pnpm for consistent, strict, reproducible installs across projects.
- [ADR 0004: Support Node.js 22 and later](0004-support-node-22-and-later.md) — establishes Node.js 22.13 as the support floor with development on the active LTS line.
- [ADR 0005: Use a strict shared TypeScript configuration via @mikode13/tsconfig](0005-use-strict-shared-typescript-configuration.md) — establishes strict compiler settings shared through the [`mikode13/tsconfig`](https://github.com/mikode13/tsconfig) package.
- [ADR 0007: Use ESLint 10 with modern React plugins](0007-use-eslint-10-with-modern-react-plugins.md) — establishes an audit-clean ESLint 10 graph with modern React and static JSX accessibility providers through the [`mikode13/code-quality`](https://github.com/mikode13/code-quality) package.

The decisions above are accepted. Any change to them should be documented in a new or
superseding ADR rather than rewriting their historical reasoning.

## Superseded decisions

- [ADR 0006: Use ESLint with a shared @mikode13/code-quality configuration](0006-use-eslint-via-code-quality-package.md) — superseded by ADR 0007, which replaced its React and accessibility providers with an ESLint 10-compatible, audit-clean graph.

Superseded decisions remain historical records and are not the current policy.
