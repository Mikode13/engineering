# Husky hook templates

These templates implement the local portion of the active
[Git workflow standard](../../standards/git-workflow.md), established by accepted
[ADR 0008](../../adr/0008-use-conventional-commits-and-squash-merges.md). Repositories in
scope use the published `@mikode13/git-hooks` package and copy only the project-owned hook
wrapper described here.

## Available templates

- [`pre-push.template`](pre-push.template) — runs the common project checks and tests
  before a push.
- [`pre-push-docs.template`](pre-push-docs.template) — runs the documentation repository's
  aggregate validation before a push.

There is deliberately no `commit-msg` template. Intermediate topic-branch commits may
use free-form messages; CI validates the pull request title that becomes the squash
commit on the protected default branch.

## Destination

Copy the applicable template to this path in the adopting repository:

```text
.husky/pre-push
```

Rename the selected file to `pre-push`. The files contain no project-specific
placeholders.

## Required project scripts

### Source-code projects

Before copying the hook, ensure `package.json` exposes:

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

Replace `<PROJECT_TEST_COMMAND>` and `<PINNED_VERSION>`. Do not add `build` to `check` or
to this hook; builds run in CI.

### Documentation-only repositories

Documentation repositories expose their real aggregate capability instead of placeholder
source-code commands:

```json
{
	"scripts": {
		"prepare": "mikode-git-hooks install",
		"docs:check": "<PROJECT_DOCUMENTATION_CHECK_COMMAND>"
	},
	"devDependencies": {
		"@mikode13/git-hooks": "<PINNED_VERSION>"
	}
}
```

Replace both placeholders, copy `pre-push-docs.template` to `.husky/pre-push`, and ensure
`docs:check` covers the invariants required by the documentation CI profile.

## Validation

After `@mikode13/git-hooks` is available:

1. Install dependencies with pnpm.
2. Run `pnpm run prepare` and verify Git uses the `.husky` hooks path.
3. Run `pnpm run check` and `pnpm test` independently for a source-code project, or run
   `pnpm run docs:check` for a documentation-only repository.
4. Temporarily make the applicable validation command fail and verify `git push` is
   blocked.
5. Restore the command and verify the push proceeds.
6. Verify CI repeats the checks and validates the pull request title.
7. Verify the repository permits only squash merge and uses the pull request title for
   the squash commit.

The hook can be bypassed with `git push --no-verify`; repository rules and CI are the
authoritative controls.

## Related documents

- [ADR 0008](../../adr/0008-use-conventional-commits-and-squash-merges.md)
- [Git workflow standard](../../standards/git-workflow.md)
- [Husky documentation](https://typicode.github.io/husky/)
