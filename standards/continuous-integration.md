# Continuous integration standard

- Status: Active
- Last reviewed: 2026-09-01
- Related ADRs:
  [ADR 0010: Use GitHub Actions with centralized reusable CI workflows](../adr/0010-use-github-actions-with-centralized-reusable-ci-workflows.md),
  [ADR 0013: Keep external validations manual by default](../adr/0013-keep-external-validations-manual-by-default.md),
  [ADR 0015: Compose CI by capability](../adr/0015-compose-ci-by-capability.md)

## Scope

This standard applies to MiKode repositories hosted on GitHub. It defines the shared CI
platform, capability selection, portable project commands, required pull request and
default-branch execution, workflow security, organization ruleset integration, and
controlled rollout of central workflow changes.

The standard governs continuous integration. Versioning, release publication, application
deployment, and security-scanner selection require their own decisions.

## Rules

MiKode repositories MUST:

1. Use GitHub Actions for continuous integration.
2. Keep a small caller workflow in `.github/workflows/` that invokes the applicable
   reusable workflow from the public `Mikode13/.github` repository.
3. Pin the central reusable workflow to a full commit SHA. A nearby comment MAY identify
   its human-readable release.
4. Pin every referenced action to a full commit SHA and declare the minimum required
   `GITHUB_TOKEN` permissions.
5. Run CI for every pull request targeting the default branch and for every commit pushed
   to the default branch.
6. Produce one stable aggregate status check named `CI / required`.
7. Configure the organization ruleset to require `CI / required` and require the pull
   request branch to be up to date before merging.
8. Use a per-pull-request concurrency group with cancellation enabled so a new commit
   cancels superseded runs for that pull request.
9. Enable every CI capability that applies to the repository. A preset MAY select a common
   capability set but MUST NOT suppress another applicable capability.
10. Use the canonical MiKode contract for common capability behavior. A repository MUST NOT
    redefine a common capability merely because another implementation is convenient.
11. Keep repository-specific validation limited to invariants that the central contract
    cannot know generically. Those checks MUST be reproducible locally with the repository's
    real tooling rather than placeholder infrastructure.
12. Install only the tooling required by the enabled checks. When a repository installs
    registry dependencies, it MUST use the lockfile and frozen-install behavior required by
    its applicable ecosystem standard.
13. Keep the mandatory pull request gate independent of real-provider credentials, network
    availability, rate limits, and paid usage.
14. Repeat all applicable project checks on the definitive default-branch commit after a
    squash merge, excluding pull-request-only metadata validation.
15. Prevent release and deployment workflows from consuming a default-branch commit whose
    required CI execution failed.
16. Avoid placeholder scripts or jobs that always succeed for an absent capability.

The normal protected-branch flow MUST NOT merge a pull request while `CI / required` fails,
is pending, or was produced for a branch state older than the current default branch. A
local hook is feedback and MUST NOT replace this repository-side gate.

Repositories MAY enable GitHub auto-merge so an eligible pull request merges after the
required status, review, and branch-freshness conditions pass. Merge queue adoption is not
part of this standard.

## Capability selection

Capabilities describe validation responsibilities. They do not classify a repository by
language, runtime, package manager, or implementation technology.

Before configuring CI, inspect the repository and determine which validation boundaries it
actually owns. Use the following applicability rules for the capabilities currently covered
by this standard:

| Capability    | Required when                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Documentation | Documentation or content is a first-class repository artifact, or the repository owns dedicated documentation invariants that require CI validation. |
| Source        | The repository contains executable source or consumable technical configuration in the scope of the applicable code-quality rules.                   |
| Tests         | The repository is in scope for the testing standard's mandatory offline suite.                                                                       |
| Build         | The repository produces executable or distributable output through a build step.                                                                     |
| Package       | The repository publishes an npm package and therefore requires artifact validation before release.                                                   |
| End-to-end    | An application has the end-to-end boundary defined by the testing standard.                                                                          |

Pull request title and source-branch validation are shared enforcement and run for every pull
request; repositories do not select them as a capability.

A capability MUST be selected because its validation responsibility applies, not because a
tool happens to be installed. For example, using Node.js to execute documentation validation
does not by itself make the Source or Tests capabilities applicable.

When applicability is unclear, the agent or contributor MUST resolve the repository facts
and the scopes of the related active standards before selecting a capability. It MUST NOT
invent a capability, omit an applicable one, or add unrelated tooling merely to fit an
available preset.

## Capability contract and implementation

`Mikode13/.github` owns the executable contract for supported capabilities. The central CI
revision MUST make its supported capabilities and retained preset expansion discoverable
from that same immutable revision. The exact representation of that contract is an
implementation detail of `Mikode13/.github`; this standard does not require a separate
manifest or a particular workflow input syntax.

