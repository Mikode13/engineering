# ADR 0017: Use AI as a required pull request reviewer

- Status: Proposed
- Date: 2026-09-07
- Domains: Shared, Delivery
- Applies to: MiKode repositories hosted on GitHub

## Context

MiKode changes are commonly implemented by agents that receive a concrete objective. An
implementing agent can focus on completing that objective while overlooking regressions,
misapplied skills, weak solutions, or consequences outside the immediate task. Asking an
agent to switch explicitly into fault-finding review has already exposed problems that
were not identified during implementation.

Deterministic CI checks known, machine-enforceable properties, but it cannot assess every
design choice, behavioral risk, or missing test. Human review remains necessary, yet some
changes involve areas such as continuous integration, delivery, or security that a
maintainer may not inspect with the same depth on every pull request. An independent AI
review can provide a focused second opinion and supporting evidence before the maintainer
makes the final decision.

[ADR 0013](0013-keep-external-validations-manual-by-default.md) keeps external validation
outside required CI unless a concrete use case justifies automation. Pull request review
is now that concrete use case: MiKode values the additional confidence and code quality
enough to accept higher token usage, monetary cost, and review latency.

## Decision

Require an automated AI review as an independent second opinion for every MiKode pull
request that is ready to merge. The review is a separate merge gate from deterministic
`CI / required` and is explicitly directed to search for faults, regressions, and weak
solutions in the proposed change.

Serious supported findings and a review that cannot complete prevent the normal merge
flow. A maintainer evaluates the evidence, chooses the appropriate solution, and remains
responsible for the final merge decision. Passing the AI review increases confidence; it
does not prove correctness and does not replace human review.

The related standard owns changeable operating policy, including provider and model,
account and budget, review orchestration, severity rules, execution order, exceptions,
and rollout. Changing those details does not change this decision. Removing the required
AI second opinion or replacing it with a materially different review approach requires a
new ADR.

## Alternatives considered

### Rely on implementation and human review

Rejected because the implementing agent can retain the same task-focused blind spots, and
the maintainer may not be able to inspect every affected specialty in depth. MiKode wants
a consistent fault-finding pass before the final human decision.

### Rely only on deterministic CI

Rejected because deterministic checks cover predefined invariants rather than the full
behavioral, architectural, and maintenance consequences of a change. They remain
necessary, but do not provide the intended second opinion.

### Keep AI review optional and non-blocking

Rejected because optional feedback can be skipped or ignored and therefore does not
provide consistent assurance across pull requests. MiKode is willing to make the review a
gate and explicitly handle incorrect findings or exceptional failures.

## Consequences

### Positive

- Every ready pull request receives a separate pass focused on finding faults rather than
  completing the implementation.
- The reviewer can expose regressions, missing tests, ignored skills, and weak solutions
  that the implementing agent did not identify.
- Evidence from the review gives the maintainer more confidence in unfamiliar or
  specialized areas while preserving human judgment.
- Review policy can improve or change providers without rewriting the historical
  decision to use an AI second opinion.

### Negative

- Reviews consume additional tokens, money, and time before a pull request can merge.
- Provider unavailability, exhausted quota, or invalid output can delay otherwise valid
  changes.
- Incorrect or low-value findings require maintainer attention and an explicit resolution.
- The reviewer can share blind spots with the implementing agent and cannot guarantee
  correctness.

## Related standards

- [Automated pull request review standard](../standards/automated-pull-request-review.md)
- [Continuous integration standard](../standards/continuous-integration.md)

## References

- [ADR 0013: Keep external validations manual by default](0013-keep-external-validations-manual-by-default.md)
- [Engineering issue #26](https://github.com/Mikode13/engineering/issues/26)
