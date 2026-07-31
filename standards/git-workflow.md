# Git workflow standard

- Status: Draft
- Last reviewed: 2026-07-31
- Related ADRs: [ADR 0008: Use Conventional Commits and squash merges with shared Git hooks](../adr/0008-use-conventional-commits-and-squash-merges.md)

This standard is not mandatory while ADR 0008 remains proposed.

## Scope

This standard applies to MiKode repositories hosted on GitHub that use Node.js and pnpm.
It defines branch names, pull request titles, merge behavior, local pre-push checks, and
the script interface those checks consume.

Intermediate commits on a topic branch are intentionally outside the commit-message
rules because the required squash merge removes them from the default branch.

## Rules

Projects adopting this standard MUST:

1. Create changes on a topic branch using one of these types: `build`, `chore`, `ci`,
   `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, or `test`.
2. Name branches `<type>/<description>`, where the description is lowercase English
   `kebab-case`, for example `feat/add-passwordless-login`.
3. Write the pull request title as a Conventional Commit 1.0.0 header:
   `<type>[optional scope][!]: <description>`.
4. Write pull request title descriptions and optional scopes in English. Types and scopes
   MUST be lowercase.
5. Use `feat` for a consumer-visible feature, `fix` for a consumer-visible bug fix, and
   `!` or a `BREAKING CHANGE` footer when a change breaks compatibility. Other allowed
   types do not imply a semantic-version increase by themselves.
6. Protect the default branch, require changes to arrive through a pull request, and
   require the relevant CI status checks before merging.
7. Allow only squash merging and configure the pull request title as the squash commit
   title. The resulting commit on the default branch MUST therefore be a valid
   Conventional Commit.
8. Install the independent `@mikode13/git-hooks` package directly as a development
   dependency once it is available. Projects MUST NOT copy its executable configuration
   or dependency graph locally.
9. Install hooks through an explicit project-owned `prepare` script. A dependency MUST
   NOT mutate the consuming repository from its own install lifecycle scripts.
10. Commit the `.husky/pre-push` wrapper created from the
    [shared template](../templates/husky/pre-push.template).
11. Provide `format:check`, `lint`, `typecheck`, `test`, and `check` package scripts. The
    `check` script MUST run formatting, linting, and type checking, and MUST NOT run tests
    or a build.
12. Run `pnpm run check` and then `pnpm test` from `pre-push`.
13. Repeat required checks in CI and validate every pull request title before allowing a
    merge. A local hook is feedback, not an enforcement boundary.

Projects MUST NOT:

- require Conventional Commit messages for intermediate topic-branch commits;
- add a `commit-msg` hook while intermediate messages remain explicitly free;
- rewrite or squash branch history automatically from `pre-push`;
- treat a successful local hook as a substitute for CI; or
- enable merge commits or rebase merges into the protected default branch.

## Commit and pull request format

Valid pull request and squash commit titles include:

```text
feat(auth): add passwordless login
fix(parser): reject an empty token
refactor(config): remove duplicate defaults
feat(api)!: remove the legacy endpoint
```

A breaking change SHOULD include a `BREAKING CHANGE` explanation in the pull request
body so release tooling can include the migration impact in generated notes. If the
release tool reads only the squash commit, the merge workflow MUST preserve that
explanation in the squash commit body.

Invalid titles include:

```text
Add passwordless login
feature: add passwordless login
feat/add-passwordless-login
FEAT(auth): add passwordless login
```

The branch form `feat/add-passwordless-login` is valid as a branch name but not as a
Conventional Commit header.

## Ticket identifiers

The ticket segment is temporarily omitted because MiKode has no shared ticketing system.
This is an accepted cross-project exception, not a project-local deviation.

After MiKode selects a ticketing system and identifier syntax, the standard MUST be
updated to activate this branch format:

```text
<type>/<ticket>-<description>
```

For example:

```text
feat/ABC-123-add-passwordless-login
```

The update MUST define the ticket pattern, activation date, and treatment of branches
created before activation. Until then, projects MUST use `<type>/<description>` and MUST
NOT invent incompatible project-local ticket formats.

## Required scripts and hooks

A typical project exposes this script interface:

```json
{
  "scripts": {
    "prepare": "mikode-git-hooks install",
    "format:check": "prettier . --check",
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc --noEmit",
    "test": "<PROJECT_TEST_COMMAND>",
    "check": "pnpm run format:check && pnpm run lint && pnpm run typecheck"
  },
  "devDependencies": {
    "@mikode13/git-hooks": "<PINNED_VERSION>"
  }
}
```

Replace `<PROJECT_TEST_COMMAND>` and `<PINNED_VERSION>` with project values. The package
version MUST follow MiKode's dependency-version policy when the package is published.

Copy [`pre-push.template`](../templates/husky/pre-push.template) to
`.husky/pre-push`. The installed hook runs:

```sh
pnpm run check && pnpm test
```

`build` is deliberately excluded. Projects run their build in CI through a separate
script or job.

## Required repository and CI configuration

GitHub repositories MUST:

1. Enable squash merging.
2. Disable merge commits and rebase merging.
3. Use the pull request title as the default squash commit title and the pull request body
   as the default squash commit message.
4. Protect the default branch with a ruleset that requires a pull request.
5. Require the squash merge type.
6. Require the title-validation and project CI status checks.
7. Block force pushes to the default branch.

CI MUST pass the pull request title to the validation command exposed by
`@mikode13/git-hooks`. The package interface and exact workflow snippet must be finalized
in that package before this draft standard can become active. CI MUST also run the
project's `check`, `test`, and build jobs independently of local hooks.

## Shared package boundary

`@mikode13/git-hooks` belongs in an independent implementation repository. It owns its
Husky and commitlint versions, Conventional Commit configuration, branch-name rules, and
validation commands. It SHOULD pin executable dependencies exactly and test its commands
on the Node.js versions supported by MiKode.

The package MUST expose an explicit hook-install command but MUST NOT install hooks from
its own dependency lifecycle scripts. This keeps repository mutation visible in the
consumer's `prepare` script and remains compatible with pnpm's restricted dependency
lifecycle policy.

This engineering repository owns only the ADR, standard, and copyable hook templates. It
MUST NOT contain the package implementation.

## Exceptions

A MiKode repository outside the Node.js/pnpm ecosystem MUST follow the branch, pull
request, squash merge, and CI rules, but MAY use ecosystem-native tooling instead of
`@mikode13/git-hooks` and Husky. It MUST document the substituted local command and prove
that CI validates the same pull request title format.

A repository that cannot use GitHub squash merging because of an external platform
constraint MUST document the constraint and an equivalent mechanism that produces one
valid Conventional Commit on the protected default branch. Convenience or preference is
not an exception.

## Adoption

Adoption is blocked while ADR 0008 is proposed and until `@mikode13/git-hooks` implements
and publishes the validation and installation commands. After acceptance and package
publication, new repositories apply the standard before their first pull request.
Existing repositories adopt it in a dedicated change that adds the scripts and hook,
configures CI, and updates GitHub merge settings together.

## References

- [ADR 0008](../adr/0008-use-conventional-commits-and-squash-merges.md)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [commitlint local setup](https://commitlint.js.org/guides/local-setup)
- [commitlint CI setup](https://commitlint.js.org/guides/ci-setup.html)
- [Husky: Get started](https://typicode.github.io/husky/get-started.html)
- [Husky: How To](https://typicode.github.io/husky/how-to.html)
- [Git hooks: `pre-push`](https://git-scm.com/docs/githooks#_pre_push)
- [Git push safety and force-with-lease](https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt)
- [GitHub: Configuring commit squashing](https://docs.github.com/en/repositories/configuring-branches-and-merges/in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests)
- [GitHub: Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges/in-your-repository/managing-rulesets/available-rules-for-rulesets)