Common capability behavior is centrally defined. Repositories MAY extend a selected
capability only with validation that depends on repository-specific domain knowledge. If a
repository-specific extension is needed, the project owns the stable command or files that
express that invariant, while the central workflow owns shared orchestration and enforcement.

If an applicable capability is not supported by the central CI revision available to a
repository, that is a CI contract gap. The repository MUST report the gap instead of
manufacturing a runtime, package manager, placeholder command, or alternate meaning for a
supported capability.

### Documentation

The common Documentation capability MUST validate:

- supported Markdown formatting and structure;
- internal relative links and heading anchors; and
- referenced local images and other assets.

Repositories MAY extend it with real document invariants that are specific to their domain,
such as ADR metadata, numbering, status, and index consistency in `Mikode13/engineering`.
Those extensions do not change the common meaning of the capability.

The Documentation capability MUST NOT inherently require Node.js, pnpm, `package.json`, or
a pnpm lockfile. The central implementation or a repository-specific extension MAY use such
tooling when the check genuinely needs it.

Internal failures are deterministic and MUST block the pull request. External URL scans
remain outside the required Documentation capability because remote downtime, rate
limiting, and automation blocking can produce failures unrelated to the change.
Repositories MAY run them manually as non-blocking diagnostics. Future recurring external
validation requires a concrete use case and a separate monitoring or operations decision.

### Source

For Node.js and TypeScript repositories, the Source capability runs `pnpm run check` on
Node.js 24. The command keeps formatting, linting, and type checking reproducible outside
GitHub Actions as required by the related standards.

Repositories outside the Node.js and pnpm ecosystem use the equivalent ecosystem-native
command defined by their applicable standards. The capability remains Source validation;
the runtime is an implementation detail.

### Tests

The Tests capability runs the mandatory offline test suite on every supported runtime line.
For the current Node.js standard, `pnpm test` runs on Node.js 22 and 24.

Tests that contact real providers remain outside this capability and follow the external
integration policy below.

### Build

The Build capability runs the repository's real build on every supported runtime line when
the project produces executable or distributable output. For current Node.js repositories,
that command is `pnpm run build` on Node.js 22 and 24.

### Package

The Package capability performs one npm package dry run on Node.js 24 and MUST verify the
artifact contents without publishing. Actual versioning and publication remain outside this
standard.

Selecting Package does not implicitly publish an artifact and does not remove other
applicable capabilities such as Source, Tests, Build, or Documentation.

### End-to-end

An application with an end-to-end boundary MUST enable the End-to-end capability. Current
Node.js applications run `pnpm run test:e2e` on Node.js 24, and CI installs the Playwright
browser binaries required by the project configuration.

The project owns its browser selection until a separate frontend decision defines a shared
browser support matrix.

## Presets and compatibility

Existing profile names MAY remain as convenience presets and compatibility shims while the
central workflow migrates. A preset expands to capabilities defined by the same central CI
revision; it is not an authoritative classification of the repository.

Repositories MUST add any applicable capability not supplied by their selected preset. New
combined profiles such as `node-docs` or `package-docs` MUST NOT be created merely to
represent combinations that the capability model already expresses.

Agents and repositories MUST NOT infer current preset expansion from ADR examples or stale
documentation. For an existing caller, the executable contract is the central CI revision
identified by its pinned SHA. A deliberate CI update may compare that revision with a newer
reviewed central revision before changing the pin.

## Required jobs and aggregation

The current validation responsibilities map to jobs as follows. Exact job organization MAY
change inside the central workflow while preserving these requirements and the stable
aggregate result.

| Validation responsibility            | Pull request    | Default branch  |
| ------------------------------------ | --------------- | --------------- |
| Pull request title and source branch | Required        | Not applicable  |
| Source                               | When applicable | When applicable |
| Tests                                | When applicable | When applicable |
| Build                                | When applicable | When applicable |
| Package                              | When applicable | When applicable |
| Documentation                        | When applicable | When applicable |
| End-to-end                           | When applicable | When applicable |

Pull request metadata validation MUST pass the title to
`mikode-git-hooks lint-title` and the source branch to
`mikode-git-hooks lint-branch`, as required by the
[Git workflow standard](git-workflow.md).

The aggregate job MUST run after every applicable dependency, including when an earlier job
fails or is cancelled. It MUST fail when an applicable dependency fails, is cancelled, or
is unexpectedly skipped. The organization ruleset requires only the stable aggregate name;
individual jobs remain visible for diagnosis. The caller job MUST be named `CI`, and the
called aggregate job MUST be named `required`, so GitHub reports the required status context
as `CI / required`.

