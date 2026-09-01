# ADR 0015: Compose CI by capability

- Status: Proposed
- Date: 2026-09-01
- Domains: Shared, Delivery
- Applies to: MiKode repositories using centralized reusable CI workflows

## Context

MiKode's reusable CI currently selects one mutually exclusive repository profile such as
`node`, `package`, or `docs`. The profile then determines both which checks run and which
tooling the repository must provide.

That works for repositories whose needs match one profile exactly, but the boundary is too
coarse. A documentation repository may use Node.js only to run Markdown validation, while
another documentation repository may need no Node.js tooling at all. A package may also
need documentation checks in addition to source, test, build, or packaging checks.

The current `docs` implementation illustrates the problem: selecting it requires a
`package.json`, a pnpm lockfile, Node.js, and `pnpm run docs:check`. Those are valid choices
for `Mikode13/engineering`, which owns executable documentation validators, but they are not
intrinsic properties of documentation itself.

Treating profiles as mutually exclusive repository types would either force unnecessary
tooling into repositories or require an increasing number of combined profiles.

## Decision

MiKode CI will model validation as **composable capabilities** rather than treating
repository profiles as mutually exclusive types.

A capability defines the result that CI must validate, not the runtime or package manager
used to implement that validation. Relevant capabilities include documentation validation,
source checks and tests, package validation, builds, and end-to-end tests.

Repositories may enable multiple applicable capabilities together. The central workflow
must set up only the tooling required by the enabled checks.

Existing profile names may remain as convenience presets and compatibility shims. A preset
expands to a known set of capabilities; it is not the authoritative model of what a
repository is. New combined profiles must not be introduced merely to represent capability
combinations.

The documentation capability must not, by itself, require Node.js, pnpm, `package.json`, or
a pnpm lockfile. A repository may still use Node.js and pnpm to implement its documentation
validation when that tooling is genuinely useful.

Repository-owned validation remains responsible for repository-specific invariants. The
central workflow should provide orchestration and shared enforcement rather than duplicate
every project's validation logic.

The stable aggregate `CI / required` check and the pull-request metadata checks established
by ADR 0010 remain shared requirements regardless of the selected capabilities.

## Alternatives considered

### Keep mutually exclusive profiles

This preserves the current implementation but keeps repository classification coupled to
specific tooling. Repositories that do not fit one profile cleanly either gain unnecessary
infrastructure or remain exceptions.

### Add combined profiles

Profiles such as `node-docs`, `package-docs`, or future combinations would solve individual
cases but create a combinatorial interface that grows as capabilities are added.

### Expose only one arbitrary repository command

A single configurable command would be flexible, but it would discard useful central
structure around common checks, required-job aggregation, build matrices, packaging, and
other capabilities already standardized by MiKode.

## Consequences

### Positive

- Documentation repositories can use the documentation CI contract without adopting an
  unrelated runtime or package manager.
- Repositories can combine documentation, source, package, build, and end-to-end validation
  without creating bespoke profile combinations.
- `Mikode13/engineering` can keep its existing Node.js/pnpm documentation tooling because it
  serves real repository invariants.
- New repositories select checks based on actual capabilities instead of being forced into
  one repository category.
- Existing profiles can remain available while the central workflow migrates incrementally.

### Negative

- The reusable workflow contract becomes more expressive and therefore slightly more
  complex.
- Tool setup must become conditional instead of being implied by one profile.
- Existing profile behavior needs compatibility tests during migration.
- The CI standard and reusable workflow must define which capabilities are implied by each
  retained preset.

## Related standards

- [Continuous integration standard](../standards/continuous-integration.md)
- [Git workflow standard](../standards/git-workflow.md)

## References

- [ADR 0010: Use GitHub Actions with centralized reusable CI workflows](0010-use-github-actions-with-centralized-reusable-ci-workflows.md)
- [ADR 0013: Keep external validations manual by default](0013-keep-external-validations-manual-by-default.md)
