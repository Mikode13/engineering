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

## Adding a decision

1. Start from the [ADR template](../templates/ADR.template.md) and use the next sequential
   number.
2. Describe the problem, realistic alternatives, selected decision, and consequences.
3. Use one or more domains from this index and state the applicability explicitly.
4. Keep the status `Proposed` until the decision is explicitly accepted.
5. Add the ADR to the chronological table in this index with its current status.

Do not rewrite an accepted ADR to change its history. Create a superseding ADR and update
the affected standard when an accepted decision changes.

## Decisions

The table remains chronological so missing numbers are visible. `Status` distinguishes
current decisions from proposals and historical records; superseded decisions are not
current policy.

| ADR                                                                        | Status     | Domains          | Applies to                                                                                               | Decision                                                                                                                                                                                  |
| -------------------------------------------------------------------------- | ---------- | ---------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [0001](0001-use-prettier.md)                                               | Accepted   | Shared           | JavaScript and TypeScript projects                                                                       | Use Prettier as the default formatter while retaining room to revisit Biome and oxfmt.                                                                                                    |
| [0002](0002-use-commons-clause-with-mit.md)                                | Accepted   | Shared           | MiKode software adopting the source-available policy                                                     | Combine the MIT License with the Commons Clause License Condition v1.0.                                                                                                                   |
| [0003](0003-use-pnpm.md)                                                   | Accepted   | Shared           | JavaScript and TypeScript projects that install registry dependencies                                    | Use pnpm for consistent, strict, and reproducible dependency management.                                                                                                                  |
| [0004](0004-support-node-22-and-later.md)                                  | Accepted   | Shared           | Node.js libraries, applications, services, and tools                                                     | Support maintained LTS lines from Node.js 22.13 and develop primarily on Node.js 24.                                                                                                      |
| [0005](0005-use-strict-shared-typescript-configuration.md)                 | Accepted   | Shared           | TypeScript libraries and applications                                                                    | Extend strict shared configurations from `@mikode13/tsconfig`.                                                                                                                            |
| [0006](0006-use-eslint-via-code-quality-package.md)                        | Superseded | Shared, Frontend | TypeScript projects, with additional rules for React projects                                            | Superseded by [ADR 0007](0007-use-eslint-10-with-modern-react-plugins.md), which replaced the React and accessibility providers with an ESLint 10-compatible, audit-clean graph.          |
| [0007](0007-use-eslint-10-with-modern-react-plugins.md)                    | Accepted   | Shared, Frontend | TypeScript projects, with additional rules for React projects                                            | Use an audit-clean ESLint 10 graph with modern React and accessibility providers.                                                                                                         |
| [0008](0008-use-conventional-commits-and-squash-merges.md)                 | Accepted   | Shared, Delivery | MiKode repositories hosted on GitHub; shared hooks target Node.js and pnpm                               | Use Conventional Commit PR titles, squash-only history, and shared Git hooks.                                                                                                             |
| [0009](0009-use-vitest-and-playwright-with-risk-based-testing.md)          | Accepted   | Shared, Delivery | MiKode JavaScript and TypeScript repositories with executable code or consumable technical configuration | Use Vitest and Playwright with fixed test organization, regression tests, risk-based requirements, and diagnostic coverage.                                                               |
| [0010](0010-use-github-actions-with-centralized-reusable-ci-workflows.md)  | Accepted   | Shared, Delivery | MiKode repositories hosted on GitHub                                                                     | Use GitHub Actions with centralized, SHA-pinned reusable CI workflows and one ruleset-compatible required check.                                                                          |
| [0011](0011-use-semantic-release-for-automated-npm-publication.md)         | Accepted   | Shared, Delivery | Independently versioned public npm packages owned by MiKode                                              | Use semantic-release to publish independently versioned npm packages from successful definitive `main` CI runs.                                                                           |
| [0012](0012-use-repository-owned-documentation-with-central-governance.md) | Accepted   | Shared           | MiKode repositories and organization-wide documentation                                                  | Keep project documentation with its owning repository while governing shared documentation centrally.                                                                                     |
| [0013](0013-keep-external-validations-manual-by-default.md)                | Accepted   | Shared, Delivery | MiKode CI checks that depend on external URLs, real providers, or third-party systems                    | Keep external validations manual and outside required CI unless a concrete future use case justifies automation.                                                                          |
| [0014](0014-use-concise-explanatory-technical-documentation.md)            | Accepted   | Shared           | MiKode technical documentation across repositories and organization-wide engineering documents           | Use concise, technical, explanatory documentation structured for understanding and scanning.                                                                                              |
| [0015](0015-compose-ci-by-capability.md)                                   | Accepted   | Shared, Delivery | MiKode repositories using centralized reusable CI workflows                                              | Compose CI from canonical capabilities while retaining profiles as convenience presets.                                                                                                   |
| [0016](0016-centralize-cross-platform-script-utilities.md)                 | Accepted   | Shared, Delivery | MiKode Node.js and TypeScript repositories with `package.json` build or maintenance scripts              | Centralizes cross-platform-unsafe operations needed by build/maintenance scripts in a shared MiKode package, rather than per-repository third-party dependencies or hand-rolled commands. |
| [0017](0017-use-ai-as-a-required-pull-request-reviewer.md)                 | Accepted   | Shared, Delivery | MiKode repositories hosted on GitHub                                                                     | Require an automated AI review as an independent second opinion before a pull request can merge.                                                                                          |
| [0018](0018-require-project-owned-architecture-documentation.md)           | Proposed   | Shared           | All active MiKode project repositories                                                                   | Require every active project to describe its current architecture in a project-owned `docs/architecture.md`.                                                                              |

Any change to an accepted decision should be documented in a new or superseding ADR rather
than rewriting its historical reasoning.
