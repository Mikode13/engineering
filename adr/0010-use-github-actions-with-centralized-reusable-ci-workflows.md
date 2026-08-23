# ADR 0010: Use GitHub Actions with centralized reusable CI workflows

- Status: Proposed
- Date: 2026-08-23
- Domains: Shared, Delivery
- Applies to: MiKode repositories hosted on GitHub

## Context

MiKode has standardized its Git workflow and testing boundaries, but it does not yet have
one organization-wide continuous integration contract. Some repositories have independent
workflows, others have no CI, and the organization ruleset cannot require one stable check
until every targeted repository can produce it.

Local hooks provide fast feedback but are not an enforcement boundary. A pull request must
be prevented from reaching the default branch when its required checks fail. MiKode also
needs to verify the definitive squash commit after it reaches `main`, both as a
defense-in-depth check and as the trusted starting point for future release and deployment
automation.

The CI design must support different repository shapes without inventing meaningless
placeholder scripts. Node.js libraries, publishable packages, applications, and
documentation repositories need different applicable jobs while reporting one stable
organization-level result. It must also preserve the existing portable script contract so
tests and quality checks remain executable locally and could move to another CI provider.

MiKode currently hosts its repositories in GitHub, uses organization rulesets, and pays
for GitHub Team. GitHub Actions can call reusable workflows from another repository,
organization rulesets can require named status checks and an up-to-date branch, and
standard GitHub-hosted runners are free and unlimited for public repositories. These
GitHub capabilities were verified against the official documentation on 2026-08-23.

Centralization introduces a separate risk: changing one shared workflow could break every
consumer. MiKode therefore needs controlled, reproducible propagation rather than making
all repositories execute the current state of a mutable branch without validation.

## Decision

MiKode will use GitHub Actions as its continuous integration execution platform. Reusable
CI workflows and workflow templates will live in the public `Mikode13/.github` repository.
Every adopting repository will retain a small caller workflow that selects the applicable
profile and invokes a reviewed central workflow.

GitHub Actions will orchestrate project-owned commands rather than contain project logic.
The portable interface remains `pnpm run check`, `pnpm test`, `pnpm run build` when a build
exists, focused test scripts defined by the testing standard, and package validation when
the repository publishes an artifact. A project must be able to reproduce a failed
project check locally without reimplementing GitHub Actions.

### Required pull request gate

Every pull request will produce one stable aggregate status check named
`CI / required`. The organization ruleset will prevent merging unless that check succeeds
and the pull request branch is up to date with the current default branch.

The aggregate check will require all jobs applicable to the repository, including:

- pull request title and source-branch validation from `@mikode13/git-hooks`;
- `pnpm run check` on Node.js 24 for Node.js repositories;
- the mandatory offline `pnpm test` suite on Node.js 22 and 24;
- `pnpm run build` on Node.js 22 and 24 when the project has a build;
- one package dry-run validation on Node.js 24 for a publishable npm package;
- documentation checks for documentation repositories; and
- `pnpm run test:e2e` for applications to which the end-to-end boundary applies.

Quality checks run once on the primary development line because formatting, linting, and
type checking do not need duplicate executions merely to satisfy the runtime matrix. Tests
and applicable builds run on every supported Node.js line because they can exercise
runtime-dependent behavior.

The documentation profile will validate Markdown formatting and structure, internal file
and heading links, referenced local assets, and repository-specific document invariants.
Transient failures from third-party websites must not block every pull request. Complete
external-link checks will run separately on a schedule and report failures for review.

Repositories will not add always-successful placeholder commands for jobs that do not
apply. The reusable workflows will model Node.js, publishable-package, and documentation
profiles while preserving the same aggregate check name.

### Test scheduling

Unit, component, and local integration tests that belong to the mandatory offline suite
will run on every pull request and on `main`. End-to-end tests will also be required for
pull requests to applications that expose the end-to-end boundary.

Real-provider integration tests will remain outside the default pull request gate. They
will be runnable manually and on a repository-appropriate schedule because provider
availability, credentials, rate limits, latency, and cost can make them unsuitable as a
universal merge requirement. A repository may make a real-provider suite blocking when
it has a reliable sandbox and documents why the stronger gate is appropriate.

### Default-branch verification

After a squash merge, GitHub Actions will repeat all applicable project checks on the
definitive commit pushed to `main`, excluding pull-request-only metadata validation. A
failure cannot undo the merge, but it makes the default branch unhealthy and must prevent
release or deployment automation from using that commit.

Running before and after the merge has distinct purposes: the pull request run is the
enforcement boundary, while the `main` run detects an unexpected difference, flaky or
non-deterministic behavior, incorrect event conditions, and other failures in the exact
default-branch context.

Pull request workflows will use concurrency groups that cancel superseded runs when a
new commit is pushed to the same pull request. Repositories may enable GitHub auto-merge
to complete an eligible pull request after its required checks and branch-freshness rule
are satisfied. A merge queue may be proposed later if concurrent pull requests make
continuous branch updates materially disruptive.

### Workflow security, propagation, and rollback

Caller workflows will pin the central reusable workflow to a full commit SHA. A nearby
comment may identify the corresponding human-readable workflow release. Actions used
inside central workflows will also be pinned to full commit SHAs, and workflow token
permissions will default to the minimum required access.

