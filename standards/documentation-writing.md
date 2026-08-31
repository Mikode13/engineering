# Documentation writing standard

- Status: Active
- Last reviewed: 2026-08-31
- Related ADRs: [ADR 0014: Use concise explanatory writing for technical documentation](../adr/0014-use-concise-explanatory-technical-documentation.md)

## Scope

This standard applies to MiKode technical documentation across project repositories and
organization-wide engineering documentation. It defines writing style, information
structure, examples, diagrams, references, README expectations, and treatment of current
and future state.

It complements the [documentation standard](documentation.md), which defines ownership,
baseline artifacts, project decision logs, and distribution.

## Audience

Documentation SHOULD assume a competent software engineer who may not know MiKode.

Documents SHOULD explain MiKode-specific behavior, architecture, constraints, and
reasoning. They SHOULD NOT re-teach generally known engineering concepts when an
authoritative external reference is sufficient.

## Voice and brevity

Documentation MUST be technical, direct, and explanatory.

Writers MUST include enough context to remove meaningful ambiguity and SHOULD stop once
additional prose no longer improves understanding.

Documentation MUST NOT use promotional, grandiose, or decorative language to make a
project sound more impressive.

Documentation SHOULD NOT:

- repeat a conclusion that the preceding explanation already established;
- explain obvious facts that add no project-specific understanding;
- add filler introductions or conclusions;
- use examples only to restate clear prose.

`MiKode` and `we` MAY both be used when their meaning is clear. Writers SHOULD choose the
form that reads naturally and avoids repetitive wording.

## Structure and navigation

Documents MUST use sections when they help readers locate information independently.
Headings SHOULD describe what the section contains.

A document SHOULD support both:

- sequential reading by a first-time reader; and
- scanning by a returning reader looking for one specific topic.

Established structural headings required by a document type, such as `Context`,
`Decision`, and `Consequences` in an ADR, remain valid.

Large topics SHOULD move to focused documents under `docs/` when keeping them in the
entry document would make navigation or maintenance worse. The parent document MUST link
to the authoritative detail instead of duplicating it.

## Explanations and examples

Examples SHOULD be added when they remove ambiguity or make a project-specific concept
meaningfully easier to understand.

Examples MUST be focused on the concept they explain. They SHOULD omit unrelated setup,
boilerplate, and production complexity.

An example SHOULD NOT be added when the text is already clear without it.

When a useful example cannot remain small and focused, the documentation SHOULD link to a
maintained example, dedicated repository, or other appropriate source instead of embedding
a large demonstration inline.

## Diagrams

Documentation SHOULD use diagrams when relationships, flows, boundaries, architecture, or
component interactions are easier to understand visually than through prose alone.

A diagram MUST explain something useful and SHOULD NOT exist only for decoration.

MiKode does not require one diagram format. The chosen format SHOULD fit the document and
remain maintainable by the owning project.

## References and duplication

Important external claims SHOULD link to authoritative references when the source helps a
reader verify or deepen the explanation.

MiKode documentation MUST NOT duplicate the complete rules or explanation of another
authoritative MiKode document. It SHOULD state the local relevance and link to the source.

For example, a project that follows the shared Node.js policy should link to the
[Node.js version standard](nodejs-version.md) rather than restating the organization-wide
policy in full.

## Current, historical, and future state

Project documentation MUST describe the current system and current supported behavior.

Historical reasoning SHOULD remain in ADRs, project decision logs, and Git history rather
than accumulating in operational documentation.

A document MAY mention a future direction when that context is useful, but it MUST make
the undecided or unimplemented status explicit. It MUST NOT:

- describe planned behavior as if it already exists;
- invent a future ADR number, artifact, API, or implementation;
- link to a document or feature that does not exist.

## README expectations

A project README MUST provide or clearly link to the information required to:

- understand what the project is;
- understand why it exists;
- understand its current status and relevant limitations;
- install or prepare it;
- run or use it successfully for the first time.

A README SHOULD also expose the project's architecture and major components when they are
important to understanding the project. Detailed architecture or component documentation
MAY live under `docs/` when that keeps the README easier to navigate.

The README is an entry point and navigation document, not a requirement to place all
project documentation in one file.

## Limitations

Known limitations MUST be stated when they materially affect usage, expectations, or the
reader's understanding of the project.

Documentation MUST NOT hide current limitations to make a project appear more complete.

## Normative language

README files and normal explanatory documentation SHOULD use natural language.

`MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` SHOULD be reserved for standards or
other documents that intentionally define requirements.

## Adoption

New technical documentation SHOULD follow this standard from its first draft.

Existing documentation SHOULD be brought into alignment when it is meaningfully edited.
Adoption MUST NOT trigger broad rewriting solely to normalize tone when no concrete
maintenance need exists.

## References

- [ADR 0014: Use concise explanatory writing for technical documentation](../adr/0014-use-concise-explanatory-technical-documentation.md)
- [Documentation standard](documentation.md)
