# ADR 0021: Plan delivery in milestones with independently testable issues

- Status: Proposed
- Date: 2026-11-23
- Domains: Shared, Delivery
- Applies to: MiKode projects that select this delivery workflow

## Context

The maintainer wants to start a session on a computer and continue it on a phone.
Demonstrating the whole journey requires the harness, API, storage, deployment and both
clients. A test consumer can receive the expected harness events long before
a mobile client exists. That result lets work on persistence proceed against a known contract.

Today the maintainer often has to tell the agent what to do next or inspect its work to
decide whether a task is finished. We want those decisions to follow from the product
design and the agreed order of work. A discussion or investigation can stay in the
conversation until the maintainer chooses to use this workflow.

## Decision

1. **Build a roadmap from the goal.** Describe what a person should ultimately be able to
   do. Work backwards to identify the capabilities that make it possible. Group them into
   ordered milestones. For each milestone, name the outcome we can demonstrate and what
   that outcome enables next.
2. **Design the milestone before breaking it into issues.** Describe its flows, the
   components involved and the decisions that constrain their interaction. For the API
   this may include the data model and event contracts. Link to the design in the project
   that owns it.
3. **Use GitHub issues as the execution plan.** Each issue names its consumer, the
   capability it delivers, its prerequisites and an observable acceptance example. It
   links to any design decision the implementer needs. Cut the work so the example can
   run as soon as its prerequisites exist. The check must be possible before a later
   milestone delivers the next consumer. Refine existing issues when the design changes.
4. **Give the issue to the implementer.** The harness takes the next issue in the agreed
   order whose prerequisites are met. The issue defines the expected behavior and how to
   observe it. The implementer chooses the code and test design. Where practical, the
   planner or an executor turns the example into an executable check first and verifies
   that it detects the missing behavior. If the check already passes, confirm what work
   remains before changing code. If implementation calls for changing the agreed
   behavior, bring that decision back to the maintainer.
5. **Verify each issue, then demonstrate the milestone.** Record what was checked, on
   which revision and with what result. At the milestone boundary, exercise the combined
   capability through its consumer. This gives the next milestone a verified starting
   point.

For the session example, a test consumer can demonstrate that the harness emits the
agreed events. A separate API issue can demonstrate that a client can read those events
in order after an API restart. A later milestone can demonstrate that the user reopens
the session on a phone and continues with its earlier context. Each check answers a
different question.

## Alternatives considered

- **One issue for the complete user journey.** It captures the goal well, but discovering
  a missing event only after both clients exist delays feedback for every consumer.
- **A checklist of components to build.** Checking off a database or an API endpoint
  records construction while leaving open whether the next component can use it.

## Consequences

### Positive

- The maintainer can review product behavior and dependencies before delegating code.
- Agents can pick up the same issues across sessions and verify progress before the
  whole product is available.

### Negative

- Writing meaningful acceptance examples and keeping issues aligned with the design takes
  time up front.
- A test consumer can pass even when two real components disagree. The milestone
  demonstration still requires integrating them.

## Related standards

- [Testing standard](../standards/testing.md)
- [Documentation standard](../standards/documentation.md)
