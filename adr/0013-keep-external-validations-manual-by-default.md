# ADR 0013: Keep external validations manual by default

- Status: Accepted
- Date: 2026-08-30
- Domains: Shared, Delivery
- Applies to: MiKode CI checks that depend on external URLs, real providers, or third-party systems
- Partially supersedes:
  [ADR 0010: Use GitHub Actions with centralized reusable CI workflows](0010-use-github-actions-with-centralized-reusable-ci-workflows.md),
  external validation policy only

## Context

ADR 0010 established MiKode's common deterministic CI contract and also stated that
external URL checks and real-provider integration tests would run on a schedule. The
central CI contract remains useful, but periodic execution is a separate operational
choice and does not by itself provide a meaningful availability guarantee.

For example, a weekly check can succeed on Monday while the external service fails on
Friday, leaving MiKode unaware until the next run. When no operational response exists
for a failure, recurring checks create noise and a false sense of control rather than a
reliable safeguard.

External systems can also fail because of downtime, rate limits, credentials, cost, or
automation blocking unrelated to a MiKode change. Their behavior is therefore unsuitable
for the deterministic merge contract represented by `CI / required`.

## Decision

ADR 0010 remains the accepted decision for MiKode's common deterministic CI contract.
This ADR replaces only its policy requiring scheduled external validation.

Checks that depend on external URLs, real providers, or other third-party systems will
not run periodically as a MiKode-wide requirement. They will not be part of
`CI / required` by default. A repository may expose a manual external validation command
or workflow when running it provides useful evidence for a specific change or
investigation.

MiKode may automate an external validation later only when a concrete use case justifies
it through a separate decision. If rapid detection of external degradation becomes a
real requirement, MiKode will design it as monitoring or operations work, not as testing
or an extension of continuous integration.

This decision intentionally defines no recurring frequency, operational ownership,
alerting behavior, or general monitoring policy.

## Alternatives considered

### Require external validations on a recurring schedule

This would sometimes detect failures that occur without a repository change. It was not
selected because a periodic success does not guarantee continued availability, and a
failure without an operational response produces noise rather than control.

### Include external validations in `CI / required`

This would make external compatibility visible before merging. It was not selected
because third-party availability, credentials, rate limits, and cost can fail
independently of the proposed MiKode change and make the merge gate non-deterministic.

### Prohibit external validation automation permanently

This would keep the boundary simple but would prevent a justified future monitoring use
case. MiKode instead permits a later, explicit decision when concrete requirements exist.

## Consequences

### Positive

- `CI / required` remains deterministic and attributable to the repository change.
- MiKode avoids recurring checks that provide no defined operational value.
- Repositories retain a manual way to gather external evidence when it is useful.
- Future automation must begin with a concrete need rather than an assumed cadence.

### Negative

- MiKode will not automatically discover every external degradation between repository
  changes.
- Running an external validation manually requires an explicit maintainer action.
- A future monitoring need will require a separate decision and implementation.

## Related standards

- [Continuous integration standard](../standards/continuous-integration.md)
- [Testing standard](../standards/testing.md)

## References

- [ADR 0010: Use GitHub Actions with centralized reusable CI workflows](0010-use-github-actions-with-centralized-reusable-ci-workflows.md)