## External integration tests

Tests that contact real providers MUST remain behind
`pnpm run test:integration:external` for current Node.js projects, or the equivalent stable
project command for another ecosystem. Repositories MAY expose that command through
`workflow_dispatch` when manual execution is useful.

External integration tests MUST NOT be part of `CI / required` by default. They MUST NOT
join the mandatory offline test suite or the local pre-push hook. A separate decision is
required before a repository makes external validation blocking or automated.

## Required caller configuration

The caller workflow MUST remain thin. Its responsibilities are event selection,
concurrency, minimum permissions, capability or preset selection, and the immutable
reference to the central workflow.

The exact capability input syntax is owned by `Mikode13/.github` and MUST be read from the
same central revision that the caller pins. Project validation implementation belongs in
the central workflow for common checks or in stable repository-owned commands for genuine
project-specific invariants.

A repository that already has CI MUST use the contract belonging to its pinned central
revision until a deliberate update changes that SHA. It MAY inspect a newer reviewed
revision to propose an update but MUST NOT assume that newer inputs exist in the revision it
currently executes.

A repository adopting MiKode CI for the first time MUST inspect the latest reviewed central
revision, determine whether it supports every required capability, and pin the chosen
revision. If the central implementation cannot represent the repository cleanly, adoption
is blocked on the central contract rather than on artificial project tooling.

## Central workflow changes

Changes to the central reusable workflow MUST:

1. Arrive through a reviewed pull request in `Mikode13/.github`.
2. Keep the supported capability contract and executable implementation in the same
   revision.
3. Pass static workflow validation and contract fixtures for every supported capability and
   retained preset.
4. Preserve compatibility for callers that remain on an older pinned revision.
5. Use `harness` as the first canary consumer when the change affects its applicable
   capabilities.
6. Reach remaining repositories through reviewable pull requests that update the pinned
   SHA.
7. Preserve the previous known-good SHA as the immediate rollback target.

The ruleset MUST NOT require `CI / required` for a repository until its caller has
successfully produced that exact status name. A workflow release MUST NOT be propagated
through a mutable `main` reference merely to avoid update pull requests.

## Exceptions

A MiKode repository outside the Node.js and pnpm ecosystem MAY use ecosystem-native
commands for applicable capabilities. It MUST still use GitHub Actions, produce
`CI / required`, run before and after merge, pin workflow dependencies, and document how
contributors reproduce its repository-specific checks locally.

A repository MAY use another CI provider only when an external platform or infrastructure
constraint makes GitHub Actions materially unsuitable. It MUST document the constraint,
preserve an equivalent required status and up-to-date branch gate, keep project commands
portable, and obtain a cross-project decision when the same exception affects multiple
repositories.

Node.js version constraints follow the exceptions in the
[Node.js version standard](nodejs-version.md). A constrained repository MUST test every
runtime it claims to support, even when its matrix differs from Node.js 22 and 24.

## Adoption

Capability-based CI is adopted in this order:

1. Add the capability contract, common implementations, static validation, and contract
   fixtures to `Mikode13/.github`.
2. Prove retained presets still map to their intended existing behavior.
3. Exercise the new contract through appropriate canary consumers before broad rollout.
4. Open reviewable SHA-update or initial-adoption pull requests for repositories using the
   new contract.
5. Remove superseded project-local orchestration only after the central caller is green.
6. Add each successfully adopted repository to the organization ruleset target before
   considering adoption complete.

New repositories and repositories without CI start from a reviewed central revision that
supports all capabilities required by their actual shape. Existing repositories remain on
their pinned revision until a deliberate update. One repository's migration MUST NOT force
another repository to change its known-good CI revision.

## References

- [ADR 0010](../adr/0010-use-github-actions-with-centralized-reusable-ci-workflows.md)
- [ADR 0013](../adr/0013-keep-external-validations-manual-by-default.md)
- [ADR 0015](../adr/0015-compose-ci-by-capability.md)
- [Git workflow standard](git-workflow.md)
- [Testing standard](testing.md)
- [Node.js version standard](nodejs-version.md)
- [Package management standard](package-management.md)
- [GitHub: Reusing workflow configurations](https://docs.github.com/en/actions/concepts/workflows-and-actions/reusing-workflow-configurations)
- [GitHub: Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
- [GitHub: Creating rulesets for repositories in an organization](https://docs.github.com/en/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-an-organization)
- [GitHub: GitHub-hosted runners reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [GitHub: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub: Control workflow concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [GitHub: Automatically merging a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)
