# Automated pull request review

The learnings below come from the pilot of the automated reviewer in `Mikode13/slop-lab`,
which started on 2026-09-15. They shaped the
[automated pull request review standard](../standards/automated-pull-request-review.md) and
[ADR 0017](../adr/0017-use-ai-as-a-required-pull-request-reviewer.md). The reusable workflow
is tracked in [Mikode13/engineering#27](https://github.com/Mikode13/engineering/issues/27).

## GitHub platform

### 1. `pull_request.base.sha` can be older than `main`

Under `pull_request_target` the workflow file comes from `main`, but the event's base commit stays
where the pull request started. Reading trusted scripts from it ran the new workflow with the old
scripts on Mikode13/slop-lab#5. Read trusted code from `github.sha`. Evidence: [run
35171907832](https://github.com/Mikode13/slop-lab/actions/runs/35171907832), fixed in
Mikode13/slop-lab#9.

### 2. GitHub runs no `pull_request` workflow on a pull request that conflicts with its base

Anything that waits for CI waits forever. Check `mergeable_state` for `dirty`. Evidence: [run
35173351457](https://github.com/Mikode13/slop-lab/actions/runs/35173351457) waited ten minutes;
Mikode13/slop-lab#12.

### 3. A re-run repeats the original event

It keeps the original `github.sha`, so it runs the workflow and scripts from before a fix. Testing
a change merged to `main` needs a new event: a push, or closing and reopening the pull request.

### 4. A ruleset-required workflow runs only on the default activity types

`ready_for_review` does not trigger it, so a draft marked ready gets no review until the next push
or a manual re-run.

### 5. A skipped job counts as success for a required check

A gate must fail when it cannot run, never skip.

### 6. A ruleset bypass cannot tell why a check failed

Whoever may merge past `blocked` may also merge past `incomplete`, so both are limited to
organization owners.

### 7. Commit statuses belong to a commit, not a pull request

Two pull requests with the same head share `AI Review / required`.

### 8. A status is matched by name

Under `pull_request`, any workflow a branch adds can report a passing `AI Review / required`. Only
a ruleset-required workflow from a fixed repository and commit closes that.

### 9. GitHub keeps a review comment on its code when lines above it change

On Mikode13/slop-lab#10 the comments moved from line 166 to 162 on their own, so a later review
needs to reply only when the comment is outdated and the finding moved.

### 10. Set secrets from stdin

Set them from stdin (`pbpaste | tr -d '[:space:]' | gh secret set …`), never in an argument, file,
issue, or chat, and never transform them inside the pipeline, because that breaks log masking.

### 11. Untrusted output in a log can run workflow commands

Print reviewer output between `::stop-commands::` markers.

## How the model behaves as a reviewer

### 12. The model often breaks the result's shape

Three of four reviews on 2026-09-17 needed a repair turn: it added `checked_sources` to every
recheck and wrote wrong fields in verification entries. Evidence: [run
35174162788](https://github.com/Mikode13/slop-lab/actions/runs/35174162788), [run
35202314878](https://github.com/Mikode13/slop-lab/actions/runs/35202314878).

### 13. A repair works only if the error says exactly what to change

"Has missing or unexpected fields" failed its repair; "has unexpected `checked_sources`" was fixed
on the first try. Mikode13/slop-lab#11.

### 14. A rejected reply that is not kept cannot be diagnosed

Design the diagnostics before the first real run.

### 15. Rediscovery is unreliable

Two reviews of the same commit, a day apart, agreed on the `BLOCKER` and two `SHOULD FIX` findings
but differed on the rest. A finding a later review does not find again is not fixed: give the
reviewer each earlier finding to recheck instead.

### 16. The model writes for itself unless stopped

Summaries repeated every perspective and every finding's reasoning, and follow-up items cite
internal IDs (`F1`, `F-4`) that no reader can see.

### 17. Review time depends on size

A 415 KB prompt exceeded a fifteen-minute turn; small pull requests finished in four to six
minutes. Keep reviewed pull requests small.

### 18. The provider's token counts are not a cost measure

The harness reported 2 input tokens for a 143 KB prompt, because it counted only uncached input.
Report estimated cost instead.

## The review model

### 19. Block by harm, not by origin

Blocking on "introduced by this change" held an ordinary bug like an exploit and never held a
pre-existing exploit. Only a `BLOCKER` fails the check, wherever the defect is.
Mikode13/engineering#41.

### 20. Every finding a person must act on is a conversation on its line

`SHOULD FIX` and `SUGGESTION` behave the same on GitHub: both hold the merge until a person
resolves them. They differ in how they may be resolved: a `SHOULD FIX` only with a code change or
an issue, a `SUGGESTION` once read.

### 21. The bot never resolves a conversation

Resolving suggestions automatically hid them from the person who had to see them. Closed
conversations stay as documentation.

### 22. Fixing every suggestion creates a loop

Each fix starts another full review, which produces new suggestions. Agents skip suggestions
unless asked.

### 23. Publishing must be idempotent

Key each finding by its result so that a re-run posts nothing twice, and update one summary
comment in place.

### 24. Let the standard follow a working system

The review standard changed after the pilot showed what worked, instead of the pilot bending to
the first draft of the standard.

## Testing and rolling out the reviewer

### 25. Keep the ground truth outside everything the reviewer can read

, or the test measures retrieval. Record it before the run, somewhere that outlives the session:
the expected findings of the seeded case Mikode13/slop-lab#5 were lost, so it can no longer
measure recall. Its earlier reviews have seen the answers, so they cannot be rebuilt blind either;
it remains useful only to compare runs with each other.

### 26. A stateful reviewer changes a test case once it reviews it

Later reviews recheck instead of discovering. Test rechecks on a disposable copy, as
Mikode13/slop-lab#10 did, and keep the seeded case untouched.

### 27. Live runs find what stubs cannot

41 unit tests passed, yet the first live runs found three defects, all between GitHub and the
reviewer: the stale base commit, the conflict wait, and the vague shape error.

### 28. Pilot in one repository before centralizing

Every pilot fix was a pull request reviewed by the pilot itself. In `Mikode13/.github`, each of
those defects would have been noise in every repository. Promote only when accidental `incomplete`
stays at or below one in ten, pin the workflow by commit, and let one repository run a newer
commit as a canary.

### 29. The reviewer finds real defects in its own changes

Reviews of the pilot's pull requests found the declared base that no longer matched the diff
(Mikode13/slop-lab#9) and the field list that dropped names (Mikode13/slop-lab#11).

### 30. Split a pull request that grows past one idea

Mikode13/slop-lab#6 became Mikode13/slop-lab#7 and Mikode13/slop-lab#8, which could each be
reviewed and merged.

## Reviewing a large change

### 31. A large change converges across pushes

The layered-architecture migration in Mikode13/slop-lab#21 drew 9 new conversations on its first
review, then 2 and 1 on the next pushes. The reviewer found most at once and then only what a push
changed. Findings in code the change did not touch went into the summary as pre-existing, so they
did not hold the merge.

### 32. The summary comment is the current state; review bodies are history

One summary is updated in place on every review. Each review that opens conversations also posts a
fixed body such as "AI review of `<sha>`: N new comments", and replies or rechecks appear as
reviews with an empty body. A reader who looks at the timeline instead of the summary can take the
fixed lines for stale state. Evidence: Mikode13/slop-lab#21.
