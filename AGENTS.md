# AGENTS.md

## Repository purpose

`mikode-engineering` is the source of truth for MiKode engineering decisions, standards,
policies, reusable documentation templates, and shared development practices.

This repository documents:

- What MiKode projects should do.
- Why cross-project technical decisions were made.
- How those decisions should be applied consistently.
- Which reusable templates projects should copy or adapt.

This repository does not contain the production implementation of MiKode libraries or
applications.

Examples:

```text
mikode-engineering
→ Engineering decisions, standards, policies, and templates.

mikode-code-style
→ Published implementation of the shared code-formatting configuration.

mikode-http
→ HTTP client library.

mikode-di
→ Dependency injection package, if created in the future.
```

Keep documentation and implementation separate.

---

## Scope

This repository may contain:

- Engineering standards.
- Architecture Decision Records (ADRs).
- Engineering handbook documents.
- Reusable file templates.
- Naming and repository conventions.
- Package-management policies.
- Formatting and linting policies.
- TypeScript standards.
- Testing standards.
- Versioning and release policies.
- Licensing policies.
- Security and dependency-management policies.
- Links to packages that implement a documented standard.

This repository must not contain:

- Production source code for other MiKode packages.
- Publishable ESLint, Prettier, TypeScript, or testing packages.
- Application-specific business logic.
- HTTP client implementation.
- UI components.
- Dependency injection implementation.
- Framework-specific code that belongs to another repository.
- Duplicated documentation copied from individual packages.
- Decisions that apply to only one project unless they are useful as a documented example.

If a configuration needs to be published or consumed as a dependency, it belongs in its
own repository.

---

## Expected repository structure

```text
mikode-engineering/
├── README.md
├── AGENTS.md
├── adr/
│   ├── README.md
│   └── NNNN-short-decision-title.md
├── standards/
│   ├── README.md
│   └── standard-name.md
├── handbook/
│   ├── README.md
│   └── topic-name.md
└── templates/
    ├── README.md
    └── reusable-file.template
```

Create directories only when they contain or are about to contain useful documentation.
Do not introduce empty structures merely to anticipate possible future needs.

---

## Document responsibilities

### `README.md`

The root README is the navigation entry point.

It should explain:

- What this repository is.
- Who should use it.
- How its documents are organized.
- Which standards are currently active.
- Which ADRs are accepted or proposed.
- How to suggest or document a new decision.

The README should link to documents rather than duplicating their full content.

### `adr/`

ADRs record significant technical decisions and their reasoning.

Keep ADR files in one flat, chronological sequence. Use the controlled `Domains` and
free-text `Applies to` Markdown metadata defined in `adr/README.md` so decisions remain
searchable without domain directories.

An ADR answers:

> Why was this decision made, which alternatives were considered, and what consequences
> were accepted?

Examples:

```text
adr/0001-use-pnpm.md
adr/0002-use-prettier.md
adr/0003-use-eslint.md
```

### `standards/`

Standards define the currently applicable rules.

A standard answers:

> What must, should, or may MiKode projects do now?

Examples:

```text
standards/package-management.md
standards/code-formatting.md
standards/licensing.md
standards/typescript.md
```

### `handbook/`

The handbook contains broader engineering guidance that is not a single enforceable
technical standard.

Examples:

- How technical decisions are made.
- How AI-generated code should be reviewed.
- How to approach code review.
- How to manage technical debt.
- How to balance simplicity and extensibility.

### `templates/`

Templates contain reusable starting files.

Examples:

```text
templates/LICENSE.template
templates/ADR.template.md
templates/CONTRIBUTING.template.md
```

Templates must use explicit placeholders where values differ by project.

Example placeholders:

```text
{{PROJECT_NAME}}
{{PACKAGE_NAME}}
{{YEAR}}
{{LICENSOR_NAME}}
```

---

## ADR and standard separation

Do not mix the historical reasoning with the active rule.

Example:

```text
adr/0002-use-prettier.md
→ Explains why Prettier was selected over Biome, dprint, and Oxfmt.

standards/code-formatting.md
→ Defines the exact formatting rules and how projects apply them.
```

The ADR may remain unchanged even when implementation details evolve.

The standard should reflect the currently active policy.

If a decision changes:

1. Create a new ADR.
2. Mark the previous ADR as superseded.
3. Update the related standard.
4. Update README indexes and cross-links.

Do not rewrite an accepted ADR to make it appear that the original decision was
different.

---

## Decision workflow

When documenting a cross-project technical decision, follow this sequence:

1. Confirm the decision affects more than one MiKode project.
2. Define the problem and constraints.
3. Research realistic alternatives.
4. Compare trade-offs without assuming the preferred answer.
5. Create an ADR with `Proposed` status.
6. Record the selected decision and consequences.
7. Change the ADR status to `Accepted` when the decision is confirmed.
8. Create or update the corresponding standard.
9. Create or update a template when projects need a reusable file.
10. Link any independent package that implements the standard.
11. Update the root README and relevant directory indexes.
12. Check all relative links.

