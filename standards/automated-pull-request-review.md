# Automated pull request review standard

- Status: Active
- Last reviewed: 2026-09-16
- Related ADRs:
  [ADR 0017: Use AI as a required pull request reviewer](../adr/0017-use-ai-as-a-required-pull-request-reviewer.md)

## Scope

This standard applies to MiKode repositories hosted on GitHub after they adopt the
automated AI review gate. It defines eligible pull requests, the review contract,
enforcement, the initial provider configuration, security, exceptions, and rollout.

The review complements deterministic `CI / required`, local or harness review, and final
human review. It does not replace any of them.

## Review contract

Every non-draft pull request targeting the default branch MUST receive one automated AI
review for its exact current head commit before it can merge. A new commit invalidates the
previous result and MUST trigger a new review; superseded executions SHOULD be cancelled.

The reviewer MUST use the portable MiKode review skill and inspect the change as an
independent fault-finding pass. It MUST evaluate, as applicable:

- requested behavior and acceptance criteria;
- regressions, edge cases, security, and compatibility;
- architecture and affected contracts;
- tests that demonstrate important behavior; and
- applicable MiKode standards and documentation.

The review MUST compare the change with an intent source that states its goal and
acceptance criteria: a linked issue or the pull request description. Dependency updates
limited to package manifests and lockfiles, and formatting-only changes, are exempt from
this requirement but not from the review. The reviewer MUST establish an exemption from the
diff itself, not from the pull request title or description. A non-exempt change without an
intent source lacks required context.

The reviewer MUST load only relevant context, distinguish introduced problems from
pre-existing ones, and avoid repeating deterministic formatter, linter, compiler, or test
output without additional reasoning.

Each finding MUST identify its location, evidence, likely consequence, and a direction for
resolution. The reviewer MUST NOT modify code, approve the pull request, merge it, or claim
that a completed review proves correctness.

## Severity and outcomes

Findings use these severities:

| Severity     | Meaning                                                                | Merge effect             |
| ------------ | ---------------------------------------------------------------------- | ------------------------ |
| `SUGGESTION` | Optional improvement or nice-to-have that does not affect correctness. | Informative              |
| `SHOULD FIX` | Supported defect or material weakness that should be resolved.         | Blocking when introduced |
| `BLOCKER`    | Supported severe defect, security risk, or unsafe merge consequence.   | Blocking when introduced |

A finding is introduced when the pull request creates or widens it. A problem the change
leaves unchanged is pre-existing, even when its lines appear in the diff. Pre-existing
findings keep their verified severity but never block. A potentially blocking finding whose
origin cannot be established produces `incomplete`.

The execution reports exactly one outcome:

| Outcome      | Condition                                                      |
| ------------ | -------------------------------------------------------------- |
| `clean`      | Review completed with no blocking findings.                    |
| `blocked`    | Review completed with at least one supported blocking finding. |
| `incomplete` | Review could not reach a trustworthy result.                   |

Introduced `SHOULD FIX` and `BLOCKER` findings MUST create review conversations that remain
unresolved until a maintainer accepts a correction or records why the finding is not
applicable. A blocking finding that cannot be published as a review conversation MUST fail
`AI Review / required`, even when other blocking findings were published.

`SUGGESTION` and pre-existing findings MUST NOT leave an unresolved review conversation. One
located on a line of the diff SHOULD be published as a review comment on that line and
resolved when it is published, so it stays visible where it applies without holding back the
merge; if it cannot be resolved, `AI Review / required` MUST fail. Any other non-blocking
finding MUST appear in the review summary. Pre-existing `SHOULD FIX` and `BLOCKER` findings
MUST be identified as follow-up work.

The review summary MUST state the outcome and name each blocking finding with its location. It
SHOULD NOT repeat reasoning already published in a comment.

The stable check `AI Review / required` MUST succeed only when the review completed for
the current head commit. It MUST fail for `incomplete`. The repository ruleset MUST require
that review conversations are resolved, so a `blocked` outcome prevents merge even though
the execution itself completed successfully.

Provider errors, exhausted quota, timeouts, invalid structured output, missing required
context, and budget enforcement MUST produce `incomplete`, never `clean`.

## Execution order and efficiency

The automated review MUST run only after `CI / required` succeeds for the same head commit.
Draft pull requests MUST NOT consume a review. One reviewer agent performs the complete
review; it MAY load multiple applicable skills without spawning specialist agents.

