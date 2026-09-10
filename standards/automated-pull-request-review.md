# Automated pull request review standard

- Status: Active
- Last reviewed: 2026-09-08
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

The reviewer MUST load only relevant context, distinguish introduced problems from
pre-existing ones, and avoid repeating deterministic formatter, linter, compiler, or test
output without additional reasoning.

Each finding MUST identify its location, evidence, likely consequence, and a direction for
resolution. The reviewer MUST NOT modify code, approve the pull request, merge it, or claim
that a completed review proves correctness.

## Severity and outcomes

Findings use these severities:

| Severity     | Meaning                                                                | Merge effect |
| ------------ | ---------------------------------------------------------------------- | ------------ |
| `SUGGESTION` | Optional improvement or nice-to-have that does not affect correctness. | Informative  |
| `SHOULD FIX` | Supported defect or material weakness that should be resolved.         | Blocking     |
| `BLOCKER`    | Supported severe defect, security risk, or unsafe merge consequence.   | Blocking     |

The execution reports exactly one outcome:

| Outcome      | Condition                                                      |
| ------------ | -------------------------------------------------------------- |
| `clean`      | Review completed with no `SHOULD FIX` or `BLOCKER` findings.   |
| `blocked`    | Review completed with at least one supported blocking finding. |
| `incomplete` | Review could not reach a trustworthy result.                   |

`SUGGESTION` findings MUST appear only in the review summary. `SHOULD FIX` and `BLOCKER`
findings MUST create review conversations that remain unresolved until a maintainer
accepts a correction or records why the finding is not applicable.

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

## Provider, account, and budget

The initial implementation uses Claude through Claude Code GitHub Actions, authenticated
with a dedicated MiKode-owned provider account rather than a maintainer's personal
development account. The exact model MAY change after evaluation without changing the ADR.

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
reviewer's trusted skill, standard, permissions, output contract, or security rules.

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

## Adoption

1. Create and validate the portable MiKode review skill.
2. Implement the reusable review workflow in `Mikode13/.github` with fixtures for clean,
   blocked, incomplete, obsolete, and adversarial results.
3. Evaluate representative historical changes with known defects and known-good changes.
4. Enable a blocking pilot in selected repositories. The first pilot is blocking; there is
   no advisory-only rollout stage.
5. Measure useful findings, false positives, omissions, duration, token use, and quota
   consumption before broader adoption.
6. Adopt the reviewed workflow through immutable caller revisions and enable the required
   check and conversation-resolution rules in each repository.

If the pilot is not reliable enough, pause further adoption while retaining the decision
and improve or replace the implementation through this standard. Removing the required AI
review requires a new ADR.

## References

- [ADR 0017: Use AI as a required pull request reviewer](../adr/0017-use-ai-as-a-required-pull-request-reviewer.md)
- [ADR 0013: Keep external validations manual by default](../adr/0013-keep-external-validations-manual-by-default.md)
- [Continuous integration standard](continuous-integration.md)
- [Git workflow standard](git-workflow.md)
- [Anthropic: Claude Code GitHub Actions](https://code.claude.com/docs/en/github-actions)
- [GitHub: Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use)
- [GitHub: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
