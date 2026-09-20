# Learnings

Learnings record what MiKode work taught us: GitHub behaviour we only found by running it,
how a model behaves in a role, and the process mistakes we made. Without a record, that
knowledge stays in closed pull requests, run logs, and chat sessions until it is forgotten.

## How a learning differs from a decision or a rule

- A [standard](../standards/README.md) states a current requirement.
- An [ADR](../adr/README.md) preserves a decision and its trade-offs.
- A learning states what happened and what it taught. When it justifies a rule, the rule
  lives in a standard or an ADR, and the learning links there instead of restating it.

## Format

Keep one file per initiative or topic. Number learnings inside the file and group them by
theme. Each learning states:

- what happened and what it taught;
- its evidence: a pull request, a run, or a commit; and
- where it is enforced now, when it is enforced anywhere.

Add to the topic's file as work produces new learnings. Prefer a learning that would
change what a reader does over a record of activity.

## Topics

- [Automated pull request review](automated-pull-request-review.md) records what the
  pilot in `Mikode13/slop-lab` taught before the reviewer moved to `Mikode13/.github`.
  It complements the [automated pull request review standard](../standards/automated-pull-request-review.md).
