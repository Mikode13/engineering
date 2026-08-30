# ADR 0012: Use repository-owned documentation with central governance

- Status: Proposed
- Date: 2026-08-29
- Domains: Shared
- Applies to: MiKode repositories and organization-wide documentation

## Context

MiKode documentation is expected to be authored primarily by coding agents after guided
interviews and then reviewed by a maintainer. This reduces the maintainer's writing burden,
but unconstrained generation can produce inconsistent structures, excessive detail,
generic prose, duplicated guidance, and documents whose intended audience or authority is
unclear. Humans and agents both need predictable entry points and a clear way to determine
where information belongs.

Three ownership scopes must remain distinct:

- project-specific documentation must remain available with the project version it
  describes;
- cross-project engineering decisions, standards, and reusable templates need one
  authoritative home; and
- GitHub-specific organization defaults should be managed once when GitHub can inherit
  them safely.

Project decisions also need a durable but lightweight record. Small implementation choices
do not justify a separate document when the code can communicate them. More significant
project choices should remain easy to review, reuse, and revisit without creating a
second local ADR system beside the organization-wide ADR sequence.

GitHub can inherit supported community health files from a public `.github` repository
when a repository has no local version. Those inherited files are displayed by GitHub but
are not present in the consuming repository's clone, history, package, or download. GitHub
does not support an inherited default license, so an effective `LICENSE` must remain in
each repository. These behaviors were verified against the official documentation on
2026-08-29.

The language and writing style of MiKode documentation require a separate decision. This
ADR defines ownership, required artifacts, and information architecture without defining
the complete editorial rules that a documentation agent will apply.

## Decision

MiKode will keep project documentation in the repository that owns the project while
governing cross-project documentation centrally in `Mikode13/engineering` and
GitHub-specific organization defaults in `Mikode13/.github`.

### Documentation ownership

| Information                                                                   | Authoritative location                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------- |
| Project purpose, usage, and navigation                                        | The project's `README.md` and local `docs/`    |
| Instructions and context for coding agents                                    | The project's root `AGENTS.md`                 |
| Effective licensing terms                                                     | The project's root `LICENSE`                   |
| Significant project-specific decisions                                        | The project's `docs/decisions.md`              |
| Cross-project decisions, standards, handbook guidance, and reusable templates | `Mikode13/engineering`                         |
| Supported organization profile and community health defaults                  | `Mikode13/.github`                             |
| Reusable GitHub workflows                                                     | `Mikode13/.github`, as established by ADR 0010 |

Every MiKode project repository must contain the following artifacts from initialization:

- `README.md`, as the concise human entry point and navigation document;
- `LICENSE`, completed for that repository and included in its history and distributed
  artifacts when applicable;
- `AGENTS.md`, as the predictable root entry point for agent-specific project context and
  instructions.

The repository must create `docs/decisions.md` when it records its first significant
project-specific decision. It must not create an empty placeholder decision log during
project initialization. The log is plain Markdown and requires no tool-specific front
matter.

### Recording project decisions

MiKode will not maintain project-local ADR directories, numbering sequences, or status
lifecycles.

Small implementation choices should remain explicit in the code through clear names,
types, tests, and comments when a comment adds information the code cannot express. They
must not be copied into `docs/decisions.md` merely to create an exhaustive activity log.

A significant project-specific choice must be appended to `docs/decisions.md` when its
rationale, consequences, or other useful context would help a future maintainer understand
why the project has its current shape. Each entry must contain:

- a descriptive heading and optional inline tags;
- **Decision**;
- **Context**;
- **Consequences**.

An entry may also contain **Alternatives considered** when alternatives were genuinely
evaluated and **Lesson** when the decision produced a useful transferable insight. These
sections must not be added as empty or formulaic placeholders.

The log is chronological and remains one Markdown file per project. Additional files in
`docs/` may explain project concepts, operations, or architecture when they deserve their
own maintained document, but they do not form a local ADR system.

When a decision becomes applicable across MiKode projects, it must be proposed through
the organization-wide ADR process in `engineering`. The project decision log may link to
that ADR or standard for context but should not duplicate its complete rules.

### Central governance and distribution

