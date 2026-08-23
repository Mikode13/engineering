# Node.js version standard

- Status: Active
- Last reviewed: 2026-08-23
- Related ADRs: [ADR 0004: Support Node.js 22 and later](../adr/0004-support-node-22-and-later.md), [ADR 0010: Use GitHub Actions with centralized reusable CI workflows](../adr/0010-use-github-actions-with-centralized-reusable-ci-workflows.md)

## Scope

This standard applies to all MiKode repositories that run on Node.js, including
libraries published to a registry and applications deployed as services or tools.

## Rules

Projects adopting this standard MUST:

1. Support Node.js 22.13 and later LTS lines; published packages MUST NOT require APIs
   unavailable in Node.js 22.
2. Declare the supported range in the `package.json` `engines` field.
3. Pin the development version with an `.nvmrc` file at the repository root.
4. Run static quality checks on Node.js 24, and run the mandatory test suite plus every
   applicable build on Node.js 22 and 24, following the
   [Continuous integration standard](continuous-integration.md).
5. Treat raising the minimum version of a published package as a breaking change.

Projects SHOULD review the minimum version when the Node.js release schedule changes
(a line reaching end of life or entering LTS, typically each April and October).

## Required configuration

`package.json`:

```json
{
  "engines": {
    "node": "^22.13.0 || ^24.0.0"
  }
}
```

The range explicitly lists the LTS lines MiKode supports. A new release line is added
only after it enters LTS and passes CI; Node.js 26 is expected to be added when it
enters LTS in October 2026. Extending the range requires a package release — the
accepted cost of not claiming support for untested runtimes.

`.nvmrc`:

```text
24
```

The major-only value lets version managers (nvm, fnm, and compatible tools) select the
latest installed 24.x release with `nvm use` or automatic directory switching.

## Exceptions

A project MAY require a newer minimum when it needs an API not available in Node.js 22.
The project MUST document the reason in its README and reflect it in `engines` and
`.nvmrc`. A project targeting a constrained platform (for example, a serverless runtime
pinned by a provider) MAY pin differently and MUST document the constraint.

## Adoption

New projects copy the configuration above before their first commit that runs code.
Existing projects add `engines` and `.nvmrc` together and verify the test suite passes
on the declared floor before publishing under it.

## References

- [ADR 0004: Support Node.js 22 and later](../adr/0004-support-node-22-and-later.md)
- [Node.js end-of-life dates](https://nodejs.org/en/about/eol)
- [Evolving the Node.js release schedule](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule)
- [npm `engines` field](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#engines)
- [nvm `.nvmrc` usage](https://github.com/nvm-sh/nvm#nvmrc)
- [Continuous integration standard](continuous-integration.md)
