# ADR 0001: Use Prettier for cross-project code formatting

- Status: Accepted
- Date: 2026-07-24
- Domains: Shared
- Applies to: JavaScript and TypeScript projects

## Context

MiKode projects need a shared formatting policy so that formatting choices do not become
recurring review discussions or differ from one repository to another. The current need
is consistent formatting for JavaScript and TypeScript projects, including the related
file types that Prettier supports.

The team considered the following constraints:

- The formatter should be familiar to new team members.
- It should work well with the JavaScript ecosystem.
- It should be reliable enough for everyday local and CI use.
- It should not optimize for a performance problem we do not currently have.
- It should leave room to evaluate architecture-specific rules later, including rules
  related to ports and adapters and boundaries between domain and infrastructure code.

## Decision

MiKode will use Prettier as the default formatter for supported file types in its
JavaScript and TypeScript projects.

The initial shared configuration is defined in
[`standards/code-formatting.md`](../standards/code-formatting.md). Projects will use the
configuration through the
[`@mikode13/code-style/prettier`](https://github.com/mikode13/code-styiling) export from
the independent `@mikode13/code-style` package; this repository documents the policy
and does not contain the executable package.

Each adopting project will:

- keep the formatter version and configuration reproducible through its project
  dependencies and committed configuration;
- use the same configuration in editor integrations, local scripts, and CI; and
- run a formatting check in CI so that unformatted changes are visible before merge.

Architecture-specific rules are a separate concern. When those rules become a concrete
requirement, MiKode will re-evaluate whether Prettier remains the right formatter or
whether another tool should supplement or replace it.

## Alternatives considered

### Biome

Biome is a strong future candidate, particularly if MiKode later needs a more integrated
formatter and linting workflow with custom architecture rules. It was not selected for
the initial decision because those specialized rules are a future requirement, while the
current requirement is dependable, familiar formatting.

The team should revisit Biome when the architecture rules are defined well enough to
compare real capabilities, migration cost, and maintenance requirements.

### dprint

dprint is a credible alternative, but the team expects more friction for JavaScript
developers who are already familiar with the surrounding Prettier ecosystem. The team
also expects that diagnosing ecosystem-specific issues would be harder with a smaller
community footprint. Those are team-context considerations, not a claim that dprint is
technically unsuitable.

### oxfmt

oxfmt is a possible future option. At the time of this decision, the team considers it
too early in its evolution to become the default formatter for all MiKode projects. This
assessment should be revisited as the tool matures.

### ESLint formatting rules

ESLint remains useful for code-quality and architectural rules, but using it as the
primary formatter would couple formatting to linting. Prettier gives this decision a
focused formatter and leaves room for a separate linting decision.

### Manual formatting or project-specific choices

Manual formatting and repository-specific choices preserve local flexibility, but they
also preserve the inconsistency and review noise this decision is intended to remove.

## Consequences

### Positive

- Developers use one predictable formatter across MiKode projects.
- New team members can apply a familiar tool without learning a different style system
  for each repository.
- Formatting can run automatically in editors and be verified in CI.
- Formatting remains separate from future linting and architecture-rule decisions.
- The team can revisit Biome or oxfmt later without making speculative requirements part
  of the initial tool choice.

### Negative

- Prettier is intentionally opinionated and does not express every architecture rule.
- Projects will need a separate linting or analysis solution for ports-and-adapters and
  domain-boundary enforcement.
- The selected `arrowParens: "avoid"` preference differs from Prettier's current default
  and may create a migration cost if the team later changes it.
- Formatting can produce broad diffs when a project adopts the standard for the first
  time; adoption should therefore be done in a deliberate, reviewable change.

## Related standards

- [Code formatting standard](../standards/code-formatting.md)

## References

- [Prettier options](https://prettier.io/docs/options.html)
- [Prettier configuration files](https://prettier.io/docs/configuration)
- [Prettier CLI](https://prettier.io/docs/cli)
- [Prettier option philosophy](https://prettier.io/docs/option-philosophy.html)
- [`@mikode13/code-style` implementation](https://github.com/mikode13/code-styiling)
