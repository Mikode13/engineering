# Documentation standard

- Status: Active
- Last reviewed: 2026-08-30
- Related ADRs: [ADR 0012: Use repository-owned documentation with central governance](../adr/0012-use-repository-owned-documentation-with-central-governance.md)

## Scope

This standard applies to MiKode repositories and organization-wide documentation. It
defines documentation ownership, the baseline project artifacts, project decision logs,
and the distribution of shared documentation.

It does not define MiKode's editorial language or writing style. Those rules require a
separate decision.

## Ownership

Documentation MUST have one authoritative owner:

| Information                                                                   | Authoritative location                       |
| ----------------------------------------------------------------------------- | -------------------------------------------- |
| Project purpose, usage, navigation, and supporting documentation              | The owning project's `README.md` and `docs/` |
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
- `LICENSE` as the effective license included in repository history and distributed
  artifacts when applicable.

The repository MUST create `docs/decisions.md` when it records its first significant
project-specific decision. It MUST NOT create an empty placeholder decision log during
initialization.

Projects MAY add maintained documents under `docs/` for project concepts, architecture,
or operations. Those documents MUST NOT establish a project-local ADR sequence, status
lifecycle, or numbering system.

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

## Central templates and GitHub defaults

`Mikode13/engineering` MUST own the canonical reusable documentation templates. A project
MUST receive a completed local copy of every required project artifact and becomes the
owner of that copy. A central template is not an effective substitute for the local
document.

`Mikode13/.github` MAY provide GitHub-supported organization profile and community health
defaults. A project MAY override an inherited default with a local file when its needs
differ.

Organization defaults MUST NOT contain confidential information. Documentation required
inside a clone, project history, package, or download MUST live in the owning repository
and MUST NOT rely on GitHub inheritance.

## Adoption

New MiKode project repositories MUST start with completed `README.md`, `AGENTS.md`, and
`LICENSE` files. Existing repositories MUST add any missing baseline artifact when they
adopt this standard.

Repositories MUST add `docs/decisions.md` only when they have a significant
project-specific decision to record. Adoption MUST NOT create empty documentation files
or directories.

Future project initialization and documentation tooling MUST consume this standard and
the canonical templates. Tooling MUST NOT define an independent documentation policy.

## References

- [ADR 0012: Use repository-owned documentation with central governance](../adr/0012-use-repository-owned-documentation-with-central-governance.md)
- [Licensing standard](licensing.md)
- [GitHub: Creating a default community health file](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [AGENTS.md open format](https://agents.md/)
