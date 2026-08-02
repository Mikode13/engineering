# ADR 0009: Use Vitest with risk-based testing requirements

- Status: Proposed
- Date: 2026-08-02
- Domains: Shared, Delivery
- Applies to: MiKode JavaScript and TypeScript repositories with executable code or consumable technical configuration

## Context

MiKode needs a shared testing contract before repository CI checks are standardized and
before `harness` grows beyond its initial provider experiments. Without one, repositories
can expose incompatible scripts, classify tests differently, and give the shared
`pre-push` hook no stable command to execute.

The testing policy must distinguish test intent from execution mode. Unit and integration
describe the boundary under test; watch describes a local process that reruns tests after
files change. The generic `test` script must remain a terminating, deterministic command
that hooks and CI can invoke, while developers also need a command that runs only unit
tests and an optional watch command for local feedback.

MiKode publishes ES modules and uses TypeScript with Node.js 22 and 24. The selected test
runner should therefore work with TypeScript and ESM without forcing test-runner globals
into the shared compiler configuration. At the time of research, the latest stable Vitest
release is 4.1.10 and its Node.js engine range is compatible with both supported MiKode
Node.js lines. Vitest 5 is still published under a beta tag. Version-sensitive facts were
verified against the npm registry and official documentation on 2026-08-02.

A single organization-wide coverage percentage would be easy to enforce but would not
show whether the assertions are meaningful or whether the important behavior was tested.
MiKode instead needs unit tests for every identified behavior case and integration tests
for the critical paths. Coverage remains useful for finding code that the suite never
executes, but it is evidence for review rather than a substitute for a test strategy.

The mandatory suite must also be safe to run before every push. Tests that contact real
providers require network access, credentials, time, and sometimes money; they cannot be
part of the deterministic local gate.

## Decision

MiKode will use the supported stable Vitest 4 release line as the default test
runner for JavaScript and TypeScript projects. The initial adoption version is 4.1.10.
Projects will import `describe`, `expect`, `it`, `vi`, and other APIs explicitly from
`vitest`; test globals will remain disabled.

Projects will classify tests by boundary:

- **Unit tests** exercise one unit with collaborators replaced at its boundaries. They
  must cover every identified behavior partition, including successful results, expected
  failures, invalid inputs, relevant boundary values, and cancellation or timeout behavior
  when applicable.
- **Local integration tests** connect the real MiKode components in a critical path and
  replace only external systems. They may use deterministic in-memory or disposable local
  resources, but must not require third-party network access, credentials, or paid usage.
- **External integration tests** exercise a real provider or service. They remain
  explicitly opt-in and outside the default local gate because they may be slow, flaky,
  rate-limited, credential-dependent, or billable.
- **End-to-end tests** are required only when an application has user-visible flows that
  cannot be adequately covered at the previous boundaries. Libraries and configuration
  packages do not add end-to-end tests merely to satisfy the standard.

Every adopting project will expose the applicable parts of this script contract:

- `test` runs the complete mandatory offline suite once: unit and local integration.
- `test:unit` runs unit tests once.
- `test:unit:watch` watches unit tests during local development.
- `test:integration` runs local integration tests once when the project has a critical
  collaboration to verify.
- `test:integration:external` runs real-service integration tests when the project has
  such a boundary.
- `test:coverage` runs the mandatory offline suite with V8 coverage.
- `test:e2e` runs end-to-end tests when the project is an application that needs them.

`test` is always present. Each focused script is added when that boundary exists, and
`test:coverage` is required when the project has instrumentable production source.
Projects will not add always-successful placeholders for absent suites.

The existing Git workflow remains unchanged: `pre-push` runs `pnpm run check` and then
`pnpm test`. External integration and end-to-end suites do not join that hook. CI will run
the same mandatory suite; the exact scheduling and required-check layout for external and
end-to-end tests belongs to the future CI/CD decision.

Projects will make critical paths and behavior cases reviewable through descriptive test
suite names or project documentation. A test is required because it protects a specified
behavior or risk, not because it increases a percentage.

Vitest V8 coverage will include all production source files so untouched files and
branches remain visible. MiKode will not set an organization-wide numeric coverage
threshold. A project may set a stricter threshold when its risk profile justifies one,
but the threshold does not replace the required behavior cases and critical-path tests.

