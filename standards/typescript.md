# TypeScript standard

- Status: Active
- Last reviewed: 2026-07-24
- Related ADRs: [ADR 0005: Use a strict shared TypeScript configuration via @mikode13/tsconfig](../adr/0005-use-strict-shared-typescript-configuration.md)

## Scope

This standard applies to all MiKode TypeScript repositories: Node.js libraries and
services, and React projects. It defines compiler configuration, not linting, naming, or
architecture rules.

## Rules

Projects adopting this standard MUST:

1. Use TypeScript 6.x. TypeScript 7 becomes the required line in a follow-up change once
   typescript-eslint supports it.
2. Extend the shared configuration instead of defining compiler options directly:
   `@mikode13/tsconfig/node` for Node.js code, `@mikode13/tsconfig/browser` for browser
   code without JSX, `@mikode13/tsconfig/react` for React code, or
   `@mikode13/tsconfig/base` when no environment applies.
3. Keep `strict` and the shared safety options enabled; a project MUST NOT weaken an
   option from the shared configuration.
4. Publish packages as ES modules only, with `"type": "module"` in `package.json`.
5. Run `tsc --noEmit` (or the build) as a CI check so type errors fail the build.

Projects MAY enable additional strictness locally (for example,
`exactOptionalPropertyTypes`) without documenting an exception, because that tightens
rather than weakens the shared configuration.

## Required configuration

A Node.js project's `tsconfig.json` is:

```json
{
  "extends": "@mikode13/tsconfig/node",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```

The executable configuration is maintained in the
[`mikode13/tsconfig`](https://github.com/mikode13/tsconfig) repository. Its current
`base.json`, `node.json`, `browser.json`, and `react.json` files match the configurations
documented below. Projects MUST consume the `@mikode13/tsconfig` package entry points
rather than create a divergent local copy. The configurations it ships are documented
here so the policy is readable without the package source.

`@mikode13/tsconfig/base`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  }
}
```

`@mikode13/tsconfig/node` (extends base):

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "target": "es2023",
    "lib": ["es2023"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

`@mikode13/tsconfig/browser` (extends base), for browser or universal code without JSX:

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "target": "es2022",
    "lib": ["es2022", "dom", "dom.iterable"],
    "noEmit": true
  }
}
```

`@mikode13/tsconfig/react` (extends browser):

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

Intent of the notable options:

- `noUncheckedIndexedAccess` makes `array[i]` and index-signature access include
  `undefined`, so missing-element handling is explicit.
- `verbatimModuleSyntax` forces `import type` for type-only imports, keeping emitted
  ESM predictable.
- `module: "nodenext"` follows Node.js module semantics for libraries executed directly
  by Node.js; the browser and React variants defer module handling to the bundler.
- The ECMAScript 2023 target matches the Node.js 22 floor from the
  [Node.js version standard](nodejs-version.md); the browser variant targets ECMAScript
  2022 and lets the bundler transpile further if its browser matrix requires it.
- `skipLibCheck` skips re-checking declaration files of dependencies, whose errors a
  project cannot fix locally.

## Exceptions

A project MAY override an environment-specific option (such as `target`, `lib`, or
output settings) when a deployment platform requires it, and MUST document the reason
in its repository. Weakening a base strictness option is not a project-level exception;
it requires a new or superseding ADR.

## Adoption

New projects extend the shared configuration before writing source code. Existing
projects enable the configuration in one change, fix the resulting type errors before
merging, and add the CI check in the same change. `noUncheckedIndexedAccess` typically
causes most new errors; fixing them is expected one-time adoption cost, not a reason to
disable the option.

## References

- [ADR 0005: Use a strict shared TypeScript configuration via @mikode13/tsconfig](../adr/0005-use-strict-shared-typescript-configuration.md)
- [@mikode13/tsconfig implementation](https://github.com/mikode13/tsconfig)
- [TypeScript tsconfig reference](https://www.typescriptlang.org/tsconfig/)
- [Community tsconfig bases](https://github.com/tsconfig/bases)
- [Node.js version standard](nodejs-version.md)
