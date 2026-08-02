# Testing standard

- Status: Draft
- Last reviewed: 2026-08-02
- Related ADRs: [ADR 0009: Use Vitest with risk-based testing requirements](../adr/0009-use-vitest-with-risk-based-testing.md)

## Scope

This standard applies to MiKode JavaScript and TypeScript repositories that contain
executable logic or publish consumable technical configuration. It defines the test
runner, test boundaries, script interface, deterministic local gate, coverage role, and
adoption workflow.

Documentation-only repositories, including `mikode-engineering`, are exempt because they
have no executable behavior to test. Their link and formatting validation remains part of
their own change review.

## Rules

Projects adopting this standard MUST:

1. Use a supported stable Vitest 4 release. The initial adoption version is 4.1.10;
   prerelease Vitest majors MUST NOT be used in the mandatory test gate.
2. Import test APIs explicitly from `vitest`. Projects MUST NOT enable Vitest globals or
   add `vitest/globals` to the shared TypeScript configuration.
3. Provide a deterministic `pnpm test` command that terminates after running all unit and
   local integration tests once.
4. Keep the mandatory suite independent of third-party network access, credentials,
   provider availability, rate limits, and paid usage.
5. Unit-test every identified behavior partition of the unit under test, including the
   success case, expected failures, invalid inputs, relevant boundary values, and
   cancellation or timeout behavior when applicable.
6. Integration-test every identified critical path with real MiKode components connected
   together. Test doubles are allowed at external system boundaries, not in place of the
   internal collaboration the integration test exists to verify.
7. Give suites and tests behavior-oriented names that make the covered case or critical
   path understandable during review. When the mapping is not clear from the suite, the
   project MUST document it.
8. Separate tests that contact real providers or services behind
   `test:integration:external`. That command MUST NOT be called by `pnpm test` or the
   local `pre-push` hook.
9. When the project has instrumentable production source, provide V8 coverage for the
   mandatory suite through `pnpm test:coverage`, including all production source files in
   the report. Coverage is diagnostic evidence; no global MiKode percentage threshold
   applies.
10. Format, lint, and type-check test code under the same quality gate as production code.
11. Run `pnpm test` after `pnpm run check` in `pre-push`, as required by the
    [Git workflow standard](git-workflow.md).
12. Add `test:e2e` only when an application has user-visible flows that require an
    end-to-end boundary. Libraries and configuration packages MUST NOT add empty or
    artificial end-to-end suites.

A project MAY set a numeric coverage threshold when its risk profile justifies it. The
project SHOULD explain the threshold in its repository documentation. Meeting that
threshold does not relax the behavior-case or critical-path requirements.

## Test boundaries

### Unit

A unit test exercises one unit and replaces collaborators at its boundaries. A unit may
be a function, class, module, adapter method, state transition, or similarly focused
behavior. Unit tests SHOULD be fast enough to run continuously during development.

"Every identified behavior partition" means every specified class of behavior, not every
possible input value. Typical partitions include:

- valid results;
- each distinct expected error;
- empty, missing, minimum, maximum, or malformed values when relevant;
- alternate branches and state transitions; and
- cancellation, timeout, retry, or concurrency behavior when the unit owns it.

### Local integration

A local integration test verifies a critical collaboration using real project
components. It may replace a provider, database, queue, filesystem, clock, or network at
the outer boundary with a deterministic fake, local server, in-memory implementation, or
disposable local resource.

For an agent harness, a representative boundary is:

```text
public API -> provider selection -> adapter -> simulated external transport
```

Critical paths include successful execution, response normalization, expected error
translation, cancellation, and invalid configuration. Streaming, tool execution,
sessions, retries, and other paths become mandatory when the project implements them.

### External integration

An external integration test contacts a real third-party service. These tests verify
that credentials, request formats, SDK behavior, and response normalization remain
compatible with the live provider. They MUST be separately selectable because they may
be slow, flaky, rate-limited, secret-dependent, or billable.

The future CI/CD standard will decide whether external tests run manually, on a schedule,
or in a protected environment. Until then, they are opt-in and not required by the
default merge gate.

### End to end

An end-to-end test begins at an application's supported external entry point and follows
a complete user-visible flow. It is not a synonym for external integration and is not a
default requirement for packages.

## Required scripts

Projects with unit, local integration, and external integration boundaries expose this
interface, using Vitest projects or equivalent include patterns to select each suite:

```json
{
  "scripts": {
    "test": "pnpm run test:unit && pnpm run test:integration",
    "test:unit": "vitest run --project unit",
    "test:unit:watch": "vitest --project unit",
    "test:integration": "vitest run --project integration",
    "test:integration:external": "vitest run --project external",
    "test:coverage": "vitest run --project unit --project integration --coverage"
  },
  "devDependencies": {
    "@vitest/coverage-v8": "^4.1.10",
    "vitest": "^4.1.10"
  }
}
```

