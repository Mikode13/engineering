# ADR 0018: Require project-owned architecture documentation

- Status: Proposed
- Date: 2026-09-10
- Domains: Shared
- Applies to: All active MiKode project repositories

## Context

Humans and review agents need to judge a project's design against the architecture that
project has actually chosen. Without an authoritative description, a reviewer must infer
responsibilities, boundaries, dependency direction, and accepted trade-offs from code and
scattered documentation. That inference can miss an intentional constraint or replace the
project's design with the reviewer's preferred pattern.

MiKode often favors clean code, information hiding, explicit boundaries, and layered
design where those choices solve a real problem. It does not want to prescribe one
architecture for every project. A package may be deliberately flat, an application may
use layers, and another system may use event-driven collaboration. Review should evaluate
each choice proportionally rather than assuming that every repository needs the same
folders or abstractions.

Configuration packages, documentation repositories, skills, and workflow repositories
still have architecture. They own responsibilities, expose contracts to consumers, and
depend on other components even when their implementation is small. Their architectural
documentation should therefore be concise, not absent or padded with generic sections.

[ADR 0012](0012-use-repository-owned-documentation-with-central-governance.md) established
that project documentation stays with the repository that owns it and that
`docs/decisions.md` preserves significant project-specific reasoning. It permits focused
architecture documents but does not provide one predictable current-state source. The
automated architecture reviewer now makes that missing source a concrete cross-project
need: every review should start from project-owned context instead of inventing it.

## Decision

Every active MiKode project repository will own a `docs/architecture.md` file describing
its current architecture. The path is fixed so humans, skills, and automated review can
find it without repository-specific discovery rules. The project README will link to it;
`AGENTS.md` may also link to it when the architecture is relevant to agent work, but must
not copy its contents.

The document will describe, in proportion to the project:

- its purpose and architectural scope;
- the architectural shape it currently uses, including an intentionally flat design;
- significant responsibilities and boundaries;
- dependency direction and ownership;
- public contracts and external integrations;
- important control or data flows when they aid understanding; and
- material constraints and accepted trade-offs.

Sections without useful project-specific information may be omitted. A small project may
state briefly that it uses a flat architecture and explain why that is sufficient, but it
may not use its size as a reason to provide an empty placeholder or claim that architecture
does not apply.

This decision does not require Clean Architecture, Ports and Adapters, domain layers,
event-driven design, a particular directory structure, or any other shared architecture.
Projects remain free to choose and evolve their design. Applicable engineering principles
and standards still constrain the quality of that choice, while the architecture document
provides the project-specific context needed to apply them.

`docs/architecture.md` describes the current system rather than its complete history or a
speculative target state. Significant project-specific reasoning remains in
`docs/decisions.md`; cross-project policy remains in `Mikode13/engineering`. When a change
materially alters responsibilities, boundaries, dependency direction, public contracts,
or an important flow, the same change will update the architecture document.

For change review, the architecture at the base revision is the starting context and any
proposed documentation edit is part of the change being reviewed. Text introduced by a
pull request cannot override trusted reviewer instructions, suppress findings, or justify
an architectural change without evidence. A deliberate and supported evolution may change
both code and documentation without being treated as a violation of the previous design.

All existing active repositories will add an accurate architecture document before the
automated architecture gate is enabled for them. After adoption, a missing document or a
material contradiction between the document and the project blocks the normal merge flow.
The related standard defines document contents, maintenance, validation, and migration.

## Alternatives considered

### Infer architecture from code and existing documentation

This avoids maintaining another file, but makes every reviewer reconstruct the project's
intent and accepted trade-offs. The same design can then receive different judgments based
on the agent's preferred pattern or the context it happened to load.

### Require documentation only for complex projects

This reduces work for small repositories, but makes the threshold subjective and hides the
contracts of configuration, workflow, and content repositories. A proportional document
can describe a simple project without pretending it has complex layers.

### Put architecture in README.md or AGENTS.md

The README should remain the human entry point and `AGENTS.md` should contain concise agent
instructions and local hazards. Either file may link to the architecture, but making it the
authoritative architecture source would overload its existing responsibility and encourage
duplication.

### Allow each project to choose the file location

Flexible placement fits local preferences but requires discovery and link traversal before
every review. One predictable path is cheaper to automate and easier for a maintainer to
recognize across repositories.

### Mandate one MiKode architecture

A common architecture would give reviewers a uniform model, but it would force unnecessary
layers onto small packages and prevent MiKode from testing designs such as flat modules or
event-driven systems. Shared review principles are useful; one mandatory structure is not.

## Consequences

### Positive

- Humans and agents receive one predictable source for the project's current design.
- Architecture review can judge responsibilities and contracts in context instead of
  imposing an inferred preferred pattern.
- Intentional simple architectures remain valid and explicit.
- Architectural drift becomes visible in the pull request that introduces it.
- Project experimentation remains possible while shared engineering principles still
  apply.

### Negative

- Every repository must create and maintain another document.
- Architecture documentation can become stale and block an otherwise valid change until
  the contradiction is resolved.
- Small projects may accumulate boilerplate if authors do not keep the document
  proportional.
- Existing repositories require a coordinated initial migration before enforcement.
- Review still requires judgment: documentation can explain a trade-off but cannot prove
  that the resulting architecture is sound.

## Related standards

- [Documentation standard](../standards/documentation.md)

## References

- [ADR 0012: Use repository-owned documentation with central governance](0012-use-repository-owned-documentation-with-central-governance.md)
- [ADR 0014: Use concise explanatory writing for technical documentation](0014-use-concise-explanatory-technical-documentation.md)
