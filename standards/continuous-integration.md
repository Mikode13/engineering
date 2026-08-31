# Continuous integration standard

- Status: Active
- Last reviewed: 2026-08-30
- Related ADRs:
  [ADR 0010: Use GitHub Actions with centralized reusable CI workflows](../adr/0010-use-github-actions-with-centralized-reusable-ci-workflows.md),
  [ADR 0013: Keep external validations manual by default](../adr/0013-keep-external-validations-manual-by-default.md)

## Scope

This standard applies to MiKode repositories hosted on GitHub. It defines the shared CI
platform, portable project commands, required pull request and default-branch execution,
repository profiles, workflow security, organization ruleset integration, and controlled
rollout of central workflow changes.

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
9. Run project-owned scripts through pnpm. Workflow YAML MUST orchestrate the stable
   scripts rather than duplicate project validation logic.
10. Install dependencies with `pnpm install --frozen-lockfile`.
11. Keep the mandatory pull request gate independent of real-provider credentials,
    network availability, rate limits, and paid usage.
12. Repeat all applicable project checks on the definitive default-branch commit after a
    squash merge, excluding pull-request-only metadata validation.
13. Prevent release and deployment workflows from consuming a default-branch commit whose
    required CI execution failed.
14. Avoid placeholder scripts or jobs that always succeed for an absent capability.

The normal protected-branch flow MUST NOT merge a pull request while `CI / required`
fails, is pending, or was produced for a branch state older than the current default
branch. A local hook is feedback and MUST NOT replace this repository-side gate.

Repositories MAY enable GitHub auto-merge so an eligible pull request merges after the
required status, review, and branch-freshness conditions pass. Merge queue adoption is not
part of this standard.

## Required profiles and jobs

The caller selects the smallest profile that represents the repository. Capabilities may
extend a profile, but a repository MUST NOT disable an applicable required job merely to
shorten CI.

| Job                                   | Pull request | Default branch | Applicability                                          |
| ------------------------------------- | ------------ | -------------- | ------------------------------------------------------ |
| Pull request title and source branch  | Required     | Not applicable | Pull requests                                          |
| `pnpm run check` on Node.js 24        | Required     | Required       | Node.js repositories                                   |
| `pnpm test` on Node.js 22 and 24      | Required     | Required       | Repositories in the testing-standard scope             |
| `pnpm run build` on Node.js 22 and 24 | Required     | Required       | Projects that build executable or distributable output |
| Package dry run on Node.js 24         | Required     | Required       | Publishable npm packages                               |
| Documentation validation              | Required     | Required       | Documentation repositories                             |
| `pnpm run test:e2e`                   | Required     | Required       | Applications with an end-to-end boundary               |

Pull request metadata validation MUST pass the title to
`mikode-git-hooks lint-title` and the source branch to
`mikode-git-hooks lint-branch`, as required by the
[Git workflow standard](git-workflow.md).

The aggregate job MUST run after every applicable dependency, including when an earlier
job fails or is cancelled. It MUST fail when an applicable dependency fails, is
cancelled, or is unexpectedly skipped. The organization ruleset requires only the stable
aggregate name; individual jobs remain visible for diagnosis. The caller job MUST be
named `CI`, and the called aggregate job MUST be named `required`, so GitHub reports the
required status context as `CI / required`.

### Node.js profile

The Node.js profile runs static quality checks on Node.js 24 and the mandatory offline
test suite on Node.js 22 and 24. It runs the build on both supported lines when a build
exists. This proves runtime compatibility without duplicating formatting, linting, and
type checking solely for the version matrix.

### Publishable-package profile

The publishable-package profile includes the Node.js profile and runs one package dry run
on Node.js 24. The dry run MUST verify the artifact contents without publishing. Actual
versioning and publication remain outside this standard.

### Documentation profile

The documentation profile MUST validate:

- supported Markdown formatting and structure;
- internal relative links and heading anchors;
- referenced local images and other assets; and
- repository-specific document invariants, such as ADR metadata, numbering, status, and
  index consistency when applicable.

Internal failures are deterministic and MUST block the pull request. External URL scans
remain outside the required documentation profile because remote downtime, rate
limiting, and automation blocking can produce failures unrelated to the change.
Repositories MAY run them manually as non-blocking diagnostics. This standard does not
require recurring external URL scans; future automation requires a concrete use case and
a separate monitoring or operations decision.

