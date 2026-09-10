# Standards

Standards define rules that MiKode projects should apply consistently. Each document
declares its status; active standards are mandatory within their stated scope.

## Adding a standard

A standard should state its status, review date, related ADRs, scope, active rules,
exceptions, and adoption path when those sections add useful information. Keep historical
reasoning in the related ADR and avoid duplicating it.

New standards remain `Draft` until their decision is accepted or they are explicitly
approved. Add each standard once under the matching status section in this index.

## Active standards

- [Code formatting standard](code-formatting.md) — Prettier configuration and adoption workflow.
- [Licensing standard](licensing.md) — source-available licensing workflow and validation checklist.
- [Package management standard](package-management.md) — pnpm usage, version pinning, and
  CI install rules.
- [Node.js version standard](nodejs-version.md) — supported Node.js range, `engines`, and `.nvmrc` configuration.
- [TypeScript standard](typescript.md) — shared strict compiler configuration and its variants.
- [Code quality standard](code-quality.md) — ESLint 10 flat config, type-aware rules, and
  modern React and accessibility providers.
- [Git workflow standard](git-workflow.md) — branch, pull request, squash merge, shared
  script, and pre-push hook rules.
- [Testing standard](testing.md) — Vitest, Playwright, fixed test organization,
  deterministic data, regression tests, and shared scripts.
- [Continuous integration standard](continuous-integration.md) — composable capabilities,
  canonical validation contracts, immutable CI revisions, and controlled rollout.
- [Automated pull request review standard](automated-pull-request-review.md) — required AI
  second-opinion review, enforcement, provider operation, and guarded rollout.
- [Automated npm publication standard](automated-npm-publication.md) — semantic-release
  versioning, trusted publication, and guarded recovery.
- [Cross-platform script utilities standard](cross-platform-script-utilities.md) — portable
  build and maintenance operations and shared-utility reuse guidance.
- [Documentation standard](documentation.md) — ownership, baseline project artifacts,
  project decision logs, and shared documentation distribution.
- [Documentation writing standard](documentation-writing.md) — technical writing style,
  document structure, examples, diagrams, references, and README expectations.

## Draft standards

There are currently no draft standards.
