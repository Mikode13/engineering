# Testing standard

- Status: Active
- Last reviewed: 2026-08-02
- Related ADRs: [ADR 0009: Use Vitest and Playwright with risk-based testing requirements](../adr/0009-use-vitest-and-playwright-with-risk-based-testing.md)

## Scope

This standard applies to MiKode JavaScript and TypeScript repositories that contain
executable logic or publish consumable technical configuration. It defines test runners,
test boundaries, regression requirements, file organization, test-data construction, the
shared script interface, the deterministic local gate, and the role of coverage.

Documentation-only repositories, including `mikode-engineering`, are exempt because they
have no executable behavior to test. Their link and formatting validation remains part of
their own change review.

## Rules

Projects adopting this standard MUST:

1. Use a supported stable Vitest 4 release for unit, component, local integration, and
   external integration tests. The initial adoption version is 4.1.10; prerelease Vitest
   majors MUST NOT be used in the mandatory test gate.
2. Use a supported stable Playwright Test 1 release for application end-to-end tests. The
   initial adoption version is 1.62.1; prerelease Playwright versions MUST NOT be used in
   a required test gate.
3. Import APIs explicitly from `vitest` or `@playwright/test`. Projects MUST NOT enable
   runner globals or add runner-specific globals to the shared TypeScript configuration.
4. Provide a deterministic `pnpm test` command that terminates after running every
   applicable offline Vitest project once.
5. Keep the mandatory suite independent of third-party network access, credentials,
   provider availability, rate limits, and paid usage.
6. Unit-test every identified behavior partition, including success, expected failures,
   invalid inputs, relevant boundary values, and cancellation or timeout behavior when
   applicable.
7. Component-test relevant user-visible states, interactions, and accessibility behavior
   in a real browser when a project publishes UI components.
8. Integration-test every identified critical collaboration with real MiKode components
   connected together. Test doubles are allowed at external boundaries, not in place of
   the internal collaboration the test exists to verify.
9. Add an automated regression test for every `fix` that changes executable behavior.
   The test MUST fail against the faulty behavior and pass with the fix.
10. Give suites and tests behavior-oriented names that make the covered case or critical
    path understandable during review. When the mapping is not clear from the suite, the
    project MUST document it.
11. Separate tests that contact real providers or services behind
    `test:integration:external`. That command MUST NOT be called by `pnpm test` or the
    local `pre-push` hook.
12. Keep Playwright end-to-end tests behind `test:e2e`. That command MUST NOT be called by
    `pnpm test` or the local `pre-push` hook.
13. Follow the required test roots, support-code directories, and filename suffixes in
    this standard. Projects MUST NOT invent an alternative layout.
14. Use deterministic typed factory functions as the default way to create non-trivial
    test data. Projects MUST NOT use unseeded random test data.
15. When the project has instrumentable production source, provide V8 coverage for the
    mandatory Vitest suite through `pnpm test:coverage`, including all production source
    files in the report. No global MiKode percentage threshold applies.
16. Format, lint, and type-check test code under the same quality gate as production code.
17. Run `pnpm test` after `pnpm run check` in `pre-push`, as required by the
    [Git workflow standard](git-workflow.md).

A project MAY set a numeric coverage threshold when its risk profile justifies it. The
project SHOULD explain the threshold in its repository documentation. Meeting that
threshold does not relax the behavior-case, component-state, critical-path, or regression
requirements.

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

### Component

A component test renders one UI component or a small component composition through Vitest
Browser Mode. It verifies user-visible behavior in a real browser without starting the
complete application. It SHOULD prefer accessible, user-facing locators and interactions
over component internals or CSS structure.

Component tests use Vitest with the Playwright browser provider. They remain part of the
mandatory offline suite when the project has UI components. The resolved versions of
`vitest` and `@vitest/browser-playwright` MUST match because the provider declares an exact
Vitest peer version. The Playwright library version MUST align with Playwright Test when
the project uses both component and end-to-end boundaries.

### Local integration

A local integration test verifies a critical collaboration using real project
components. It may replace a provider, database, queue, filesystem, clock, or network at
the outer boundary with a deterministic fake, local server, in-memory implementation, or
disposable local resource.

A representative boundary is:

```text
public entry point -> application service -> adapter -> simulated external boundary
```

Critical paths typically include successful execution, expected error translation,
cancellation, invalid configuration, persistence or transport mapping, and every other
cross-component behavior whose failure would break a primary capability.

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
a complete user-visible browser or HTTP flow. It runs through Playwright Test, not Vitest
Browser Mode, because it owns the complete application boundary rather than an isolated
component.

Applications SHOULD use Playwright's local `webServer` support when the end-to-end suite
targets a locally started application. Browser projects MUST configure the browsers
required by their support policy; the shared browser matrix will be decided with the
future frontend and CI/CD standards.

