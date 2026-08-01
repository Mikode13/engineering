# ADR 0008: Use Conventional Commits and squash merges with shared Git hooks

- Status: Accepted
- Date: 2026-07-31

## Context

MiKode repositories need a predictable way to describe changes. Ad hoc commit and pull
request titles increase the cognitive load of deciding how to write each change and do
not provide reliable machine-readable input for release automation. A shared convention
should make history easier to scan and allow tooling to distinguish fixes, features, and
breaking changes when determining versions and generating release notes.

Conventional Commits 1.0.0 defines the structure
`<type>[optional scope][!]: <description>`. It maps `fix` to a semantic-versioning patch,
`feat` to a minor release, and a `BREAKING CHANGE` footer or `!` marker to a major
release. Other types can describe changes that do not imply a release by themselves.

MiKode also needs a branch convention that can include a ticket identifier. No shared
ticketing system exists yet, so a mandatory ticket segment cannot currently be generated
or validated consistently.

Contributors need freedom to create temporary or work-in-progress commits on a topic
branch. The default branch, rather than every intermediate branch commit, is the release
history. Pull requests must therefore produce one intentional, conventional commit when
they merge.

Local hooks provide fast feedback but can be skipped with Git's `--no-verify` option.
They cannot enforce repository merge settings, and rewriting commits automatically from
a `pre-push` hook would turn later pushes into non-fast-forward updates that may require
a force push. CI and repository rules must remain the authoritative enforcement layer.

Reusable executable tooling does not belong in `mikode-engineering`. The current MiKode
repository boundary requires shared tooling to live in an independent package, while
this repository owns the decision, standard, and reusable file templates.

Version-sensitive tool behavior and documentation were reviewed on 2026-07-31.

## Decision

MiKode will adopt Conventional Commits 1.0.0 for pull request titles and for the single
commit added to a protected default branch by a squash merge.

The allowed types are:

- `build`
- `chore`
- `ci`
- `docs`
- `feat`
- `fix`
- `perf`
- `refactor`
- `revert`
- `style`
- `test`

The type and optional scope must be lowercase. The description, scope, and branch
description must be written in English. Examples include:

```text
feat(auth): add passwordless login
fix(parser): reject an empty token
refactor(config): remove duplicate defaults
feat(api)!: remove the legacy endpoint
```

Topic branches will use a lowercase, kebab-case description:

```text
<type>/<description>
```

For example:

```text
feat/add-passwordless-login
```

Once MiKode selects a shared ticketing system and identifier syntax, branches will use:

```text
<type>/<ticket>-<description>
```

For example:

```text
feat/ABC-123-add-passwordless-login
```

Omitting the ticket is an accepted temporary exception while no shared ticketing system
exists. Activating the ticket requirement will require updating the related standard
with the selected identifier syntax and migration date; it will not require rewriting
this ADR.

Intermediate commits on topic branches may use free-form messages. Every change to the
default branch must arrive through a pull request whose title is a valid Conventional
Commit. Repositories must allow only squash merges, use the pull request title as the
squash commit title, require a pull request for the default branch, and require the
relevant CI status checks before merging. Direct pushes to the default branch are not
part of the supported workflow.

MiKode will create an independent `@mikode13/git-hooks` package. It will:

- own and pin the Husky and commitlint dependencies used by the workflow;
- expose versioned commands for installing the tracked hooks and validating pull request
  titles and branch names;
- keep the Conventional Commits type policy in one executable configuration;
- avoid dependency lifecycle scripts that mutate a consuming repository implicitly; and
- remain separate from `mikode-engineering`, which will only contain documentation and
  templates.

Each adopting repository will install `@mikode13/git-hooks` directly as a development
dependency, invoke its installer explicitly from the repository's own `prepare` script,
and commit a small `.husky/pre-push` wrapper copied from the engineering template. There
will be no `commit-msg` hook because intermediate commit messages are intentionally free.

The `pre-push` hook will run `pnpm run check` followed by `pnpm test`. The shared script
contract defines `check` as formatting, linting, and type checking; it excludes tests and
builds. Builds remain a CI responsibility. CI will rerun the same required checks and
validate the pull request title, because a local hook is advisory and bypassable.

## Alternatives considered

### Document the convention without enforcement

Documentation alone would explain the desired format but would not prevent invalid pull
request titles from reaching the default branch. It was rejected because the convention
must be mandatory across MiKode repositories.

### Enforce the convention only with Husky

Local hooks provide early feedback but Git allows contributors to skip them. Husky also
cannot enforce the merge method or validate a server-created squash commit. It was
rejected as the sole enforcement layer.

### Enforce the convention only in CI

CI is authoritative, but relying on it alone delays feedback until after a pull request
or push. It was rejected in favor of combining local pre-push checks with CI enforcement.

### Copy all configuration and hook logic into every repository

Project-local copies would avoid maintaining a shared package but would duplicate tool
dependencies and allow rules to diverge. It was rejected in favor of a versioned
`@mikode13/git-hooks` package with thin, visible repository wrappers.

### Require Conventional Commits for every intermediate commit

This would make every topic-branch commit individually machine-readable, but the commits
are removed by the required squash merge. The additional authoring friction was rejected
because the pull request title and resulting squash commit are the official history.

### Squash the branch automatically in `pre-push`

A pre-push hook could attempt to find a merge base and rewrite the local branch, but the
base and pushed ref are not always unambiguous. Rewriting an already-published branch is
a non-fast-forward update and normally needs an explicit force push. A hook should not
silently discard or replace local history, so enforcement belongs in repository merge
settings instead.

## Consequences

### Positive

- Contributors use one predictable structure for the changes that enter release history.
- Pull request titles provide machine-readable input for semantic versioning and release
  notes.
- Intermediate commits remain flexible and do not add unnecessary authoring friction.
- Squash merging keeps the default branch concise and gives each pull request one release
  classification.
- The shared package prevents configuration and dependency drift across repositories.
- Local pre-push checks provide early feedback, while CI and repository rules provide
  authoritative enforcement.
- The branch format is ready to add ticket identifiers after a ticketing system is chosen.

### Negative

- Squash merging removes intermediate commit history from the default branch.
- Pre-push checks make pushes slower, especially as test suites grow.
- Local hooks remain bypassable and therefore duplicate some CI work.
- `@mikode13/git-hooks` adds a package that must be released, maintained, and adopted.
- Repository settings and required checks must be configured consistently in addition to
  installing the package.
- Ticket traceability remains unavailable until MiKode chooses a ticketing system.

## Related standards

- [Git workflow standard](../standards/git-workflow.md)

## References

- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [commitlint local setup](https://commitlint.js.org/guides/local-setup)
- [commitlint CI setup](https://commitlint.js.org/guides/ci-setup.html)
- [commitlint shareable configuration](https://commitlint.js.org/reference/configuration.html#shareable-configuration)
- [Husky: Get started](https://typicode.github.io/husky/get-started.html)
- [Husky: How To](https://typicode.github.io/husky/how-to.html)
- [Git hooks: `pre-push`](https://git-scm.com/docs/githooks#_pre_push)
- [Git push safety and force-with-lease](https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt)
- [GitHub: Configuring commit squashing](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests)
- [GitHub: Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [`@mikode13/git-hooks` implementation](https://github.com/mikode13/git-hooks)
- [semantic-release](https://semantic-release.gitbook.io/semantic-release/)