Test code must pass the same formatting, linting, and type-checking gates as production
code. A project whose production `tsconfig.json` excludes tests will add a project-local
test TypeScript configuration that extends the appropriate `@mikode13/tsconfig` entry
point. Test APIs will be explicitly imported, so this decision does not add Vitest globals
or runner-specific types to the shared TypeScript package.

No shared testing package will be created as part of this decision. `harness` will be the
first adoption and will keep its Vitest configuration local. After another repository
adopts the same model, MiKode may extract stable repeated configuration into an
independent package; this engineering repository will continue to contain documentation
only. Existing package repositories will adopt the standard in separate changes after
the initial configuration has been validated.

## Alternatives considered

### Use the Node.js test runner

`node:test` is stable and would avoid a third-party runner. In the supported Node.js 24
documentation, however, watch mode and coverage remain experimental, while module mocking
is in early development and requires an experimental flag. TypeScript execution and
coverage would also need an additional project strategy. It was not selected as the
cross-project default because Vitest supplies the required TypeScript, ESM, watch,
mocking, project-selection, and coverage workflow as one supported tool.

### Use Jest

Jest has a mature ecosystem and familiar APIs, but its current ESM documentation still
describes ESM support as experimental and requires Node's experimental VM modules flag.
MiKode is ESM-only, so this adds configuration and mocking differences without providing
a benefit required by the current projects.

### Let every project choose its own runner and script names

Project autonomy would avoid migration work, but it would reintroduce the script and
configuration drift this decision is intended to remove. Shared hooks, CI, and future
project initialization need one predictable interface.

### Enforce one global coverage threshold

Thresholds such as 80%, 90%, or 100% make a simple numeric gate but measure execution,
not assertion quality or risk coverage. A global target can reward low-value tests and
penalize defensive or environment-specific code. It was rejected in favor of requiring
identified behavior cases and critical paths while retaining coverage as a diagnostic
report.

### Run real-provider tests in the mandatory suite

This would detect provider drift on every push, but it would make local work depend on
credentials, connectivity, provider availability, rate limits, and cost. Real-provider
tests remain valuable as a separate external integration suite.

### Publish shared testing configuration before the first adoption

An independent package could centralize Vitest configuration immediately, but MiKode has
not yet validated the required project layout, TypeScript setup, or external-test
boundary. Creating that package now would freeze assumptions and add maintenance before
real duplication exists. Local adoption in `harness` will establish the reusable shape
first.

## Consequences

### Positive

- Every repository exposes one deterministic command for hooks and CI plus focused
  commands for unit, integration, watch, coverage, and external tests.
- The default runner aligns with MiKode's TypeScript and ESM-only baseline.
- Unit requirements focus on specified behavior cases, and integration requirements
  focus on critical paths.
- External services cannot make the mandatory pre-push suite flaky, credential-dependent,
  or billable.
- Coverage reports reveal untouched files and branches without turning an arbitrary
  organization-wide percentage into the quality goal.
- Explicit Vitest imports keep runner-specific globals out of the shared TypeScript
  configuration.
- The first implementation can be refined before MiKode commits to another shared
  package.

### Negative

- Vitest and its V8 coverage provider add development dependencies to adopting projects.
- Existing repositories using `node:test`, another runner, or placeholder scripts require
  separate migration work.
- Running local integration tests in `pre-push` increases push time as projects grow.
- Separating real-provider tests means the mandatory suite cannot by itself detect every
  external API change.
- Without a universal numeric threshold, reviewers must judge whether the behavior cases
  and critical paths are complete.
- Project-local configuration may be duplicated until a stable shared shape is proven.

## Related standards

- [Testing standard](../standards/testing.md)
- [Git workflow standard](../standards/git-workflow.md)
- [TypeScript standard](../standards/typescript.md)

## References

- [Vitest getting started](https://vitest.dev/guide/)
- [Vitest command-line interface](https://vitest.dev/guide/cli)
- [Vitest test projects](https://vitest.dev/guide/projects)
- [Vitest coverage](https://vitest.dev/guide/coverage.html)
- [Vitest releases](https://github.com/vitest-dev/vitest/releases)
- [Vitest on npm](https://www.npmjs.com/package/vitest)
- [Node.js test runner](https://nodejs.org/docs/latest-v24.x/api/test.html)
- [Node.js ECMAScript modules](https://nodejs.org/docs/latest-v24.x/api/esm.html)
- [Jest ECMAScript modules](https://jestjs.io/docs/ecmascript-modules)
