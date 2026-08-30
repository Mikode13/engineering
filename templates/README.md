# Templates

Templates are reusable starting files for MiKode projects. Replace every explicit
placeholder, verify the result, and copy the completed file into the target repository.

## Available templates

- [ADR.template.md](ADR.template.md) — starting file for a new Architecture Decision Record.
- [LICENSE.template](LICENSE.template) — MIT License text with the Commons Clause License
  Condition v1.0.
- [Husky hook templates](husky/README.md) — shared pre-push hook for project checks and
  tests.

### ADR.template.md replacements

Copy the completed file to `adr/NNNN-short-decision-title.md` in this repository, using
the next unused sequential number and a lowercase kebab-case title.

Required replacements:

- `{{NUMBER}}` — the four-digit sequential ADR number, for example `0003`.
- `{{DECISION_TITLE}}` — the decision title.
- `{{DATE}}` — the decision date as `YYYY-MM-DD`.
- `{{ALTERNATIVE_NAME}}` — one heading per realistic alternative considered.

Optional replacements:

- `{{SUPERSEDED_NUMBER}}` / `{{SUPERSEDED_FILE}}` and `{{SUPERSEDING_NUMBER}}` /
  `{{SUPERSEDING_FILE}}` — only when the ADR supersedes or is superseded by another ADR;
  remove these lines and the comment above them otherwise.

Replace the guidance sentences in each section with real content, keep the status
`Proposed` until the decision is confirmed, and add the new ADR to the
[ADR index](../adr/README.md) and root README. The full format rules are defined in
[AGENTS.md](../AGENTS.md).

The license template is not legal advice and is not effective for a project until it has
been completed, placed at the target repository's root, referenced by package metadata,
and included in the published artifact. See the [licensing standard](../standards/licensing.md)
for the validation checklist.

### LICENSE.template replacements

Replace all of the following placeholders; none are optional:

- `{{SOFTWARE_NAME}}` — the name of the software the license covers.
- `{{LICENSOR_NAME}}` — the copyright holder granting the license (appears twice).
- `{{YEAR}}` — the copyright year.

### LICENSE.template sources and modifications

The template combines two legal texts:

- [Commons Clause License Condition v1.0](https://commonsclause.com/), reproduced
  unmodified and prepended as the condition notice, as its instructions require.
- [The MIT License](https://opensource.org/license/mit), reproduced with two deliberate
  modifications that bind the two texts together: the permission grant is made
  "subject to the Commons Clause License Condition above", and the notice-preservation
  sentence also requires the Commons Clause License Condition notice to be included in
  copies. The canonical MIT text contains neither reference.

Do not make further changes to either legal text without appropriate legal review, and
record any approved change here and in a new or superseding ADR.
