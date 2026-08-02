# ADR 0009: Use Vitest and Playwright with risk-based testing requirements

- Status: Accepted
- Date: 2026-08-02
- Domains: Shared, Delivery
- Applies to: MiKode JavaScript and TypeScript repositories with executable code or consumable technical configuration

## Context

MiKode needs a shared testing contract before repository CI checks are standardized and
new projects begin implementing independently. Without one, repositories can expose
incompatible scripts, classify tests differently, organize test code unpredictably, and
give the shared `pre-push` hook no stable command to execute.

The testing policy must distinguish a test boundary from an execution mode. Unit,
component, integration, external integration, and end to end describe what is connected
under test; watch describes a local process that reruns tests after files change. The
generic `test` script must remain a terminating, deterministic command that hooks and CI
can invoke, while developers also need focused commands for each boundary.

MiKode publishes ES modules and uses TypeScript with Node.js 22 and 24. The selected
runners should work with TypeScript and ESM without forcing test-runner globals into the
shared compiler configuration. At the time of research, the latest stable Vitest release
is 4.1.10 and the latest stable Playwright Test release is 1.62.1. Both support the MiKode
Node.js lines. Vitest 5 remains under a beta tag. Version-sensitive facts were verified
against the npm registry and official documentation on 2026-08-02.

A single organization-wide coverage percentage would be easy to enforce but would not
show whether assertions are meaningful or important behavior was tested. MiKode instead
needs unit tests for every identified behavior case, component tests for relevant UI
states, and integration tests for critical collaborations. Coverage remains useful for
finding code that the suite never executes, but it is evidence for review rather than a
substitute for a test strategy.

Every executable bug fix also needs a regression test. Without one, the repository keeps
no automated proof that the reported failure is reproducible or that the correction stays
in place.

The mandatory suite must be safe to run before every push. Tests that contact real
providers require network access, credentials, time, and sometimes money; complete
end-to-end suites may also require application processes and browser binaries. These
boundaries need separate commands and must not accidentally join the local gate.

Test data and file organization also need a predictable convention. A contributor opening
an unfamiliar MiKode project should be able to locate a test, understand its boundary from
its filename, and reuse deterministic data setup without learning a project-specific
layout.

## Decision

MiKode will use the supported stable Vitest 4 release line for unit, component, local
integration, and external integration tests. The initial adoption version is 4.1.10.
Projects will import `describe`, `expect`, `it`, `vi`, and other APIs explicitly from
`vitest`; test globals will remain disabled.

MiKode will use the supported stable Playwright Test 1 release line for end-to-end tests
of applications. The initial adoption version is 1.62.1. Playwright will own complete
browser or HTTP user flows, application startup, browser isolation, and end-to-end
fixtures. Vitest Browser Mode may run component tests through its Playwright provider,
but it will not replace Playwright Test for complete application flows.

Projects will classify tests by boundary:

- **Unit tests** exercise one unit with collaborators replaced at its boundaries. They
  must cover every identified behavior partition, including successful results, expected
  failures, invalid inputs, relevant boundary values, and cancellation or timeout behavior
  when applicable.
- **Component tests** render one UI component or a small component composition in a real
  browser through Vitest Browser Mode. They verify user-visible states, interactions, and
  accessibility behavior without starting the complete application.
- **Local integration tests** connect the real MiKode components in a critical
  collaboration and replace only external systems. They may use deterministic in-memory
  or disposable local resources, but must not require third-party network access,
  credentials, or paid usage.
- **External integration tests** exercise a real provider or service. They remain
  explicitly opt-in and outside the default local gate because they may be slow, flaky,
  rate-limited, credential-dependent, or billable.
- **End-to-end tests** start at an application's supported external entry point and follow
  a complete user-visible flow with Playwright Test. Libraries and configuration packages
  do not add end-to-end tests merely to satisfy the standard.

Every adopting project will expose the applicable parts of this script contract:

- `test` runs the complete mandatory offline Vitest suite once.
- `test:unit` runs unit tests once.
- `test:unit:watch` watches unit tests during local development.
- `test:component` runs component tests once when the project has UI components.
- `test:integration` runs local integration tests once when the project has a critical
  collaboration to verify.
- `test:integration:external` runs real-service integration tests when the project has
  such a boundary.
- `test:coverage` runs the mandatory offline Vitest suite with V8 coverage.
- `test:e2e` runs Playwright end-to-end tests when the project is an application that
  needs them.