Libraries and configuration packages MUST NOT add empty or artificial end-to-end suites.

## Regression tests for fixes

Every `fix` to executable behavior MUST add a regression test at the narrowest boundary
that reproduces the defect:

- use a unit test when one unit contains the faulty behavior;
- use a component test when the defect is a component state or interaction;
- add or update a local integration test when the defect crosses a critical component
  boundary; and
- use an end-to-end regression when the failure can only be observed through the complete
  application flow.

A regression test MUST describe the reported behavior rather than the implementation of
the fix. Documentation, comment, and non-executable metadata corrections do not require a
regression test.

## Required file organization

Projects MUST use these roots and category names for every boundary they implement:

```text
vitest.config.ts
playwright.config.ts

tests/
├── tsconfig.json
├── unit/
├── component/
├── integration/
├── external/
└── support/
    ├── factories/
    ├── builders/
    ├── fixtures/
    └── fakes/

e2e/
├── tsconfig.json
├── specs/
├── fixtures/
└── pages/
```

Projects create only the directories they need; they MUST NOT add empty directories or
always-successful suites. Vitest files stay under `tests/`. Playwright Test files and
runner-specific support stay under the separate `e2e/` root. Runner configuration uses
`vitest.config.ts` and, when E2E exists, `playwright.config.ts` at the repository root.

Test and support files MUST use these suffixes:

| Purpose | Required path and suffix |
| --- | --- |
| Unit | `tests/unit/**/*.unit.test.{ts,tsx}` |
| Component | `tests/component/**/*.component.test.{ts,tsx}` |
| Local integration | `tests/integration/**/*.integration.test.{ts,tsx}` |
| External integration | `tests/external/**/*.external.test.{ts,tsx}` |
| End to end | `e2e/specs/**/*.e2e.test.{ts,tsx}` |
| Test-data factory | `tests/support/factories/**/*.factory.ts` |
| Test-data builder | `tests/support/builders/**/*.builder.ts` |
| Shared fixture | `tests/support/fixtures/**/*.fixture.ts` |
| Test fake | `tests/support/fakes/**/*.fake.ts` |
| Playwright fixture | `e2e/fixtures/**/*.fixture.ts` |
| Playwright page object | `e2e/pages/**/*.page.ts` |

Paths below a category SHOULD mirror the production capability or source hierarchy when
that makes navigation clearer. The category root and suffix remain mandatory.

## Test data

Plain typed factory functions are the default test-data pattern. A factory MUST:

- return a valid object by default;
- use stable, deterministic values;
- accept typed overrides for scenario-specific fields;
- avoid I/O, assertions, and shared mutable state; and
- expose a behavior-relevant name ending in `Factory` only when exporting an object, or a
  `create<Entity>` function when exporting a function.

Example:

```ts
export const createUser = (overrides: Partial<User> = {}): User => ({
	id: 'user-1',
	email: 'user@mikode.dev',
	role: 'user',
	...overrides,
});
```

Builders MAY be used for complex nested objects or object graphs where a small factory
with overrides becomes unclear. They live under `tests/support/builders/` and expose a
terminal `build()` method.

Object Mothers are not the default MiKode pattern. A reusable named scenario SHOULD be a
clearly named factory function or builder method so its relevant state remains visible at
the call site. MiKode does not require Fishery, Faker, or another test-data dependency.

If a project uses Faker, it MUST set an explicit seed and a fixed reference date so the
same dependency version reproduces failures. Property-based tests MAY use `fast-check` for
invariants, parsers, state machines, or large input spaces; they remain in the directory
and filename category of the boundary they test.

## Required scripts and runner configuration

A project with every Vitest boundary exposes:

```json
{
  "scripts": {
    "test": "pnpm run test:unit && pnpm run test:component && pnpm run test:integration",
    "test:unit": "vitest run --project unit",
    "test:unit:watch": "vitest --project unit",
    "test:component": "vitest run --project component",
    "test:integration": "vitest run --project integration",
    "test:integration:external": "vitest run --project external",
    "test:coverage": "vitest run --project unit --project component --project integration --coverage"
  },
  "devDependencies": {
    "@vitest/browser-playwright": "^4.1.10",
    "@vitest/coverage-v8": "^4.1.10",
    "playwright": "^1.62.1",
    "vitest": "^4.1.10"
  }
}
```

An application with end-to-end flows additionally exposes:

```json
{
  "scripts": {
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.62.1"
  }
}
```

`test` is required for every project in scope. Focused scripts are required only when the
corresponding boundary exists. The `test` and `test:coverage` aggregators include every
applicable mandatory offline project and exclude `external` and `e2e`. Optional
categories MUST NOT be represented by placeholder commands that always succeed.