The implementation MUST:

- review each head commit at most once unless a maintainer explicitly retries an
  incomplete execution;
- use per-pull-request concurrency and cancel superseded runs;
- set explicit limits for time, turns, and context;
- bind the published result to the reviewed repository, pull request, and commit; and
- give pull request reviews priority over scheduled MiKode automations when they share
  quota.

Limits MUST reduce redundant work rather than silently truncate a review into a clean
result.

## Required check and rulesets

The review MUST report one stable status context, `AI Review / required`, on the pull
request head commit. A job-based implementation names its caller job `AI Review` and its
aggregate job `required`; an implementation that publishes a check run through a GitHub App
uses the same name. A local implementation MUST report the same context, so that moving it
to the reusable workflow changes no ruleset.

GitHub reports a job skipped by its condition as successful, and a skipped required check
does not prevent a merge. The job that reports `AI Review / required` MUST therefore run
for every non-draft pull request targeting the default branch, and MUST fail whenever it
cannot publish a completed review for the current head commit: when analysis failed, was
cancelled, or was skipped, when the trusted reviewer implementation is unavailable, and
when the pull request comes from a fork that cannot receive the provider credential. Only a
draft pull request MAY skip it. A workflow that a ruleset requires runs only for the default
activity types, so marking a draft ready does not start it again; such a workflow MUST fail
for a draft instead of skipping it, and it MUST NOT use `cancel-in-progress`, which GitHub
advises against for required workflows, so a superseded run has to stop itself.