A central workflow update will not propagate silently. It must pass static workflow
validation and contract fixtures for its supported profiles, be exercised first through
`harness` as the canary consumer, and then reach other repositories through reviewable
update pull requests. Reverting a caller to the previous known-good SHA is the rollback
mechanism.

The required organization ruleset check will be activated for a target only after its
caller workflow has produced the stable aggregate check successfully. This avoids
locking a repository before its CI profile exists.

## Alternatives considered

### Define a complete GitHub Actions workflow independently in every repository

This is the simplest initial setup and lets every project evolve independently. It was
not selected because repeated setup, Node.js matrices, action versions, security
permissions, and check names would drift. MiKode needs one reviewed implementation while
still allowing repositories to select only the jobs that apply.

### Reference the central workflow through `main` or a movable major tag

A mutable reference would propagate central changes immediately without update pull
requests. It was not selected because a new workflow defect would affect every consumer
at once and a new run of unchanged project code could execute different CI logic. Full
commit SHAs provide reproducibility, staged adoption, and a direct rollback target at the
cost of small update pull requests.

### Implement the CI contract as `@mikode13/ci` or only as a composite action

A TypeScript package or composite action could encapsulate reusable steps and improve
provider portability. It would not remove the need for a CI workflow, ruleset integration,
job orchestration, matrices, or permissions. The existing project scripts already provide
the portable execution boundary, while reusable workflows can coordinate multiple jobs
and expose their results separately. A shared implementation package may be reconsidered
only if repeated non-workflow logic emerges.

### Use CircleCI

CircleCI provides reusable configuration through orbs and could report required checks
back to GitHub. It remains a viable migration target, but selecting it now would introduce
another account, permission model, configuration surface, and billing relationship while
MiKode already pays for GitHub Team. Keeping project behavior in portable `pnpm` scripts
limits the cost of a future migration if CircleCI later provides a concrete advantage.

### Use Buildkite or Jenkins

Buildkite can combine a hosted control plane with controlled agents, and Jenkins provides
extensive self-hosted customization and shared libraries. Neither was selected because
MiKode currently has no specialized hardware, private-network, or runner-control
requirement that justifies operating agents, servers, plugins, upgrades, and additional
security boundaries.

### Rely on local Git hooks

Local hooks remain useful for feedback but can be skipped and cannot prove repository
state to GitHub. They cannot enforce the organization ruleset or protect the default
branch, so they are insufficient as the CI boundary.

## Consequences

### Positive

- Known failing changes cannot be squash-merged through the normal protected-branch flow.
- Requiring an up-to-date branch tests a pull request against the current `main` state.
- Every repository exposes one stable result to the organization ruleset despite having
  different applicable jobs.
- Central workflows reduce duplicated maintenance and configuration drift.
- SHA pinning, fixtures, canary adoption, and update pull requests constrain the blast
  radius of a central workflow defect.
- Repeating CI on `main` creates a trusted default-branch result for future releases and
  deployments.
- Project-owned scripts keep core quality and test behavior reproducible locally and
  reduce the cost of changing CI providers.
- Cancelling superseded runs and allowing auto-merge reduce repeated CI work and manual
  waiting around the strict branch-freshness rule.
- MiKode uses its existing GitHub organization governance and, while repositories remain
  public, does not incur standard hosted-runner minute charges.

### Negative

- GitHub-specific workflow syntax, status checks, rulesets, permissions, and run history
  create orchestration-level vendor lock-in.
- Every repository still needs a caller workflow, and SHA updates require pull requests.
- Central workflow implementation and documentation add indirection when diagnosing a
  failed job.
- Strict branch freshness can require repeated updates, particularly for stacked or
  concurrent pull requests.
- Repeating the applicable suite after a merge consumes additional runner capacity and
  execution time even though it cannot prevent the completed merge.
- Required Node.js matrices and application end-to-end tests increase feedback time.
- Scheduled external integration tests may detect a provider regression after code has
  already merged.
- The central workflow repository needs meaningful fixtures, validation, staged rollout,
  and rollback discipline.

## Related standards

- [Git workflow standard](../standards/git-workflow.md)
- [Testing standard](../standards/testing.md)
- [Node.js version standard](../standards/nodejs-version.md)
- [Package management standard](../standards/package-management.md)

A dedicated continuous integration standard will be drafted if this decision is
accepted.

## References

- [GitHub: Reusing workflow configurations](https://docs.github.com/en/actions/concepts/workflows-and-actions/reusing-workflow-configurations)
- [GitHub: Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
- [GitHub: Creating rulesets for repositories in an organization](https://docs.github.com/en/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization)
- [GitHub: GitHub-hosted runners reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [GitHub: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub: Control workflow concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [GitHub: Automatically merging a pull request](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request)
- [CircleCI: Orbs overview](https://circleci.com/docs/orbs/use/orb-intro/)
- [Buildkite: Getting started with pipelines](https://buildkite.com/docs/pipelines/getting-started)
- [Jenkins: Pipeline shared libraries](https://www.jenkins.io/doc/book/pipeline/shared-libraries/)