`test` is required for every project in scope. `test:unit` and `test:unit:watch` are
required when the project has unit behavior. `test:integration` is required when a
critical path crosses a component boundary. `test:coverage` is required when production
source can be instrumented. `test:integration:external` is required only for a project
that has a real external service boundary. `test:e2e` is required only for an application
whose test strategy includes end-to-end flows. Optional categories MUST NOT be represented
by placeholder commands that always succeed.

The exact test file layout MAY vary, but the categories MUST remain independently
selectable through the standard scripts. A typical layout is:

```text
tests/
├── unit/
├── integration/
└── external/
```

Vitest runs once with `vitest run`; plain `vitest` keeps a local watch process alive.
Watch mode belongs only in `test:unit:watch` and MUST NOT be used in hooks or CI.

## TypeScript and code-quality configuration

Vitest transpiles TypeScript test files but does not replace the project's TypeScript
quality gate. Every test file MUST belong to a TypeScript project used by `typecheck` and
by the shared type-aware ESLint configuration.

When the production `tsconfig.json` includes only `src`, place a second configuration
next to the tests:

```json
{
  "extends": "@mikode13/tsconfig/node",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["**/*.ts"]
}
```

Browser and React projects extend their corresponding shared entry point. The project
`typecheck` script MUST check both production and test configurations. The separate test
configuration also lets `@mikode13/code-quality` project service find type information
for test files.

For a project with root production configuration and `tests/tsconfig.json`, a typical
script is:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit && tsc --project tests/tsconfig.json --noEmit"
  }
}
```

This standard does not require a Vitest-specific export from `@mikode13/tsconfig`.
Explicit test imports avoid runner globals, while the existing Node, browser, and React
variants already define the environment and strictness that test code needs.

## Coverage

For projects with instrumentable production source, coverage MUST use Vitest's V8 provider
and include all production source files, not only files imported by the current tests.
Generated output, declarations, fixtures, and test files MAY be excluded; handwritten
production behavior MUST remain visible. Configuration-only packages MAY omit coverage
when they have no executable source to instrument; their integration tests still verify
the consumed configuration.

The report is a review aid that answers which lines, statements, functions, and branches
executed. It does not prove that assertions are correct or that the important behavior is
covered. MiKode therefore does not define an organization-wide 80%, 90%, or 100% gate.

## Shared package boundary

The first adoption will keep Vitest configuration in `harness`. MiKode MUST NOT add
executable testing configuration to `mikode-engineering` or couple Vitest-specific types
to `@mikode13/tsconfig`.

After the configuration has been validated in `harness` and repeated in another
repository, MiKode MAY propose an independent testing package. Until then, projects own a
small local Vitest configuration and depend on Vitest directly.

`@mikode13/git-hooks` does not need runner-specific logic. It continues to execute the
stable `pnpm test` interface owned by each consuming project.

## Exceptions

A JavaScript or TypeScript project MAY use another runner only when an external framework
or runtime makes Vitest unsupported or materially unsuitable. The repository MUST
document the constraint, preserve the complete script interface that applies to it, and
meet the same behavior-case, critical-path, determinism, and coverage-reporting rules.

A project MAY omit local integration tests only while it has no collaboration between
components to verify. It MUST add them when a critical path crosses a component boundary;
an always-successful placeholder script is not an acceptable long-term substitute.

## Adoption

`harness` is the pilot implementation. Its adoption change will add Vitest, test
projects, scripts, TypeScript coverage for test files, and initial unit and local
integration tests together.

After the pilot is validated, MiKode package repositories such as `tsconfig`,
`code-style`, `code-quality`, and `git-hooks` will adopt the standard in independent,
reviewable changes when they contain behavior or consumable configuration that needs
verification. Adoption changes MUST replace placeholder test scripts rather than preserve
false-success gates.

The published `@mikode13/tsconfig` compiler presets do not change merely to support
Vitest. The `tsconfig` repository itself may still need configuration-validation tests as
part of its own adoption.

This standard remains Draft until ADR 0009 is accepted. Draft adoption may produce
feedback, but failures against this document are warnings rather than violations of an
active standard.

## References

- [ADR 0009](../adr/0009-use-vitest-with-risk-based-testing.md)
- [Vitest getting started](https://vitest.dev/guide/)
- [Vitest command-line interface](https://vitest.dev/guide/cli)
- [Vitest test projects](https://vitest.dev/guide/projects)
- [Vitest coverage](https://vitest.dev/guide/coverage.html)
- [Git workflow standard](git-workflow.md)
- [TypeScript standard](typescript.md)
- [Code quality standard](code-quality.md)