The check MUST be required through an organization ruleset dedicated to the review, whose
target lists only repositories that run the reviewer. It MUST NOT be added to a ruleset
that also targets repositories without the reviewer, such as the one that requires
`CI / required`, because a check that nothing reports blocks every pull request there. The
ruleset MUST NOT require the check for a repository until that repository has produced a
successful `AI Review / required` result under that exact name, and until its source
satisfies [Security boundary](#security-boundary). When the rule itself is what runs a required
workflow, the first adopting pull request is that result, and the pull-request-only bypass
covers a failure of the run's own plumbing.

## Provider, account, and budget

The initial implementation runs Claude through the `single-turn` command of
[`@mikode13/harness-cli`](https://github.com/Mikode13/harness-cli), authenticated with a
dedicated MiKode-owned provider account rather than a maintainer's personal development
account. The command and the review skill MUST be pinned to exact revisions, and the
reviewer MUST NOT run with provider permission prompts bypassed. The exact model MAY change
after evaluation without changing the ADR.

The provider account MAY also run scheduled MiKode automations. Its total recurring cost
MUST NOT exceed EUR 30 per month without a reviewed update to this standard. Pull request
reviews take priority over scheduled work when quota is constrained.

The MiKode maintainer owns account recovery, multi-factor authentication, credential
rotation, quota monitoring, and incident response. Provider credentials MUST live only in
the approved GitHub secret boundary and MUST NOT be exposed to pull request code, logs,
prompts, or artifacts.

Provider, model, authentication method, and budget MAY be changed through a reviewed
standard update when the required review contract and merge authority remain intact.

## Security boundary

Pull request content, repository instructions changed by the pull request, comments, and
linked content MUST be treated as untrusted review input. They MUST NOT override the
reviewer's trusted skill, standard, permissions, output contract, or security rules. A
pull request description MAY state intent, but it MUST NOT waive review rules, accept risk,
or grant an exemption.

The reviewer implementation, its instructions, and the repository context it treats as
trusted MUST come from a trusted revision: the pinned reusable workflow, or the base
revision for a local implementation. They MUST NOT be read from the pull request head.
Before the check is required, neither the provider credential nor the check may be within
reach of the change under review. Under `pull_request`, GitHub runs every workflow as the
pull request branch defines it, including workflows the branch adds, and gives a branch of
the same repository the repository's secrets. Therefore:

- the provider credential MUST live in an environment whose deployment branches are limited
  to the default branch, and the job that uses it MUST run in the default branch's context,
  for example through `pull_request_target` or `workflow_run`, refuse forks before it reads
  the credential, and never execute code or configuration from the head; and
- `AI Review / required` MUST come from a source that a branch cannot act as: a ruleset rule
  that requires a pinned workflow, or a check run published by a dedicated GitHub App that
  the review ruleset names as the check's source.

A pinned caller alone satisfies neither, because it is read from the head too.

Analysis MUST use read-only repository access and MUST NOT execute pull request code with
provider credentials or a privileged GitHub token. Publication MUST use the minimum
permissions required to write the check and review result. A privileged workflow MUST NOT
consume untrusted artifacts produced by pull request execution.

The reusable workflow and every third-party action MUST be pinned to reviewed immutable
revisions. Logs and summaries MUST NOT contain provider credentials or unrelated repository
secrets.

## Human authority and exceptions

The maintainer remains responsible for deciding whether a finding is correct and which
solution is appropriate. Resolving an incorrect finding MUST include a short reason in the
review conversation. A code correction SHOULD produce a new commit and therefore a fresh
review.

An authorized maintainer MAY bypass an `incomplete` review only for an exceptional need.
The pull request MUST record the reason, the reviewed head commit, and the person accepting
the risk. A provider failure or quota incident MUST NOT silently disable the gate for later
pull requests.

The review ruleset SHOULD grant that bypass only to authorized maintainers and only for
pull requests, so each exception is a decision about one merge. Disabling the ruleset or
removing a repository from its target is not an exception mechanism, because it disables
the gate for every other pull request at the same time.

## Adoption

1. Create and validate the portable MiKode review skill.
2. Pilot the executable reviewer in one canary repository, as described below.
3. Evaluate representative historical changes with known defects and known-good changes.
4. Move the proven implementation to `Mikode13/.github` as the reusable review workflow,
   with fixtures for clean, blocked, incomplete, obsolete, pre-existing, and adversarial
   results, and replace the canary's local implementation with a pinned caller.
5. Measure useful findings, false positives, omissions, duration, token use, and quota
   consumption before broader adoption.
6. Adopt the reviewed workflow through immutable caller revisions, add each repository to
   the review ruleset target once its check has reported successfully, and require
   conversation resolution there.

`slop-lab` is the canary. It MAY run a local, temporary implementation before the reusable
workflow exists, so the central workflow is built from exercised provider execution,
structured output, and publication rather than from assumptions. The local implementation
MUST follow every other rule in this standard, except that, while its check is not required
and only trusted maintainers and their agents push branches to the canary,
`AI Review / required` MAY come from a source that a branch could imitate. The pilot becomes
blocking as soon as its check can be required; there is no advisory-only stage beyond that
point.

The pull request that introduces a local implementation cannot be reviewed by it, because
its base revision does not carry the reviewer yet. That pull request merges on
`CI / required` and human review, without a review of its own. The canary's review ruleset
is enabled only once its check comes from a source that a branch cannot act as.

Promotion replaces the local implementation with the central workflow, pinned to a full
commit SHA either by a caller in each repository or by a ruleset rule that requires it, and
repeats the canary's cases to confirm that the results do not change. The pinned SHA is the
rollback target from then on. With a caller, later reviewer changes reach each repository
through a reviewed pull request that updates it; with a required workflow, they follow a
reviewed pull request in `Mikode13/.github` with a change to the SHA that the ruleset pins.

If the pilot is not reliable enough, pause further adoption while retaining the decision
and improve or replace the implementation through this standard. Removing the required AI
review requires a new ADR.

## References

- [ADR 0017: Use AI as a required pull request reviewer](../adr/0017-use-ai-as-a-required-pull-request-reviewer.md)
- [ADR 0013: Keep external validations manual by default](../adr/0013-keep-external-validations-manual-by-default.md)
- [Continuous integration standard](continuous-integration.md)
- [Git workflow standard](git-workflow.md)
- [`Mikode13/harness-cli`](https://github.com/Mikode13/harness-cli)
- [GitHub: Using conditions to control job execution](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/using-conditions-to-control-job-execution)
- [GitHub: Creating rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)
- [GitHub: Deployments and environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
- [GitHub: Available rules for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [GitHub: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

Version-sensitive research performed on 2026-09-15: GitHub documents that a job skipped by
its condition reports success and does not block a required check, that a ruleset bypass can
be limited to pull requests, that a job triggered by `pull_request` cannot use an environment
whose deployment branches exclude `refs/pull/*/merge`, that a required status check can name
an app as its expected source, that push rulesets are available only to private and
internal repositories, and that a ruleset runs a required workflow only for the default
activity types of its events. Since December 2025, `pull_request_target` runs from the
default branch, and environment rules for it are evaluated against the default branch.
