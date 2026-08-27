# ADR 0011: Use semantic-release for automated npm publication

- Status: Proposed
- Date: 2026-08-27
- Domains: Shared, Delivery
- Applies to: Independently versioned public npm packages owned by MiKode

## Context

MiKode already requires Conventional Commit pull request titles, squash-only default-branch
history, and a successful CI execution on the definitive commit merged to `main`. Those
decisions provide machine-readable release intent and a trusted commit from which package
publication can start, but they do not yet define how a package version is selected, how
an npm artifact is published, or how a failed publication is recovered.

Package releases should not require a maintainer to choose a version manually, edit a
changeset file, or merge a second release pull request after the functional change has
already passed review. Each package must advance independently, and every releasable
change should be published after its definitive `main` CI run succeeds. Changes that do
not affect package consumers should still execute the release workflow but should not
create empty versions.

MiKode packages are currently experimental. Enabling public stable publication is a
deliberate product decision, but once a package is ready, the first stable version and all
later versions should be calculated and published automatically. The version committed in
`package.json` does not need to mirror the registry when the release tool prepares the
actual package version in its temporary publishing workspace.

Publication is an irreversible boundary. npm registry data is immutable, and a published
name and version cannot be reused even after unpublishing. The normal automated path
therefore needs short-lived authentication, exact commit identity, and a manual recovery
path that understands partial releases instead of blindly repeating a publish command.

Application deployment has different concerns, including environments, migrations,
rollbacks, health checks, and promotion. It remains pending for a later ADR before the
first MiKode application is deployed to production; it is not silently covered by this
package-publication decision.

The relevant semantic-release, GitHub Actions, and npm behavior was verified against
official documentation on 2026-08-27.

## Decision

MiKode will use Semantic Versioning and `semantic-release` to calculate, tag, document,
and publish stable public npm package releases from Conventional Commits.

Each package repository will own an independent release history. A successful release
will create all of the following for the same version and commit:

- a public npm package version on the `latest` distribution tag;
- an immutable Git tag using `v<version>`; and
- a GitHub Release containing generated release notes.

The npm registry, Git tags, and GitHub Releases are the authoritative version history.
Package repositories will keep `package.json` at `0.0.0-development` in source control.
`@semantic-release/npm` will write the calculated version only while preparing the
publishable artifact. MiKode will not commit automated version-bump commits or maintain a
generated `CHANGELOG.md`; GitHub Releases are the human-readable changelog.

### Release eligibility and version calculation

The squash commits added since the most recent release tag determine the next version:

| Change | Stable version effect |
| --- | --- |
| `fix` | Patch |
| `feat` | Minor |
| Any allowed type with `!` or a `BREAKING CHANGE` footer | Major |
| `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, or `test` without a breaking marker | No release |

When multiple unreleased commits exist, the highest required increment wins and every
releasable commit appears in the generated notes. The shared configuration must override
semantic-release defaults that would otherwise treat `perf` and `revert` as patch
releases, while preserving a major release for a breaking change of any allowed type.

An experimental package will not enable the stable publication workflow. When MiKode
declares an unpublished package ready and enables publication, the first qualifying
release from `main` will be `1.0.0`, calculated automatically by semantic-release. This
activation is an intentional stability decision, not a manually selected version.

If an existing package already has public `0.x` releases, migration must first reconcile
the newest npm version with a matching Git tag on the released commit. Its stability pull
request will use a valid breaking-change marker to advance automatically from `0.x` to
`1.0.0`. Automated public `0.x` publication is not part of this decision; a future need
for consumer-facing alpha or beta channels must define their branch, npm distribution
tag, and promotion policy before adoption.

### Trigger and trust boundary

Every completed default-branch CI run will trigger a separate release workflow. The
workflow will publish only when the triggering run:

- is the `CI` workflow required by the continuous integration standard;
- completed successfully for `main`;
- identifies the exact definitive commit through its `head_sha`; and
- belongs to the same repository and protected release branch.

The release workflow will check out that exact SHA rather than the default SHA of the
`workflow_run` event. It will analyze all commits since the last release and exit
successfully without publishing when none require a release. Release executions will be
serialized so two publication attempts cannot mutate the same release history
concurrently.

The privileged release workflow must not check out pull request code or consume
untrusted artifacts from the preceding workflow. Its write permissions become available
only after the unprivileged default-branch CI boundary has passed.

The reusable release workflow will live in `Mikode13/.github`. Each package repository
will keep a thin caller pinned to a full workflow commit SHA, following the propagation,
canary, and rollback rules established for centralized CI workflows in ADR 0010.

### npm authentication and provenance

MiKode will configure npm Trusted Publishing for each package and repository. GitHub
Actions will request a short-lived OIDC identity with `id-token: write`; repositories
will not store a long-lived `NPM_TOKEN` for normal publication. Public packages will be
published with provenance, and the release workflow will receive only the minimum GitHub
permissions needed to create tags and GitHub Releases.

The workflow will use a supported Node.js and npm combination that satisfies npm Trusted
Publishing requirements. Release tooling and third-party actions will be pinned and
updated through reviewed pull requests.

### Manual recovery

The caller will also expose a manual `workflow_dispatch` recovery path. A recovery run
must identify an exact commit SHA, prove that the required default-branch CI succeeded for
that SHA, confirm that the commit belongs to `main`, and inspect npm, the Git tag, and the
GitHub Release before mutating external state.

A normal failed workflow may be rerun when no irreversible publication step completed.
When only part of a release exists, a maintainer must reconcile the completed steps
instead of assuming semantic-release can make a multi-system publication atomic. If npm
already contains the calculated version, that artifact must never be overwritten or
reused. Missing metadata may be repaired when it refers to the identical artifact and
commit; incorrect published code requires a new Conventional Commit and a new version.
Unpublishing is reserved for exceptional security, privacy, or legal incidents and is not
a routine rollback mechanism.

## Alternatives considered

### Use Release Please and merge a release pull request

Release Please can derive versions from Conventional Commits, update `package.json` and a
changelog in source control, and supports pre-`1.0.0` versioning rules. It was not selected
because a maintained release pull request creates a second approval and merge boundary
and batches already-reviewed changes until that pull request is merged. MiKode currently
prefers publication immediately after the definitive `main` CI run. A release-pull-request
model may be reconsidered if coordinated or scheduled releases become more valuable than
continuous publication.

### Use Changesets

Changesets makes release intent explicit in files reviewed with each change and works
well for coordinated packages and monorepositories. It was not selected because MiKode
already makes the squash commit the release intent, does not want contributors to choose
versions or add release metadata files, and currently versions packages independently.

### Select versions and publish manually

A maintainer could edit `package.json`, generate notes, tag the commit, and run
`npm publish`. This offers direct control and little initial configuration, but repeats an
error-prone procedure, permits the registry, tag, and release notes to diverge, and does
not guarantee that the published commit passed the required CI run. It was rejected for
normal releases; manual intervention remains only as a guarded recovery mechanism.

### Publish directly inside the default-branch CI workflow

The existing CI workflow could publish as its final job. This is simpler to visualize,
but it would give the general validation workflow registry and repository write
permissions and mix a repeatable check with an irreversible side effect. A separate
workflow triggered by a successful CI result creates a clearer privilege and failure
boundary.

### Publish a patch for every merge regardless of commit type

This would make every default-branch change produce a new artifact, including
documentation, test, and CI-only changes. It was rejected because empty consumer releases
add noise and contradict the version meaning already established by the Git workflow
standard. Every merge still exercises the release workflow; non-releasable histories exit
without publication.

### Include application deployment in the same decision

Packages and applications can share the trusted CI starting point, but npm publication
does not model environment promotion, data migration, runtime health, or deployment
rollback. Combining them would leave those application-specific guarantees implicit, so
deployment remains an explicit pending decision.

## Consequences

### Positive

- Every stable consumer-facing package change can move from a reviewed squash merge to a
  published artifact without a manual version decision or second release pull request.
- Conventional Commit intent now drives predictable SemVer versions and generated release
  notes.
- Independent repositories retain independent versions and release timelines.
- The exact successful `main` commit becomes the package, Git tag, and GitHub Release.
- OIDC trusted publishing removes long-lived npm publication tokens and adds provenance to
  public packages.
- Separating unprivileged CI from privileged publication reduces the credentials exposed
  during general validation.
- The source tree avoids mechanical version-bump commits and generated changelog drift.
- A guarded manual path supports retries and partial-failure diagnosis without bypassing
  CI.

### Negative

- A wrong pull request type or missing breaking marker can produce the wrong public
  version; the immutable history must be corrected with a later release.
- `package.json` in source control will not show the latest published version, so
  maintainers must use npm, Git tags, or GitHub Releases when answering version questions.
- Immediate publication removes a final batching or approval pause after a functional
  change reaches `main`.
- Several quick merges may be included in one release if a later run observes multiple
  unreleased commits before the serialized publication completes.
- npm publication, tag creation, and GitHub Release creation are not atomic. A partial
  failure can require human reconciliation, and the same npm version cannot be reused.
- The `workflow_run` boundary is privileged and requires careful SHA validation and a ban
  on untrusted pull request artifacts.
- The design depends on semantic-release behavior, GitHub Actions orchestration, and npm
  Trusted Publishing, creating migration work if any provider changes.
- Every publishable repository still needs a caller workflow and npm trusted-publisher
  configuration.
- Experimental public release channels remain unavailable until MiKode defines their
  promotion policy.

## Related standards

- [Continuous integration standard](../standards/continuous-integration.md)
- [Git workflow standard](../standards/git-workflow.md)
- [Package management standard](../standards/package-management.md)

## References

- [Semantic Versioning 2.0.0](https://semver.org/)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [semantic-release: CI configuration](https://semantic-release.gitbook.io/semantic-release/usage/ci-configuration)
- [semantic-release: Configuration](https://semantic-release.gitbook.io/semantic-release/usage/configuration)
- [semantic-release: Publishing pre-releases](https://semantic-release.gitbook.io/semantic-release/recipes/release-workflow/pre-releases)
- [semantic-release commit analyzer](https://github.com/semantic-release/commit-analyzer)
- [semantic-release partial-publication recovery discussion](https://github.com/semantic-release/semantic-release/issues/3178)
- [npm: Trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm: Unpublish policy](https://docs.npmjs.com/policies/unpublish/)
- [GitHub Actions: `workflow_run`](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run)
- [GitHub Actions: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub Actions: Re-running workflows and jobs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs)
- [Release Please](https://github.com/googleapis/release-please)
- [Changesets: Introduction](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
