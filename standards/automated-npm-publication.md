# Automated npm publication standard

- Status: Active
- Last reviewed: 2026-09-05
- Related ADRs:
  [ADR 0011: Use semantic-release for automated npm publication](../adr/0011-use-semantic-release-for-automated-npm-publication.md)

## Scope

This standard applies to independently versioned public npm packages owned by MiKode
after stable automated publication has been explicitly enabled. Experimental packages
that have not made that stability decision remain outside the automated path.

Application deployment is outside this standard.

## Rules

### Release eligibility and versioning

A package in scope MUST use `semantic-release` and Semantic Versioning to derive each
stable release from the squash commits added since the most recent release tag.

| Change                                                                                                     | Stable version effect |
| ---------------------------------------------------------------------------------------------------------- | --------------------- |
| `fix`                                                                                                      | Patch                 |
| `feat`                                                                                                     | Minor                 |
| Any allowed type with `!` or a `BREAKING CHANGE` footer                                                    | Major                 |
| `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, or `test` without a breaking marker | No release            |

When several unreleased commits exist, the highest required increment MUST win. The
shared configuration MUST override semantic-release defaults so non-breaking `perf` and
`revert` commits do not release, while a breaking marker on any allowed type still
produces a major release.

The workflow MUST complete successfully without publishing when no commit is releasable.

### Release output

A successful release MUST create the following for the same version and definitive
commit:

- a public npm package version on the `latest` distribution tag;
- an immutable Git tag named `v<version>`; and
- a GitHub Release containing generated release notes.

The npm registry, Git tags, and GitHub Releases are the authoritative release history.
The source `package.json` MUST remain at `0.0.0-development`; the calculated version is
written only in the temporary publishing workspace. The release process MUST NOT commit
version bumps or generate a repository `CHANGELOG.md`.

### Trigger and security boundary

The release workflow MUST:

- run separately after the definitive `CI` workflow has completed successfully for
  protected `main`;
- verify the triggering repository, branch, and exact `head_sha`, then check out that
  exact commit;
- require the `CI / required` result for the same commit before publication;
- avoid checking out pull request code or consuming untrusted artifacts from CI;
- serialize releases for the package;
- call the reusable workflow in `Mikode13/.github` through a thin caller pinned to a
  reviewed full commit SHA;
- authenticate to npm through Trusted Publishing with `id-token: write`, without a
  long-lived `NPM_TOKEN`;
- publish public packages with provenance and the minimum GitHub permissions needed for
  tags and GitHub Releases; and
- pin release tooling and third-party actions to reviewed immutable versions.

### Stable publication activation

An experimental package MUST NOT enable the stable publication workflow. Adoption MUST
happen through a deliberate stability pull request that confirms the package is ready
for a stable public contract and verifies all of the following:

- the repository enforces the canonical CI contract;
- its release caller is pinned to a reviewed central workflow revision;
- npm Trusted Publishing is configured for the exact package, repository, and workflow;
- the source version is `0.0.0-development`; and
- the exact activation commit has passed the required CI result.

For an unpublished package, the first qualifying automated release MUST be `1.0.0`. For
a package with existing public `0.x` versions, maintainers MUST first reconcile the
newest npm version with a matching Git tag on the released commit. Its stability pull
request MUST contain a valid breaking-change marker so semantic-release advances it to
`1.0.0`.

Automated public `0.x` or prerelease channels MUST NOT be introduced without a separate
decision defining branches, npm distribution tags, and promotion policy.

### Recovery

The caller MUST expose a manual recovery path that accepts an exact commit SHA. Before
mutating external state, it MUST prove that the commit belongs to `main`, verify the
successful required CI result for that SHA, and inspect npm, the expected Git tag, and
the GitHub Release.

A failed run MAY be retried only when no irreversible publication step completed. After
a partial release, maintainers MUST reconcile the completed systems rather than repeat
publication blindly. An npm version MUST NOT be overwritten or reused. Missing metadata
MAY be repaired only for the identical artifact and commit; incorrect published code
requires a new Conventional Commit and a new version.

Unpublishing is reserved for exceptional security, privacy, or legal incidents and MUST
NOT be used as the routine rollback mechanism.

## Exceptions

- Packages that have not made the stable-publication decision remain experimental and
  outside the automated workflow.
- Application deployment requires its own decision and delivery policy.
- If Trusted Publishing or the required CI boundary is unavailable, automated
  publication remains disabled until the prerequisite is restored.

## Adoption

1. Implement and validate the reusable release workflow in `Mikode13/.github`.
2. Enforce the canonical CI result in each adopting package repository.
3. Configure npm Trusted Publishing and reconcile any existing registry, tag, and
   GitHub Release history.
4. Add the SHA-pinned caller in a stability pull request and validate its package
   contents before merge.
5. Observe the first stable publication and use the guarded recovery path if systems
   diverge.

## References

- [ADR 0011: Use semantic-release for automated npm publication](../adr/0011-use-semantic-release-for-automated-npm-publication.md)
- [Continuous integration standard](continuous-integration.md)
- [Git workflow standard](git-workflow.md)
- [Package management standard](package-management.md)
- [semantic-release configuration](https://semantic-release.gitbook.io/semantic-release/usage/configuration)
- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [GitHub Actions `workflow_run`](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_run)
