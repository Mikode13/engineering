# Architecture Decision Records

ADRs record significant cross-project decisions, the alternatives considered, and the
consequences accepted. They are numbered sequentially and use lowercase kebab-case file
names. New ADRs should start from the [ADR template](../templates/ADR.template.md).

ADRs stay in one flat chronological sequence. Each ADR declares one or more controlled
domains and an explicit applicability statement in Markdown metadata. Domains are
navigational labels rather than directory or ownership boundaries, so a decision may
belong to more than one domain.

## Domains

- **Shared** — engineering policy, language tooling, and practices used across project
  types.
- **Frontend** — browser applications, user interfaces, accessibility, and client-side
  concerns.
- **Backend** — services, APIs, persistence, and server-side concerns.
- **Delivery** — continuous integration, releases, deployments, and repository delivery
  workflows.

New domains should be added only when concrete decisions no longer fit this vocabulary.
Do not create empty domain directories or renumber ADRs by domain.

## Accepted decisions

| ADR                                                                        | Domains          | Applies to                                                                                               | Decision                                                                                                                    |
| -------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| [0001](0001-use-prettier.md)                                               | Shared           | JavaScript and TypeScript projects                                                                       | Use Prettier as the default formatter while retaining room to revisit Biome and oxfmt.                                      |
| [0002](0002-use-commons-clause-with-mit.md)                                | Shared           | MiKode software adopting the source-available policy                                                     | Combine the MIT License with the Commons Clause License Condition v1.0.                                                     |
| [0003](0003-use-pnpm.md)                                                   | Shared           | JavaScript and TypeScript projects that install registry dependencies                                    | Use pnpm for consistent, strict, and reproducible dependency management.                                                    |
| [0004](0004-support-node-22-and-later.md)                                  | Shared           | Node.js libraries, applications, services, and tools                                                     | Support maintained LTS lines from Node.js 22.13 and develop primarily on Node.js 24.                                        |
| [0005](0005-use-strict-shared-typescript-configuration.md)                 | Shared           | TypeScript libraries and applications                                                                    | Extend strict shared configurations from `@mikode13/tsconfig`.                                                              |
| [0007](0007-use-eslint-10-with-modern-react-plugins.md)                    | Shared, Frontend | TypeScript projects, with additional rules for React projects                                            | Use an audit-clean ESLint 10 graph with modern React and accessibility providers.                                           |
| [0008](0008-use-conventional-commits-and-squash-merges.md)                 | Shared, Delivery | MiKode repositories hosted on GitHub; shared hooks target Node.js and pnpm                               | Use Conventional Commit PR titles, squash-only history, and shared Git hooks.                                               |
| [0009](0009-use-vitest-and-playwright-with-risk-based-testing.md)          | Shared, Delivery | MiKode JavaScript and TypeScript repositories with executable code or consumable technical configuration | Use Vitest and Playwright with fixed test organization, regression tests, risk-based requirements, and diagnostic coverage. |
| [0010](0010-use-github-actions-with-centralized-reusable-ci-workflows.md)  | Shared, Delivery | MiKode repositories hosted on GitHub                                                                     | Use GitHub Actions with centralized, SHA-pinned reusable CI workflows and one ruleset-compatible required check.            |
| [0012](0012-use-repository-owned-documentation-with-central-governance.md) | Shared           | MiKode repositories and organization-wide documentation                                                  | Keep project documentation with its owning repository while governing shared documentation centrally.                       |
| [0013](0013-keep-external-validations-manual-by-default.md)                | Shared, Delivery | MiKode CI checks that depend on external URLs, real providers, or third-party systems                    | Keep external validations manual and outside required CI unless a concrete future use case justifies automation.            |
| [0014](0014-use-concise-explanatory-technical-documentation.md)            | Shared           | MiKode technical documentation across repositories and organization-wide engineering documents           | Use concise, technical, explanatory documentation structured for understanding and scanning.                                |

The decisions above are accepted. Any change to them should be documented in a new or
superseding ADR rather than rewriting their historical reasoning.

## Proposed decisions

| ADR                                                                | Domains          | Applies to                                                  | Decision                                                                                                        |
| ------------------------------------------------------------------ | ---------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [0011](0011-use-semantic-release-for-automated-npm-publication.md) | Shared, Delivery | Independently versioned public npm packages owned by MiKode | Use semantic-release to publish independently versioned npm packages from successful definitive `main` CI runs. |

## Superseded decisions

| ADR                                                 | Domains          | Applies to                                                    | Superseded by                                                                                                                                                      |
| --------------------------------------------------- | ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [0006](0006-use-eslint-via-code-quality-package.md) | Shared, Frontend | TypeScript projects, with additional rules for React projects | [ADR 0007](0007-use-eslint-10-with-modern-react-plugins.md), which replaced its React and accessibility providers with an ESLint 10-compatible, audit-clean graph. |

Superseded decisions remain historical records and are not the current policy.