Do not create a new ADR for trivial editorial changes or project-local implementation
details.

---

## ADR format

Use this structure unless a documented reason requires otherwise:

```md
# ADR NNNN: Decision title

- Status: Proposed | Accepted | Superseded | Deprecated
- Date: YYYY-MM-DD
- Domains: Shared, Frontend, Backend, and/or Delivery
- Applies to: explicit repository, project, or technology scope
- Supersedes: ADR NNNN, when applicable
- Superseded by: ADR NNNN, when applicable

## Context

Describe the problem, constraints, and why a decision is required.

## Decision

State the selected decision clearly.

## Alternatives considered

Describe realistic alternatives and why they were not selected.

## Consequences

### Positive

List meaningful benefits.

### Negative

List accepted costs, limitations, and risks.

## Related standards

Link to the active standards created or changed by this decision.

## References

Link to primary or authoritative sources when external facts support the decision.
```

### ADR naming

Use:

```text
NNNN-short-decision-title.md
```

Examples:

```text
0001-use-pnpm.md
0002-use-prettier.md
0003-adopt-source-available-licensing.md
```

Numbers are sequential and must not be reused.

Use lowercase `kebab-case` and keep every ADR directly under `adr/`; domains belong in
metadata and the index, not in the file path.

---

## Standard format

Use this structure unless the standard is so small that a section would add no value:

```md
# Standard title

- Status: Draft | Active | Deprecated
- Last reviewed: YYYY-MM-DD
- Related ADRs: links

## Scope

Explain which repositories, packages, or project types must follow the standard.

## Rules

Define the active requirements.

## Required configuration

Show exact configuration or commands when needed.

## Exceptions

Explain when a project may deviate and how that deviation should be documented.

## Adoption

Explain how existing and new projects apply the standard.

## References

Link to related ADRs, templates, packages, and authoritative documentation.
```

---

## Normative language

Use these terms consistently:

- **MUST**: mandatory.
- **MUST NOT**: prohibited.
- **SHOULD**: recommended unless there is a documented reason to deviate.
- **SHOULD NOT**: generally discouraged unless justified.
- **MAY**: optional.

Do not use strong normative language for a preference that has not been formally
accepted.

When an exception is allowed, state how it must be documented.

---

## Current architectural boundaries

The current separation is:

```text
mikode-engineering
├── Documents decisions and standards.
├── Stores reusable templates.
└── Links to implementation repositories.

Independent package repositories
├── Implement reusable tooling or libraries.
├── Own their source code and release process.
└── Reference relevant MiKode engineering standards.
```

For example, the code-formatting policy may be documented here, while the consumable
configuration is published independently as:

```text
@mikode/code-style
```

Do not move that package into this repository merely because it implements an
engineering standard.

---

## Licensing policy documentation

Licensing documentation belongs in:

```text
standards/licensing.md
```

The reusable license source belongs in:

```text
templates/LICENSE.template
```

Each software repository must still contain its own completed `LICENSE` file.

The template is not the effective license for another repository until:

- All placeholders are replaced.
- The file is copied to the target repository.
- The target package metadata references it correctly.
- The file is included in the published artifact.

Do not present legal guidance as guaranteed legal protection.

When licensing terms materially change, create an ADR.

---

## Formatting policy documentation

The code-formatting decision should be represented by:

```text
adr/NNNN-use-prettier.md
standards/code-formatting.md
```

The standard may reference the independent shared package:

```text
@mikode/code-style/prettier
```

The implementation of that package must not be copied into this repository.

Configuration snippets may appear in documentation when they clarify the standard, but
the external package remains the executable source.

---

## Research and references

When a decision depends on current tool behavior, versions, licensing terms, standards,
or compatibility:

- Use current authoritative sources.
- Prefer official documentation and specifications.
- Record links in the ADR references.
- Distinguish facts from opinions.
- Record the date when version-sensitive research was performed.
- Avoid unsupported claims such as “tool X is always faster” or “tool Y is the industry
  standard” without context.

Do not copy long passages from external sources.

Summarize the relevant facts and link to the source.

---

## Writing conventions

Documentation should be:

- Direct.
- Concise.
- Actionable.
- Specific about scope.
- Explicit about consequences.
- Free from marketing language.
- Written so the decision can be understood without chat history.

Use:

- Markdown.
- UTF-8.
- LF line endings.
- Lowercase `kebab-case` filenames.
- Descriptive headings.
- Relative links for files inside this repository.
- Fenced code blocks with a language identifier when applicable.

Avoid:

