# ADR 0020: Keep project learnings in the owning repository

- Status: Proposed
- Date: 2026-10-11
- Domains: Shared
- Applies to: All active MiKode project repositories and the central learnings

## Context

A learning records what work taught: something was done one way, it taught us something,
and now it is done another way. Its evidence is a run, a measurement, a review or a
pull request. Many learnings belong to one project: a step limit that was too low for its
agents, a model's behaviour with its tools, the cost of one of its checks.

The [documentation standard](../standards/documentation.md) gives "what MiKode work taught
us, with its evidence" only to `Mikode13/engineering` `learnings/`. That row was added
with the learnings folder in `Mikode13/engineering#44`, without a decision of its own. A
project therefore has two places for what it learns, and neither fits:

- **The central folder** keeps a project's lessons away from the code and the version they
  describe. [ADR 0012](0012-use-repository-owned-documentation-with-central-governance.md)
  decided that project documentation stays available with the project version it
  describes. An agent or a reviewer working in the project does not read the central
  folder.
- **The optional Lesson section of `docs/decisions.md`** holds only what a decision
  taught. A measurement or a model's behaviour may teach something without leading to a
  decision. Mixing lessons into the decision log also makes it longer to read for the
  decisions alone.

Today 64 Lesson sections live in the decision logs of five repositories: harness (41),
slop-lab (19), `.github` (2), code-quality (1) and cross-platform (1), as counted on
2026-10-11.

The first live run of the harness write tools (`Mikode13/harness#88`, 2026-10-11) produced
several such lessons and recorded them in a local `docs/learnings.md`, which the current
standard does not allow.

## Decision

A project's learnings live in that project, in `docs/learnings.md`, on the same terms as
its decisions in `docs/decisions.md`.

- **Created when needed.** A repository MUST create `docs/learnings.md` when it records its
  first learning, and MUST NOT create an empty placeholder.
- **What goes there.** What the project's own work taught it, with its evidence: a change
  of approach after a run, a measurement, a review or a model's behaviour.
- **The same format as the central folder,** so a learning can be moved there without
  rewriting it. Learnings are numbered and grouped by theme, and each states:
  - what happened and what it taught;
  - its evidence: a run, a measurement, a pull request or a commit;
  - where it is enforced now, such as a decision, a test or a piece of code.
- **Lessons leave the decision log.** A `docs/decisions.md` entry no longer has a Lesson
  section. What a decision taught goes to `docs/learnings.md`, and the entry links to it.
  A learning that led to a decision links to that entry instead of repeating it.
- **The central `learnings/` keeps what crosses projects:** what applies to several
  projects or to the organization, such as the automated review pilot. A project learning
  that turns out to apply more widely is moved there, and the project links to it.
- **Adoption.** An existing Lesson section moves to `docs/learnings.md` the next time a pull
  request changes that repository's `docs/decisions.md`. Until then it is tolerated.

## Alternatives considered

### Keep learnings only in the central folder

This is the current rule. It keeps one place for every learning, but a project's lessons
are separated from the version they describe, against ADR 0012, and the agents and
reviewers working in the project do not see them.

### Keep lessons only inside `docs/decisions.md`

The Lesson section already exists. Not every lesson leads to a decision, though, and the
decision log would hold two kinds of record.

### A `docs/learnings/` folder with one file per topic

This mirrors the central folder. One file per project is enough, as it is for decisions;
the central folder needs topics because it covers many projects.

## Consequences

### Positive

- What a project learns travels with its code and its version, where its agents and
  reviewers read it.
- `docs/decisions.md` holds only decisions.
- A project learning that applies widely moves to the central folder without rewriting,
  because both use one format.

### Negative

- The 64 existing Lesson sections in five repositories have to move, one repository at a
  time, when each next changes its decision log.
- Each learning needs a judgement on whether it is local or crosses projects.
- A learning moved to the central folder and not linked from the project can end up
  duplicated.
