# Agent context and skill routing standard

- Status: Draft
- Last reviewed: 2026-09-12
- Related ADRs:
  [ADR 0019: Use progressive context and shared skill routing](../adr/0019-use-progressive-context-and-shared-skill-routing.md)

## Scope

This proposal applies to agent-assisted MiKode work and shared skill workflows across
supported hosts. It governs instruction selection and loading. It does not define
multi-agent execution, change task permissions, or prescribe personal conversation habits.

The rules become effective after explicit acceptance. Publishing the router skill alone
does not activate this standard or demonstrate adoption in a host.

## Ownership

| Information                                                                    | Owner                                  |
| ------------------------------------------------------------------------------ | -------------------------------------- |
| Cross-project context policy and canonical entry instruction                   | `Mikode13/engineering`                 |
| Skill descriptions, routing logic, workflow instructions, and routing examples | `Mikode13/skills`                      |
| Local purpose, constraints, risks, commands, and conditional navigation        | The project's `AGENTS.md`              |
| Host setup and deployment instructions                                         | The repository owning that integration |

Shared routing tables and domain workflows MUST NOT be copied into each project. Projects
MUST retain their applicable local instructions; a shared hook is not a replacement for
repository knowledge.

## Selection and loading

1. Use the task's intent, available skill descriptions, and required local context to
   choose the workflow before reading candidate skill bodies. A clearly selected workflow
   MAY run directly; do not require a redundant routing pass.
2. Load selected bodies in full and follow their required references. Progressive loading
   selects relevant documents; it does not permit skipping required parts of selected
   instructions.
3. Delegate internal sequencing and specialist selection to the owning workflow. The
   entry router MUST NOT repeat a complete review or preload every specialist.
4. Resolve applicable current policy when needed, using the task and actual repository
   capabilities. Read ADR history for decision work or reasoning that the task requires,
   not as routine startup context for every local change.
5. Reuse relevant policy sources, revisions, and evidence already resolved within a task.
   Refresh when scope or policy changes. Reuse does not turn stale or unverified policy
   into verified current policy.
6. Preserve required host and repository instructions, review coverage, and ADR approval
   steps. Explain, plan, or review requests MUST NOT become implementation or publication
   merely because the router selects skills capable of those actions.
7. If no workflow fits, use available host capabilities and applicable local guidance.
   If required guidance is unavailable, report the dependency and continue only independent
   work; do not invent policy or silently claim complete coverage.

## Canonical entry instruction

The proposed router is `mikode-router`. After acceptance, adopting hosts and repositories
use this minimal instruction in a location their host actually loads:

```text
For MiKode tasks, use mikode-router to select applicable skills unless the workflow is
already selected. Load only selected guidance. If the router is unavailable, use the
available skill descriptions and report any required guidance you cannot obtain.
```

The standard owns this instruction; the router implementation owns the selection table.
An installation MAY use supported host-level guidance or a minimal project-local caller.
It MUST document and verify its loading mechanism. Do not assume a file in another
repository becomes agent context merely because it exists.

The host integration location remains to be selected during the pilot. This proposal does
not install the hook in any repository or change existing host configuration.

## Validation and adoption

Pilot the accepted guidance in `engineering` before extending it to other repositories.
Use representative tasks for initialization, ADR proposal and acceptance, documentation,
implementation, review, CI, and skill authoring. Include a direct specialist request,
ambiguous intent, and missing guidance.

Record the selected workflow and supporting skills, the documents actually read, and any
required context omitted. Where comparable measurements are available, compare loaded
context or tokens with the prior behavior using equivalent tasks and host conditions.
File length alone MUST NOT be presented as a measured reduction in task token usage.

The pilot passes when routing preserves the requested outcome and applicable requirements,
avoids unrelated skills and routine ADR-history loading, and does not repeat active
workflows. Record unresolved limitations before rolling out caller changes through
reviewable repository PRs. Track this work in
[engineering #29](https://github.com/Mikode13/engineering/issues/29).

New routes are maintained in the skills repository with relevant discovery descriptions
and examples. Existing project callers do not need a copied route update; their installed
router must receive the updated bundle. Specialist activation inside a complete review
remains owned by the review workflow.

## References

- [Documentation ownership](documentation.md)
- [Router implementation proposal](https://github.com/Mikode13/skills/pull/15)