- Large unstructured documents.
- Repeating the same explanation in multiple files.
- Vague statements such as “follow best practices.”
- Rules without examples when the implementation is not obvious.
- Empty sections.
- Decorative complexity.

The repository documentation should use one primary language consistently. Unless the
repository explicitly adopts another language, use English for file content and
filenames.

---

## Scope control

Do not expand a small task into a full engineering platform.

Examples:

- A formatting decision does not require introducing linting, CI, testing, and release
  automation in the same change.
- A license template does not require creating a legal policy for every future business
  model.
- Choosing pnpm does not require immediately building a monorepo.
- Documenting ESLint does not require implementing a shared ESLint package here.

Complete one decision before opening the next when possible.

Prefer a small accepted standard over a large speculative handbook.

---

## Rules for agents

When working in this repository, agents MUST:

1. Inspect the current repository structure before creating files.
2. Preserve the separation between decisions and implementations.
3. Determine whether a change belongs in an ADR, standard, handbook document, template,
   or another repository.
4. Avoid inventing decisions that have not been agreed.
5. Keep proposed decisions marked as `Proposed`.
6. Update standards only when a decision is accepted or the user explicitly requests
   the update.
7. Keep ADR history intact.
8. Update root and directory indexes when documents are added, renamed, deprecated, or
   superseded.
9. Classify every ADR with controlled domains and an explicit applicability statement.
10. Use relative links for repository documents.
11. Check for duplicated or conflicting rules.
12. Keep examples aligned with the active standards.
13. Avoid adding executable package implementations.
14. Avoid adding unnecessary tooling to this repository.
15. Explain meaningful trade-offs before recommending a cross-project standard.
16. Add references for version-sensitive or legally significant claims.
17. Make the smallest coherent change that completes the requested task.
18. Clearly identify assumptions and unresolved decisions.
19. Check formatting and links before considering a documentation change complete.

Agents MUST NOT:

- Add another project’s production code.
- Publish packages from this repository unless its purpose is explicitly changed.
- Treat recommendations as mandatory standards without approval.
- Replace an accepted ADR to hide historical context.
- Create duplicate ADR numbers.
- Add speculative folders and documents unrelated to the current work.
- Add a tool merely because it is popular.
- Claim a legal template guarantees immunity from liability.
- Describe source-available software as OSI open source when its license restricts
  commercial use or sale.

---

## README maintenance

When adding a document:

1. Add it to the relevant directory README, if one exists.
2. Add it to the root README when it is a primary standard or accepted ADR.
3. Include a one-line description.
4. Keep links ordered consistently.
5. Remove or update links when a document is renamed or deprecated.

The root README should remain a navigation document, not a full copy of all standards.

---

## Template rules

Templates MUST:

- Use clear placeholders.
- State where the generated file should be placed.
- Avoid project-specific values.
- Include all required legal or technical text.
- Be reviewed when the related standard changes.

Templates SHOULD include a short comment or companion documentation explaining:

- Required replacements.
- Optional replacements.
- Validation steps.
- Related standards.

Do not modify official license language casually.

If a template combines multiple legal texts or adds restrictions, document the source
and version of each text.

---

## Change review checklist

Before completing a change, verify:

- [ ] The content belongs in `mikode-engineering`.
- [ ] The correct document type was used.
- [ ] The scope is explicit.
- [ ] Mandatory and optional rules are distinguishable.
- [ ] The ADR and standard do not duplicate each other unnecessarily.
- [ ] File names use lowercase `kebab-case`.
- [ ] ADR numbering is sequential and unique.
- [ ] Status, dates, domains, and applicability are present where required.
- [ ] Relative links work.
- [ ] Indexes are updated.
- [ ] External factual claims have reliable references.
- [ ] Templates contain placeholders instead of project-specific values.
- [ ] No implementation package has been added to this repository.
- [ ] No unrelated future work was introduced.

---

## Definition of done

A documentation change is complete when:

- The correct artifact has been created or updated.
- The decision status is accurate.
- The active standard is clear and actionable.
- Related ADRs, standards, templates, and packages are cross-linked.
- Indexes are current.
- Links have been checked.
- The repository boundaries remain intact.
- No unresolved assumption is presented as an accepted decision.
- The change can be understood without reading the original conversation.

---

## Current direction

The immediate purpose of this repository is to document and standardize the foundations
shared by MiKode projects, one decision at a time.

Current or near-term topics include:

- Package management with pnpm.
- Code formatting with Prettier.
- Shared code-style configuration through an independent package.
- Licensing policy and reusable license templates.
- ESLint.
- TypeScript configuration.
- Testing and release practices later.

Do not implement all of these topics in a single change.

The working principle is:

> Document the decision here, implement reusable tooling in an independent package, and
> apply both in each project deliberately.