`test` is always present. Each focused script is added when that boundary exists, and
`test:coverage` is required when the project has instrumentable production source.
Projects will not add always-successful placeholders for absent suites.

The existing Git workflow remains unchanged: `pre-push` runs `pnpm run check` and then
`pnpm test`. External integration and end-to-end suites do not join that hook. CI will run
the same mandatory suite; the exact scheduling and required-check layout for external and
end-to-end tests belongs to the future CI/CD decision.

All projects will use the same category roots and filename suffixes. Vitest tests live
under `tests/`; Playwright end-to-end tests live under the separate `e2e/` root. Projects
create only the category directories they use, but they may not substitute a different
path or naming pattern. Unit, component, local integration, external integration, and
end-to-end files use `.unit.test.ts`, `.component.test.tsx`,
`.integration.test.ts`, `.external.test.ts`, and `.e2e.test.ts` respectively, allowing
`.tsx` where JSX is required.

Plain typed factory functions with deterministic valid defaults will be the default test
data pattern. A test passes typed overrides to express only the values relevant to its
scenario. Builders may be added for complex nested objects or object graphs. Object
Mothers, a mandatory factory library, random Faker values, and hidden shared mutable
fixtures will not be the default. Faker may be used only with an explicit seed and fixed
reference date. Property-based testing with `fast-check` may complement example-based
tests when a unit exposes invariants or a large input space.

Every `fix` that changes executable behavior will add an automated regression test at the
narrowest boundary that reproduces the failure. When the defect crosses a critical
component boundary, the change will also add or update a local integration test. The test
must fail against the faulty behavior and pass with the fix; documentation-only
corrections are outside this requirement.

Projects will make critical paths and behavior cases reviewable through descriptive test
suite names or project documentation. A test is required because it protects a specified
behavior or risk, not because it increases a percentage.

Vitest V8 coverage will include all production source files so untouched files and
branches remain visible. MiKode will not set an organization-wide numeric coverage
threshold. A project may set a stricter threshold when its risk profile justifies one,
but the threshold does not replace the required behavior cases and critical-path tests.

Test code must pass the same formatting, linting, and type-checking gates as production
code. A project whose production `tsconfig.json` excludes tests will add project-local
test TypeScript configurations that extend the appropriate `@mikode13/tsconfig` entry
points. Explicit imports mean this decision does not add Vitest or Playwright globals to
the shared TypeScript package.

No shared testing package or test-data library will be created as part of this decision.
Each project will keep a small local runner configuration. After the same configuration
has been validated independently in multiple repositories, MiKode may propose an
independent shared package; this engineering repository will continue to contain
documentation only.

## Alternatives considered

### Use the Node.js test runner

`node:test` is stable and would avoid a third-party unit runner. In the supported Node.js
24 documentation, however, watch mode and coverage remain experimental, while module
mocking is in early development and requires an experimental flag. TypeScript execution
and browser component testing would also need additional strategies. It was not selected
because Vitest supplies the required TypeScript, ESM, watch, mocking, project-selection,
component, and coverage workflow as one supported tool.

### Use Jest

Jest has a mature ecosystem and familiar APIs, but its current ESM documentation still
describes ESM support as experimental and requires Node's experimental VM modules flag.
MiKode is ESM-only, so this adds configuration and mocking differences without providing
a required benefit.

### Use Cypress for end-to-end tests

Cypress provides a strong interactive browser workflow for end-to-end and component
tests. It was not selected because Playwright provides the required TypeScript,
cross-browser, isolation, local-server, API-request, UI, and trace capabilities while also
serving as the browser provider recommended by Vitest when no provider has already been
selected. Choosing Cypress would add a second browser automation ecosystem without a
MiKode requirement that depends on it.

### Use Vitest Browser Mode for complete end-to-end tests

Vitest Browser Mode runs tests and components in a real browser, but its component-testing
boundary remains different from starting and exercising a complete application.
Playwright Test provides the dedicated application lifecycle, fixtures, browser contexts,
and full-flow tooling required for end-to-end tests.

### Let every project choose its own tools, paths, and filenames

Project autonomy would avoid migration work, but it would reintroduce the script and
organization drift this decision is intended to remove. Shared hooks, CI, future project
initialization, and contributors moving between repositories need one predictable
interface and layout.

### Require Object Mothers for test data

Object Mothers provide named canned scenarios, but a shared mother can accumulate many
scenario methods and hide which fields matter to a test. Deterministic typed factory
functions with explicit overrides provide the needed reuse with less indirection. Builders
remain available when object graphs become too complex for a small factory.

