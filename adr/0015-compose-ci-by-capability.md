# ADR 0015: Compose CI by capability

- Status: Accepted
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

At the same time, composition must not turn capability selection into an invitation for each
repository or agent to reinterpret what a check means. MiKode needs one reviewed execution
contract for common validation while still allowing repositories to add invariants that are
specific to their own domain.

## Decision

This ADR refines the profile-selection model introduced by ADR 0010. The remaining ADR 0010
decisions remain in force.

MiKode CI will model validation as **composable capabilities** rather than treating
repository profiles as mutually exclusive types.

A capability defines a validation responsibility, not the runtime or package manager used
to implement it. The active capability catalogue is part of the central CI contract and is
not fixed by this ADR.

Each capability will have a canonical MiKode-owned contract and common implementation.
Repositories select applicable capabilities; they do not independently redefine the common
meaning of those capabilities or choose alternate implementations merely by convention.
Repository-owned validation may extend a capability only for invariants that are genuinely
specific to that repository.

Repositories may enable multiple applicable capabilities together. The central workflow
must set up only the tooling required by the enabled checks.

Existing profile names may remain as convenience presets and compatibility shims. A preset
expands to a known set of capabilities; it is not the authoritative model of what a
repository is. New combined profiles must not be introduced merely to represent capability
combinations.

The documentation capability must not, by itself, require Node.js, pnpm, `package.json`, or
a pnpm lockfile. A repository may still use Node.js and pnpm when the canonical or
repository-specific documentation validation genuinely requires that tooling.

Capability availability, preset expansion, and their executable contract are versioned with
the reusable CI workflow. A consuming repository must reason from the same pinned workflow
revision that it executes. Initial CI adoption or a deliberate CI update may evaluate the
latest reviewed central revision, then pin the selected revision as required by ADR 0010.

The stable aggregate `CI / required` check and the pull-request metadata checks established
by ADR 0010 remain shared requirements regardless of the selected capabilities.

## Acceptance criteria

Before this decision is accepted, trial the proposed ADR together with its Draft continuous
integration standard against `Mikode13/skills`, which currently has no CI caller and does not
own a Node.js or pnpm runtime.

Without being given an implementation recipe, an agent should be able to:

- classify `skills` as requiring the Documentation capability;
- avoid adding Source, Tests, Build, Package, or End-to-end capabilities without evidence
  that their applicability rules are met;
- inspect the current central CI contract and recognize that the existing profile-based
  implementation cannot provide the proposed Documentation capability independently of
  repository Node.js/pnpm tooling; and
- report that central CI gap rather than manufacture `package.json`, pnpm configuration,
  placeholder commands, or a repository-local reinterpretation of the capability.

The trial validates that the architectural decision plus current policy provide enough
criteria for an agent to reach the correct boundary. It does not require the
capability-based central workflow to exist before the ADR is accepted.

The acceptance trial was completed against `Mikode13/skills` on 2026-09-01. The agent
selected only the Documentation capability, rejected unrelated capabilities, inspected the
current central CI revision, and identified the Node.js/pnpm coupling as a central contract
gap rather than adding artificial repository tooling.

## Alternatives considered

### Keep mutually exclusive profiles

This preserves the current implementation but keeps repository classification coupled to
specific tooling. Repositories that do not fit one profile cleanly either gain unnecessary
infrastructure or remain exceptions.

### Add combined profiles

Profiles such as `node-docs`, `package-docs`, or future combinations would solve individual
cases but create a combinatorial interface that grows as capabilities are added.

### Let each repository define how a capability is implemented

This maximizes local flexibility but makes the same capability mean different things across
repositories and pushes policy decisions back onto maintainers and agents. It was rejected
in favor of canonical common implementations plus explicit repository-specific invariants.

### Expose only one arbitrary repository command

A single configurable command would be flexible, but it would discard useful central
structure around common checks, required-job aggregation, build matrices, packaging, and
other capabilities already standardized by MiKode.

## Consequences

### Positive

- Documentation repositories can use the documentation CI contract without adopting an
  unrelated runtime or package manager.
- Repositories can combine applicable validation responsibilities without creating bespoke
  profile combinations.
- Common capability behavior stays deterministic instead of depending on repository-local
  interpretation.
- `Mikode13/engineering` can keep its existing Node.js/pnpm documentation tooling where it
  serves real repository invariants.
- Existing profiles can remain available while the central workflow migrates incrementally.
- SHA-pinned consumers resolve capabilities against the same CI revision they actually run.

### Negative

- The reusable workflow contract becomes more expressive and therefore slightly more
  complex.
- Tool setup must become conditional instead of being implied by one profile.
- The central CI implementation must maintain a clear, versioned capability contract.
- Existing profile behavior needs compatibility tests during migration.
- The CI standard must define applicability rules so repositories and agents can determine
  which available capabilities are required.

## Related standards

- [Continuous integration standard](../standards/continuous-integration.md)
- [Git workflow standard](../standards/git-workflow.md)

## References

- [ADR 0010: Use GitHub Actions with centralized reusable CI workflows](0010-use-github-actions-with-centralized-reusable-ci-workflows.md)
- [ADR 0013: Keep external validations manual by default](0013-keep-external-validations-manual-by-default.md)