Vitest projects MUST select the required directory and suffix pairs. Plain `vitest` keeps
a local watch process alive, so watch mode belongs only in `test:unit:watch` and MUST NOT
be used in hooks or CI.

`playwright.config.ts` MUST select the separate E2E root and suffix:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e/specs',
	testMatch: /.*\.e2e\.test\.tsx?$/,
});
```

Applications MUST install the Playwright browser binaries required by their configured
browser projects. The future CI/CD standard will define the shared installation and cache
workflow.

## TypeScript and code-quality configuration

Vitest and Playwright transpile TypeScript test files but do not replace the project's
TypeScript quality gate. Every test and support file MUST belong to a TypeScript project
used by `typecheck` and by the shared type-aware ESLint configuration.

When the production `tsconfig.json` includes only `src`, each test root adds an appropriate
local configuration. A Node.js `tests/tsconfig.json` starts with:

```json
{
  "extends": "@mikode13/tsconfig/node",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

Browser and React component tests extend their corresponding shared entry point. E2E test
code executes in the Playwright Node.js runner, so `e2e/tsconfig.json` extends
`@mikode13/tsconfig/node`. The project `typecheck` script MUST check production, `tests/`,
and `e2e/` configurations that exist.

This standard does not require runner-specific exports from `@mikode13/tsconfig`.
Explicit imports avoid runner globals, while the existing Node, browser, and React
variants define the environments and strictness test code needs.

## Coverage

For projects with instrumentable production source, coverage MUST use Vitest's V8 provider
and include all production source files, not only files imported by current tests.
Generated output, declarations, fixtures, support code, and test files MAY be excluded;
handwritten production behavior MUST remain visible. Configuration-only packages MAY omit
coverage when they have no executable source to instrument; their integration tests still
verify the consumed configuration.

The report is a review aid that answers which lines, statements, functions, and branches
executed. It does not prove that assertions are correct or that important behavior is
covered. MiKode therefore does not define an organization-wide 80%, 90%, or 100% gate.

## Shared package boundary

Projects own small local Vitest and Playwright configurations. MiKode MUST NOT add
executable testing configuration to `mikode-engineering` or couple runner-specific types
to `@mikode13/tsconfig`.

After substantially equivalent configuration has been validated independently in
multiple repositories, MiKode MAY propose an independent testing package. Until then,
projects depend on their runners directly and use plain local test-data factories.

`@mikode13/git-hooks` does not need runner-specific logic. It continues to execute the
stable `pnpm test` interface owned by each consuming project.

## Exceptions

A JavaScript or TypeScript project MAY use another runner only when an external framework
or runtime makes Vitest or Playwright unsupported or materially unsuitable. The
repository MUST document the constraint, preserve the complete applicable script
interface and required file organization, and meet the same behavior-case, critical-path,
regression, determinism, and coverage-reporting rules.

A project MAY omit a category only while it has no corresponding boundary. It MUST add
the category when that boundary appears; an always-successful placeholder is not an
acceptable substitute.

## Adoption

New MiKode repositories apply this standard before their first executable feature.
Existing repositories adopt it through independent, reviewable changes that migrate
runners, scripts, file organization, TypeScript coverage, and current tests together.
Adoption changes MUST replace placeholder test scripts rather than preserve false-success
gates.

The standard is project-independent: adoption instructions and configuration MUST NOT be
tied to a named pilot repository. Published `@mikode13/tsconfig` compiler presets do not
change merely to support the runners; a configuration repository may still need its own
integration tests to verify the configuration it publishes.

## References

- [ADR 0009](../adr/0009-use-vitest-and-playwright-with-risk-based-testing.md)
- [Vitest getting started](https://vitest.dev/guide/)
- [Vitest command-line interface](https://vitest.dev/guide/cli)
- [Vitest test projects](https://vitest.dev/guide/projects)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [Vitest component testing](https://vitest.dev/guide/browser/component-testing)
- [Vitest coverage](https://vitest.dev/guide/coverage.html)
- [Playwright Test](https://playwright.dev/docs/intro)
- [Playwright test configuration](https://playwright.dev/docs/api/class-testconfig)
- [Playwright API testing](https://playwright.dev/docs/api-testing)
- [Playwright web server](https://playwright.dev/docs/test-webserver)
- [Playwright fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Cypress testing types](https://docs.cypress.io/app/core-concepts/testing-types)
- [Object Mother](https://martinfowler.com/bliki/ObjectMother.html)
- [Fishery](https://github.com/thoughtbot/fishery)
- [Faker reproducible results](https://fakerjs.dev/guide/usage)
- [`fast-check`](https://fast-check.dev/docs/introduction/)
- [Git workflow standard](git-workflow.md)
- [TypeScript standard](typescript.md)
- [Code quality standard](code-quality.md)
