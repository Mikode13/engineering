# Documentation standard

- Status: Draft
- Last reviewed: 2026-09-10
- Related ADRs:
  [ADR 0012: Use repository-owned documentation with central governance](../adr/0012-use-repository-owned-documentation-with-central-governance.md),
  [ADR 0018: Require project-owned architecture documentation](../adr/0018-require-project-owned-architecture-documentation.md)

## Scope

This standard applies to MiKode repositories and organization-wide documentation. It
defines documentation ownership, baseline project artifacts, current architecture,
project decision logs, and the distribution of shared documentation.

It does not define MiKode's editorial language or writing style. Those rules require a
separate decision.

## Ownership

Documentation MUST have one authoritative owner:

| Information                                                                   | Authoritative location                       |
| ----------------------------------------------------------------------------- | -------------------------------------------- |
| Project purpose, usage, navigation, and supporting documentation              | The owning project's `README.md` and `docs/` |
| Current project architecture                                                  | The owning project's `docs/architecture.md`  |
| Agent-specific project context and instructions                               | The owning project's root `AGENTS.md`        |
| Effective licensing terms                                                     | The owning project's root `LICENSE`          |
| Significant project-specific decisions                                        | The owning project's `docs/decisions.md`     |
| Cross-project decisions, standards, handbook guidance, and reusable templates | `Mikode13/engineering`                       |
| Supported organization profile and community health defaults                  | `Mikode13/.github`                           |

Other documents SHOULD link to the authoritative source instead of copying its complete
explanation.

## Required project artifacts

Every MiKode project repository MUST contain these completed local files from
initialization:

- `README.md` as the concise human entry point and navigation document;
- `AGENTS.md` as the predictable root entry point for agent-specific context and
  instructions;
- `docs/architecture.md` as the current source for project responsibilities, boundaries,
  dependencies, and contracts;
- `LICENSE` as the effective license included in repository history and distributed
  artifacts when applicable.

The repository MUST create `docs/decisions.md` when it records its first significant
project-specific decision. It MUST NOT create an empty placeholder decision log during
initialization.

Projects MAY add other maintained documents under `docs/` for project concepts or
operations. Those documents MUST NOT establish a project-local ADR sequence, status
lifecycle, or numbering system.

## Architecture documentation

`docs/architecture.md` MUST describe the current architecture owned by the project. It MUST
remain proportional to the repository and contain the project-specific information needed
to understand:

- its purpose and architectural scope;
- its architectural shape, including an intentionally flat design;
- significant responsibilities and boundaries;
- dependency direction and ownership;
- public contracts and external integrations;
- important control or data flows when they aid understanding; and
- material constraints and accepted trade-offs.

A section MAY be omitted when it would contain no useful project-specific information. A
small project MAY explain briefly that a flat architecture is sufficient, but MUST NOT use
an empty placeholder or claim that architecture does not apply. This standard does not
require a shared architecture, layer model, directory structure, or diagram format.

The document MUST describe current behavior. It MUST identify future or undecided designs
as such and MUST NOT duplicate the history kept in `docs/decisions.md` or cross-project
policy from `Mikode13/engineering`. The project README MUST link to it. `AGENTS.md` MAY link
to it when architecture is relevant to agent work, but MUST NOT restate it.

A change that materially alters responsibilities, boundaries, dependency direction,
public contracts, or an important flow MUST update `docs/architecture.md` in the same pull
request. For change review, the base revision remains the starting architectural context;
proposed documentation changes are reviewed with the implementation and cannot override
trusted instructions or suppress supported findings.

After repository adoption, a missing architecture document or a material contradiction
between the document and the project MUST block the normal merge flow. Minor wording drift
or an omitted detail with no architectural consequence MUST NOT be promoted into a
blocking finding merely because the document could be more complete.

## Project decision records

Small implementation choices SHOULD remain explicit in names, types, tests, and useful
code comments. They MUST NOT be copied into `docs/decisions.md` merely to create an
exhaustive activity log.

A significant project-specific choice MUST be appended to `docs/decisions.md` when its
rationale, consequences, or other context would help a future maintainer understand the
project. The file MUST remain a single chronological Markdown log.

Each entry MUST contain:

- a descriptive heading, with optional inline tags;
- **Decision**;
- **Context**;
- **Consequences**.

An entry MAY contain **Alternatives considered** when alternatives were genuinely
evaluated and **Lesson** when the decision produced a useful transferable insight. These
optional sections MUST NOT appear as empty or formulaic placeholders.

The decision log MUST use plain Markdown. It MUST NOT require tool-specific metadata or
front matter.

A decision that applies across MiKode projects MUST be proposed through the ADR process
in `Mikode13/engineering`. A local decision log MAY link to the resulting ADR or standard
but SHOULD NOT duplicate its complete rules.

When a significant project decision changes the current architecture, the decision log
preserves why the change was made and `docs/architecture.md` describes the resulting
current state.

## Central templates and GitHub defaults

`Mikode13/engineering` MUST own the canonical reusable documentation templates, including
the starting template for `docs/architecture.md`. A project MUST receive a completed local
copy of every required project artifact and becomes the owner of that copy. A central
template is not an effective substitute for the local document.

`Mikode13/.github` MAY provide GitHub-supported organization profile and community health
defaults. A project MAY override an inherited default with a local file when its needs
differ.

Organization defaults MUST NOT contain confidential information. Documentation required
inside a clone, project history, package, or download MUST live in the owning repository
and MUST NOT rely on GitHub inheritance.

## Adoption

New MiKode project repositories MUST start with completed `README.md`, `AGENTS.md`,
`docs/architecture.md`, and `LICENSE` files. Existing active repositories MUST add an
accurate `docs/architecture.md` before the automated architecture review gate is enabled
for them. Initial adoption MUST describe the current project instead of a future target or
an unfilled template.

Repositories MUST add `docs/decisions.md` only when they have a significant
project-specific decision to record. Adoption MUST NOT create empty documentation files
or directories.

After every active repository has migrated, applicable repository validation and review
MUST block a missing or materially contradictory architecture document. Rollout work MUST
not silently weaken this requirement into a permanent optional check.

Future project initialization and documentation tooling MUST consume this standard and the
canonical templates. Architecture and documentation skills MUST read this active standard
rather than define an independent documentation policy.

## References

- [ADR 0012: Use repository-owned documentation with central governance](../adr/0012-use-repository-owned-documentation-with-central-governance.md)
- [ADR 0018: Require project-owned architecture documentation](../adr/0018-require-project-owned-architecture-documentation.md)
- [Licensing standard](licensing.md)
- [GitHub: Creating a default community health file](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [AGENTS.md open format](https://agents.md/)
