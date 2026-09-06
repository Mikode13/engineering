# AGENTS.md

## Repository purpose

This repository is the source of truth for cross-project MiKode engineering decisions,
standards, and reusable documentation templates. It documents policy; production code and
consumable packages belong in their owning repositories.

## Read only what the task needs

- Use [the ADR index](adr/README.md) for decision history, status, domains, and ADR
  authoring rules.
- Use [the standards index](standards/README.md) for current requirements and standard
  authoring rules.
- Use [the templates index](templates/README.md) when creating or updating reusable files.
- Follow the [documentation standard](standards/documentation.md) for ownership and
  artifact placement.
- Follow the [documentation writing standard](standards/documentation-writing.md) when
  drafting or revising technical documentation.

Do not load every ADR or standard by default. Read the index first, then open only the
documents relevant to the task.

## Repository rules

- Keep historical reasoning in ADRs and active rules in standards.
- New decisions remain `Proposed` until explicitly accepted.
- Preserve accepted ADR history; record a changed decision in a superseding ADR.
- Do not invent decisions, future artifacts, or implementation details.
- Link to authoritative documents instead of repeating their complete guidance.
- Keep the root README as an entry point; maintain per-document catalogs in their
  directory indexes.
- Update the relevant index when adding, renaming, deprecating, or superseding a document.
- Keep changes focused on the requested decision or documentation need.
- Use English and relative repository links; follow the format and naming rules in the
  relevant index or template.
- Prefer authoritative sources for external claims and record the research date when a
  fact is version-sensitive or legally significant.

## Validation

Install the pinned dependencies when needed, then run:

```sh
pnpm run docs:check
```

A change is complete when the correct artifact and status are used, relevant indexes and
links are current, repository boundaries remain intact, and the validation command passes.
