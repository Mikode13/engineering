# Cross-platform script utilities standard

- Status: Active
- Last reviewed: 2026-09-05
- Related ADRs: [ADR 0016: Centralize cross-platform script utilities in a shared MiKode package](../adr/0016-centralize-cross-platform-script-utilities.md)

## Scope

This standard applies to MiKode Node.js and TypeScript repositories whose
`package.json` build or maintenance scripts need operations that are not portable
across supported platform shells.

## Rules

Build and maintenance scripts SHOULD remain portable across supported platforms.

When [`@mikode13/cross-platform`](https://github.com/Mikode13/cross-platform) already
provides the required operation, repositories SHOULD prefer it over introducing an
equivalent repository-local solution.

Repositories MAY use another cross-platform solution when it better fits the concrete
case. They SHOULD NOT introduce a POSIX-only command or require a POSIX-compatible shell
when that makes the script fail on another supported native platform.

A cross-platform operation needed by only one repository MAY remain local. If the same
operation is needed by a second MiKode repository, it SHOULD be considered for addition
to `@mikode13/cross-platform`. A first use that is expected to recur MAY be recorded as
a candidate so the duplication is recognized when it appears again.

Implementation details, supported operations, CLI syntax, and API behavior belong in the
package documentation rather than this standard.

## Adoption

New build and maintenance scripts SHOULD follow this standard. Existing scripts can
migrate when the relevant script or dependency is next changed; adoption does not
require a broad unrelated rewrite.

## References

- [ADR 0016: Centralize cross-platform script utilities in a shared MiKode package](../adr/0016-centralize-cross-platform-script-utilities.md)
- [`@mikode13/cross-platform` implementation repository](https://github.com/Mikode13/cross-platform)
