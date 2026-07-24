# ADR 0004: Support Node.js 22 and later

- Status: Accepted
- Date: 2026-07-24

## Context

MiKode libraries and applications need an explicit Node.js support policy. Without one,
each project guesses which runtime features are safe to use, and consumers cannot tell
which Node.js versions a published package supports.

At the time of this decision, the Node.js release schedule is:

- Node.js 20 reached end of life in April 2026.
- Node.js 22 is in maintenance LTS until April 30, 2027.
- Node.js 24 is the active LTS line, supported until April 30, 2028.
- Node.js 26 is the current line and is scheduled to become LTS in October 2026. It is
  also the last line under the historical even/odd release model: starting with
  Node.js 27 (April 2027), Node.js releases one major per year and every major enters
  LTS.

The toolchain also sets a floor: pnpm 11 requires Node.js 22.13 or later, and ESLint 10
requires 20.19, 22.13, or 24 and later.

## Decision

MiKode packages will support Node.js 22.13 and later within actively maintained LTS
release lines. The `engines` range lists the supported LTS lines explicitly; a new line
is added after it enters LTS and is validated in CI. Development and CI primarily use
Node.js 24, the active LTS line.

Each project declares the supported range in `package.json` `engines` and pins the
development version in an `.nvmrc` file, as defined in the
[Node.js version standard](../standards/nodejs-version.md).

The minimum version is reviewed when a supported line reaches end of life or a new line
becomes LTS; raising it for published packages is a breaking change and follows the
project's versioning rules.

## Alternatives considered

### Minimum Node.js 24

Requiring the active LTS line would allow its newer APIs everywhere but would exclude
consumers still on Node.js 22, which receives security updates until April 2027. The
compatibility cost outweighs the feature gain while 22 remains supported.

### Minimum Node.js 20

Node.js 20 reached end of life in April 2026. Supporting an unmaintained runtime would
extend MiKode's support surface to versions that no longer receive security fixes.

### Tracking the newest pre-LTS release line

Release lines that have not yet entered LTS are still stabilizing, and under the model
used through Node.js 26, odd-numbered lines never received LTS at all. Building against
them would force consumers onto short-lived or unfinished runtimes.

### An open-ended range (`>=22.13.0`)

An open floor is common for libraries and never blocks a consumer on a newer runtime,
but it silently claims support for release lines that have not been tested and, under
the historical model, for odd-numbered lines that never become LTS. Listing LTS lines
explicitly keeps the declared support honest at the cost of a release per new LTS line.

## Consequences

### Positive

- Libraries state a clear, verifiable support range that consumers can rely on.
- Development happens on the recommended, actively supported LTS line.
- Language and API features available in Node.js 22 can be used unconditionally.
- The policy has a built-in review trigger tied to the official release schedule.

### Negative

- Features introduced after Node.js 22 cannot be used in published packages until the
  floor is raised.
- The floor must be actively reviewed around each April/October schedule change; a
  stale floor silently extends support to end-of-life runtimes.
- Each new LTS line requires a package release that extends the `engines` range before
  consumers on that line can install without engine warnings or failures.
- Raising the floor later is a breaking change for consumers.

## Related standards

- [Node.js version standard](../standards/nodejs-version.md)

## References

Version-sensitive research performed on 2026-07-24.

- [Node.js releases and schedule](https://nodejs.org/en/about/previous-releases)
- [Evolving the Node.js release schedule](https://nodejs.org/en/blog/announcements/evolving-the-nodejs-release-schedule)
- [Node.js end-of-life dates](https://nodejs.org/en/about/eol)
- [Node.js release schedule repository](https://github.com/nodejs/Release)
