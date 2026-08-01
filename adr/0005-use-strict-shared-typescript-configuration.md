# ADR 0005: Use a strict shared TypeScript configuration via @mikode13/tsconfig

- Status: Accepted
- Date: 2026-07-24
- Domains: Shared
- Applies to: TypeScript libraries and applications

## Context

MiKode projects are written in TypeScript, and each new repository currently has to
decide compiler strictness, target, and module settings from scratch. Divergent
configurations make code non-portable between projects and weaken the guarantees the
type system can give.

Relevant facts at the time of this decision:

- TypeScript 6.0 (released March 2026) is the last release built on the original
  JavaScript codebase. TypeScript 7.0 (released July 2026) is the first stable release
  of the native Go compiler; both implement the same language.
- typescript-eslint, which MiKode plans to use for type-aware linting, currently
  supports TypeScript versions below 6.1, so TypeScript 7 cannot yet be part of the
  linted toolchain.
- MiKode targets Node.js 22 and later and publishes ESM-only packages
  ([ADR 0004](0004-support-node-22-and-later.md)).

## Decision

MiKode will share one strict TypeScript configuration through the independent
[`@mikode13/tsconfig`](https://github.com/mikode13/tsconfig) package, which projects extend
instead of writing their own compiler options.

The package ships four configurations:

- `@mikode13/tsconfig/base` — language strictness only, environment-agnostic. Enables
  `strict` plus additional safety options: `noUncheckedIndexedAccess`,
  `noImplicitOverride`, and `noFallthroughCasesInSwitch`.
- `@mikode13/tsconfig/node` — extends base for Node.js libraries and services:
  `module: "nodenext"`, ECMAScript 2023 target and library, and declaration output for
  published packages.
- `@mikode13/tsconfig/browser` — extends base for browser code without JSX (DOM
  libraries, universal packages built with a bundler): DOM libraries and bundler
  module resolution.
- `@mikode13/tsconfig/react` — extends browser for React projects, adding
  `jsx: "react-jsx"`.

Projects use TypeScript 6.x. TypeScript 7 is adopted in a follow-up change once
typescript-eslint supports it; because 6.0 and 7.0 implement the same language, that
migration is expected to be configuration-compatible.

MiKode packages compile and publish ES modules only (`"type": "module"`). Dual
CommonJS/ESM publishing is not part of this decision. Node.js 22.12 and later can
`require()` synchronous ES modules, which narrows the CommonJS interoperability gap on
supported Node.js versions, though a module graph that uses top-level await remains
unavailable to `require()`.

The exact option values are defined in the
[TypeScript standard](../standards/typescript.md). This repository documents them; the
executable configuration lives in the independent
[`@mikode13/tsconfig`](https://github.com/mikode13/tsconfig) package.

## Alternatives considered

### Per-project configuration

Copying a tsconfig into each repository works initially but drifts immediately: options
get toggled locally and never propagate back. A shared package makes upgrades a
dependency update.

### Community base configs (`@tsconfig/bases`)

The community `@tsconfig/node22` and related bases are well maintained and informed the
chosen option values. They were not adopted directly because MiKode also wants its
strictness extras and React variant under one versioned package with one upgrade path.
The shared package may itself extend a community base internally; that is an
implementation detail of `@mikode13/tsconfig`.

### `strict: true` only, or maximum strictness

Plain `strict` leaves indexed access unchecked, a common source of runtime `undefined`
errors. At the other end, `exactOptionalPropertyTypes` and
`noPropertyAccessFromIndexSignature` frequently conflict with third-party type
definitions. The selected middle tier adds the high-value checks while staying
compatible with the ecosystem. Projects can enable stricter options locally.

### Adopting TypeScript 7 immediately

TypeScript 7 is faster, but typescript-eslint's supported range currently excludes it,
and type-aware linting is part of the planned toolchain. Waiting costs little because
the 6.x and 7.x languages are aligned.

### Dual ESM and CommonJS publishing

Dual publishing maximizes consumer compatibility but doubles build outputs and invites
dual-package hazards (two copies of one module in a process). With Node.js 22.12+ able
to `require()` synchronous ESM, ESM-only publishing serves CommonJS consumers on
supported Node.js versions except where a module graph uses top-level await.

## Consequences

### Positive

- Every MiKode project gets identical, strict compiler behavior from one dependency.
- Indexed-access and override mistakes are caught at compile time from day one, rather
  than being retrofitted later.
- One place to manage the TypeScript 7 migration when the toolchain is ready.
- ESM-only output keeps builds simple and matches the ecosystem direction.

### Negative

- The strictness extras produce more compile errors up front, especially
  `noUncheckedIndexedAccess`, which requires handling `undefined` on index access.
- Projects cannot use TypeScript 7's build-speed improvements yet.
- ESM-only packages exclude consumers on Node.js versions older than the supported
  floor that cannot `require()` ESM.
- Projects depend on the independently maintained `@mikode13/tsconfig` package and must
  coordinate configuration changes through package releases.

## Related standards

- [TypeScript standard](../standards/typescript.md)

## References

Version-sensitive research performed on 2026-07-24. TypeScript 7.0.2 was the latest
stable release; typescript-eslint 8.65.0 declared a TypeScript peer range of
`>=4.8.4 <6.1.0`.

- [Announcing TypeScript 6.0](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [Announcing TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [TypeScript tsconfig reference](https://www.typescriptlang.org/tsconfig/)
- [Community tsconfig bases](https://github.com/tsconfig/bases)
- [Node.js: `require()` of ES modules](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require)