### Application end-to-end capability

An application with an end-to-end boundary MUST run `pnpm run test:e2e` in pull requests
and on the default branch. CI MUST install the Playwright browser binaries required by the
project configuration. The project owns its browser selection until a separate frontend
decision defines a shared browser support matrix.

## External integration tests

Tests that contact real providers MUST remain behind
`pnpm run test:integration:external`. Repositories MAY expose that command through
`workflow_dispatch` when manual execution is useful. This standard does not require
recurring execution; future automation requires a concrete use case and a separate
monitoring or operations decision.

External integration tests MUST NOT be part of `CI / required` by default. They MUST NOT
join `pnpm test` or the local pre-push hook. A separate decision is required before a
repository makes external validation blocking or automated.

## Required caller configuration

The caller workflow MUST remain thin. Its responsibilities are event selection,
concurrency, minimum permissions, profile selection, and the immutable reference to the
central workflow. Project validation steps belong in package scripts or in the central
workflow when they are platform orchestration.

A representative caller has this shape:

```yaml
name: CI

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

jobs:
  ci:
    name: CI
    # MiKode CI v1.0.0
    uses: Mikode13/.github/.github/workflows/ci.yml@<FULL_COMMIT_SHA>
    with:
      profile: package
```

The central workflow interface and released SHA are owned by `Mikode13/.github`; this
repository documents the policy and MUST NOT duplicate the executable workflow.

## Central workflow changes

Changes to the central reusable workflow MUST:

1. Arrive through a reviewed pull request in `Mikode13/.github`.
2. Pass static workflow validation and contract fixtures for every supported profile.
3. Use `harness` as the first canary consumer.
4. Reach remaining repositories through reviewable pull requests that update the pinned
   SHA.
5. Preserve the previous known-good SHA as the immediate rollback target.

The ruleset MUST NOT require `CI / required` for a repository until its caller has
successfully produced that exact status name. A workflow release MUST NOT be propagated
through a mutable `main` reference merely to avoid update pull requests.

## Exceptions

A MiKode repository outside the Node.js and pnpm ecosystem MAY use ecosystem-native
commands inside the central workflow profile. It MUST still use GitHub Actions, produce
`CI / required`, run before and after merge, pin workflow dependencies, and document how
contributors reproduce its checks locally.

A repository MAY use another CI provider only when an external platform or infrastructure
constraint makes GitHub Actions materially unsuitable. It MUST document the constraint,
preserve an equivalent required status and up-to-date branch gate, keep project commands
portable, and obtain a cross-project decision when the same exception affects multiple
repositories.

Node.js version constraints follow the exceptions in the
[Node.js version standard](nodejs-version.md). A constrained repository MUST test every
runtime it claims to support, even when its matrix differs from Node.js 22 and 24.

## Adoption

The central workflows are implemented and adopted in this order:

1. Add the reusable workflows, templates, static validation, and profile fixtures to
   `Mikode13/.github`.
2. Update `harness` to the new caller as the first canary.
3. Confirm pull request and default-branch runs produce the expected jobs and the exact
   `CI / required` status.
4. Open reviewable SHA-update pull requests for the remaining repositories.
5. Remove superseded project-local orchestration after the central caller is green.
6. Add each successfully adopted repository to the organization ruleset target before
   considering adoption complete.

New repositories start from the organization workflow template and MUST complete their
profile inputs before the ruleset target is activated. Existing repositories migrate in
independent pull requests so one failed profile does not block the complete rollout.

## References

- [ADR 0010](../adr/0010-use-github-actions-with-centralized-reusable-ci-workflows.md)
- [ADR 0013](../adr/0013-keep-external-validations-manual-by-default.md)
- [Git workflow standard](git-workflow.md)
- [Testing standard](testing.md)
- [Node.js version standard](nodejs-version.md)
- [Package management standard](package-management.md)
- [GitHub: Reusing workflow configurations](https://docs.github.com/en/actions/concepts/workflows-and-actions/reusing-workflow-configurations)
- [GitHub: Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
- [GitHub: Creating rulesets for repositories in an organization](https://docs.github.com/en/organizations/managing-organization-settings/creating-rulesets-for-repositories-in-your-organization)
- [GitHub: GitHub-hosted runners reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [GitHub: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub: Control workflow concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [GitHub: Automatically merging a pull request](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request)