`engineering` will own the canonical reusable documentation templates. Each project will
receive completed copies and will own those files in its repository; a template in
`engineering` is not an effective substitute for a local project document. Local
documents may contain project-specific information while linking to central standards
instead of copying them.

The public organization `.github` repository will own GitHub-supported defaults such as
the organization profile, contribution and security guidance, support and governance
files, codes of conduct, and issue or pull request templates. A project may provide a
local version when its requirements differ. Because the central repository and inherited
files are public, they must not contain confidential information. Required project
artifacts and documentation needed in a clone must not rely on GitHub inheritance.

MiKode will provide one general documentation skill as the agent entry point for
documentation work. It will determine what should be written, select the owning
repository and file, apply the relevant template and editorial standard, and route a
cross-project decision to the ADR workflow. It will consume the standards established in
`engineering`; it will not define policy independently. Project initialization will use
the same canonical templates so generated repositories and later documentation changes
follow one model.

Documents will have one authoritative source. Other locations should use relative links
within a repository, or stable links across repositories, rather than maintaining copied
explanations.

## Alternatives considered

### Keep all documentation in `engineering`

A central repository would make organization-wide discovery simple, but project
documentation would no longer travel with the code or match the checked-out version. It
would also turn `engineering` into a duplicate project wiki and weaken repository
ownership, so only cross-project governance and reusable templates will be centralized.

### Keep every document independently in every project

Fully local ownership would make each clone self-contained, but copying cross-project
standards, community guidance, and reusable templates into every repository would create
drift and repetitive maintenance. Projects will instead own project-specific artifacts
and link to central sources for shared policy.

### Use an external documentation portal or wiki as the source of truth

A dedicated portal could provide richer navigation and search. It was not selected
because it introduces another publication system, separates documentation from reviewed
code changes, and is unnecessary at MiKode's current scale. A portal may later present or
index repository-owned sources without replacing them.

### Create local ADRs in every project

Local ADR sequences would provide a formal status and numbering model for each project,
but they would add ceremony, fragment discovery, and blur the boundary with cross-project
ADRs. A single narrative decision log is sufficient for project-specific learning and
rationale.

### Let each agent choose the document structure

Agent autonomy would require less governance initially, but it would reproduce the
inconsistent, verbose, and generic documentation this decision is intended to prevent.
Agents will work from shared templates and standards while the maintainer retains review
authority.

## Consequences

### Positive

- Documentation remains versioned with the project it describes and is available in a
  clone.
- Humans and agents receive predictable entry points in every repository.
- One lightweight decision log preserves project rationale without creating local ADR
  bureaucracy.
- Cross-project policy has one source of truth, reducing duplicated and conflicting
  guidance.
- GitHub-supported defaults can be changed once for the organization while projects
  retain an explicit override path.
- Plain Markdown decision logs remain portable across documentation tools.
- A single documentation skill and shared templates can produce consistent results during
  initialization and later maintenance.

### Negative

- Every repository must maintain three baseline artifacts even when its documentation is
  initially small, and repositories with significant decisions must additionally
  maintain a decision log.
- Completed template copies can drift from later central improvements and may require
  deliberate migration.
- A single chronological decision log can become long and will need disciplined entries
  and navigation as a project grows.
- The decision log does not provide the formal status, immutability, or supersession model
  of an ADR.
- Organization defaults inherited from `.github` are not visible in project clones or
  history, so maintainers must understand which guidance is local and which is inherited.
- The public `.github` repository cannot contain private operating details.
- Templates, project initialization, and the documentation skill must evolve together
  when the standard changes.
- Editorial language and style remain pending until their separate ADR is decided.

## Related standards

- [Licensing standard](../standards/licensing.md)

## References

- [GitHub: Creating a default community health file](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file)
- [GitHub: Customizing an organization's profile](https://docs.github.com/en/organizations/collaborating-with-groups-in-organizations/customizing-your-organizations-profile)
- [GitHub: Relative links](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#relative-links)
- [AGENTS.md open format](https://agents.md/)
- [ADR 0010: Use GitHub Actions with centralized reusable CI workflows](0010-use-github-actions-with-centralized-reusable-ci-workflows.md)