### Adopt a factory or random-data library immediately

Libraries such as Fishery offer typed associations, sequences, traits, and persistence
hooks, while Faker produces realistic random data. Current projects have not demonstrated
a need for that dependency or complexity. Plain factories remain the baseline; Faker is
permitted only when made reproducible, and a shared factory library can be reconsidered
after repeated real use.

### Enforce one global coverage threshold

Thresholds such as 80%, 90%, or 100% make a simple numeric gate but measure execution,
not assertion quality or risk coverage. A global target can reward low-value tests and
penalize defensive or environment-specific code. It was rejected in favor of requiring
identified behavior cases and critical paths while retaining coverage as a diagnostic
report.

### Run real-provider and end-to-end tests in the mandatory suite

This would detect more integration drift on every push, but it would make local work
depend on credentials, connectivity, provider availability, browser setup, rate limits,
and cost. These tests remain valuable as separate suites.

### Publish shared testing configuration before repeated adoption

An independent package could centralize runner configuration immediately, but MiKode has
not yet validated the complete layout across different project types. Creating that
package now would freeze assumptions and add maintenance before real duplication exists.

## Consequences

### Positive

- Every repository exposes one deterministic command for hooks and CI plus focused
  commands for its applicable test boundaries.
- Vitest aligns with MiKode's TypeScript and ESM-only baseline for fast and browser
  component tests.
- Playwright provides one explicit, cross-browser end-to-end runner for applications.
- Fixed folders and suffixes make tests and support code predictable across repositories.
- Unit requirements focus on specified behavior cases, component tests on user-visible
  states, and integration requirements on critical collaborations.
- Every executable fix leaves a regression test that protects the corrected behavior.
- Deterministic factories keep scenario data clear without a mandatory data library.
- External services and end-to-end setup cannot make the mandatory pre-push suite flaky,
  credential-dependent, or billable.
- Coverage reports reveal untouched files and branches without turning an arbitrary
  organization-wide percentage into the quality goal.
- Explicit runner imports keep test globals out of the shared TypeScript configuration.

### Negative

- Vitest, its V8 coverage provider, Playwright Test, and browser binaries add development
  and environment cost to the projects that use their boundaries.
- Existing repositories using another runner, layout, or placeholder script require
  separate migration work.
- Running local integration and component tests in `pre-push` increases push time as
  projects grow.
- Separating external and end-to-end tests means the mandatory suite cannot detect every
  provider or full-application regression.
- Fixed folders and suffixes reduce project-level freedom.
- Without a universal numeric threshold, reviewers must judge whether the behavior cases
  and critical paths are complete.
- Plain local factories and runner configuration may be duplicated until a stable shared
  shape is proven.

## Related standards

- [Testing standard](../standards/testing.md)
- [Git workflow standard](../standards/git-workflow.md)
- [TypeScript standard](../standards/typescript.md)

## References

- [Vitest getting started](https://vitest.dev/guide/)
- [Vitest command-line interface](https://vitest.dev/guide/cli)
- [Vitest test projects](https://vitest.dev/guide/projects)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [Vitest component testing](https://vitest.dev/guide/browser/component-testing)
- [Vitest coverage](https://vitest.dev/guide/coverage.html)
- [Vitest releases](https://github.com/vitest-dev/vitest/releases)
- [Vitest on npm](https://www.npmjs.com/package/vitest)
- [Playwright Test](https://playwright.dev/docs/intro)
- [Playwright test configuration](https://playwright.dev/docs/api/class-testconfig)
- [Playwright API testing](https://playwright.dev/docs/api-testing)
- [Playwright web server](https://playwright.dev/docs/test-webserver)
- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright Test on npm](https://www.npmjs.com/package/@playwright/test)
- [Cypress testing types](https://docs.cypress.io/app/core-concepts/testing-types)
- [Object Mother](https://martinfowler.com/bliki/ObjectMother.html)
- [Fishery](https://github.com/thoughtbot/fishery)
- [Faker reproducible results](https://fakerjs.dev/guide/usage)
- [`fast-check`](https://fast-check.dev/docs/introduction/)
- [Node.js test runner](https://nodejs.org/docs/latest-v24.x/api/test.html)
- [Node.js ECMAScript modules](https://nodejs.org/docs/latest-v24.x/api/esm.html)
- [Jest ECMAScript modules](https://jestjs.io/docs/ecmascript-modules)
