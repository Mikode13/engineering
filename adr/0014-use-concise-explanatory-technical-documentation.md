# ADR 0014: Use concise explanatory writing for technical documentation

- Status: Proposed
- Date: 2026-08-31
- Domains: Shared
- Applies to: MiKode technical documentation across repositories and organization-wide engineering documents

## Context

MiKode documentation is public and should be understandable by a competent software
engineer who does not already know the project. It should explain enough context to make
project-specific decisions, architecture, usage, and limitations clear without turning
every document into a tutorial on general software engineering concepts.

Documentation also needs to remain useful when revisited later. A reader should be able
to scan headings and jump directly to installation, architecture, a limitation, or another
specific topic without reading the document from the beginning.

Generated documentation can easily become repetitive, overly polished, or longer than the
information requires. Common failure modes include restating the same conclusion after it
has already been explained, describing obvious facts, adding decorative examples, and
using promotional language instead of precise technical language. These patterns increase
reading cost without increasing understanding.

MiKode therefore needs a shared writing policy that favors explanation over decoration:
write enough to remove ambiguity, then stop. Examples, diagrams, and references should be
used when they improve understanding, not as mandatory decoration.

## Decision

MiKode technical documentation will use a concise, technical, and explanatory style.
Documents will prioritize understanding, precision, and navigability over literary polish
or exhaustive coverage.

The intended reader is a competent software engineer who may be unfamiliar with MiKode.
Documentation will explain how a concept is used or constrained inside MiKode rather than
re-teaching generally known engineering concepts. When broader background is useful, the
document should link to an authoritative source instead of reproducing a tutorial.

Documents will be structured for scanning as well as sequential reading. Headings should
describe the information a reader can find in the section. Established structural headings
such as `Context`, `Decision`, or `Consequences` remain appropriate where the document type
requires them.

Examples will be small and focused on the concept being explained. An example should be
omitted when the text is already unambiguous. When a useful example is too large to remain
focused, it should live in a maintained example, dedicated repository, or other appropriate
source and be linked from the documentation.

Diagrams should be used when relationships, flows, boundaries, or architecture are easier
to understand visually than through prose alone. This decision does not mandate one
diagram format.

Important external facts and technical claims should link to authoritative references when
the reference helps the reader verify or deepen the explanation. MiKode documents should
link to an existing authoritative MiKode source instead of duplicating its complete rules.

Current documentation should describe the current system. Historical reasoning belongs in
ADRs, project decision logs, and Git history. A document may mention an explicitly
undecided future direction when useful, but it must not present unimplemented work as
current behavior or link to decisions and artifacts that do not exist.

README files will act as project entry points. They should provide enough information to
understand what the project is, why it exists, its current status, how to install it, and
how to run or use it for the first time. Architecture, major components, and deeper topics
may remain in the README when concise or move to focused documents under `docs/` and be
linked from the README.

Known limitations will be stated directly when they affect how a reader should understand
or use the project. Technical documentation will not hide limitations to make a project
appear more complete.

Normal project documentation and README files will use natural language. Normative terms
such as `MUST`, `SHOULD`, and `MAY` remain primarily for standards and other documents that
intentionally define requirements.

`MiKode` and `we` may both be used when their meaning is clear. Writers should choose the
form that makes the sentence natural and avoids repetitive wording.

## Alternatives considered

### Use extremely terse reference documentation

This would minimize maintenance and reading time, but it would leave project-specific
reasoning, architecture, and ambiguous behavior unexplained. MiKode prefers concise
explanation rather than minimum word count.

### Use comprehensive tutorial-style documentation

This would make documents more accessible to inexperienced readers, but it would repeat
widely available engineering knowledge and make project-specific information harder to
find. MiKode documentation assumes baseline software engineering knowledge and explains
what is specific to the project.

### Let each repository define its own writing style

This would maximize local freedom, but public MiKode repositories would drift in tone,
structure, detail, and expectations. A shared policy gives maintainers and documentation
agents a common target while still allowing each document type to use the structure that
fits its purpose.

## Consequences

### Positive

- Readers can find specific information without reading every document sequentially.
- Documentation remains explanatory without accumulating unnecessary prose.
- Examples, diagrams, and references are used for understanding rather than decoration.
- Shared technical documentation has a recognizable voice across MiKode repositories.
- Project documentation stays focused on current behavior while ADRs and decision logs
  preserve historical reasoning.
- Documentation agents have explicit constraints against repetition, promotional language,
  and speculative content.

### Negative

- Deciding when an explanation, example, or diagram adds value still requires editorial
  judgment.
- Assuming baseline engineering knowledge means some readers may need external background
  material.
- Diagrams and external examples add maintenance work when they are used.
- Separating detailed topics into `docs/` can introduce navigation overhead if links are
  not maintained carefully.

## Related standards

- [Documentation standard](../standards/documentation.md)
- [Documentation writing standard](../standards/documentation-writing.md)

## References

- [ADR 0012: Use repository-owned documentation with central governance](0012-use-repository-owned-documentation-with-central-governance.md)
