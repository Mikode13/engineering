# MiKode Engineering

MiKode Engineering is the source of truth for cross-project engineering decisions,
standards, reusable documentation templates, and shared development practices.

This repository documents policy. Production implementations and consumable tooling
belong in their owning repositories.

## Start here

- [Architecture Decision Records](adr/README.md) preserve significant decisions and their
  trade-offs.
- [Standards](standards/README.md) define the current rules for MiKode projects.
- [Templates](templates/README.md) provide reusable starting files with explicit
  placeholders.

The [documentation standard](standards/documentation.md) defines ownership, required
project artifacts, and current architecture documentation. The
[documentation writing standard](standards/documentation-writing.md) defines the expected
technical writing style.

## Documenting a decision

Use the [ADR template](templates/ADR.template.md) and the next number from the
[ADR index](adr/README.md). Keep a new decision `Proposed` until it is explicitly accepted.
After acceptance, create or update the related active standard and any reusable template.

Keep historical reasoning in ADRs, current requirements in standards, and implementation
in the repository that owns the affected code or package.

## Validation

```sh
pnpm install --frozen-lockfile
pnpm run docs:check
```

The checks cover formatting, Markdown structure, internal links, tests, and repository
documentation invariants. External URL checks remain manual because remote availability
is not deterministic.

## License

The documentation in this repository is licensed under the
[Creative Commons Attribution 4.0 International License](LICENSE) (CC BY 4.0).

Software projects use the separate [MiKode licensing standard](standards/licensing.md).
