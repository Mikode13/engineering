# Licensing standard

- Status: Active
- Last reviewed: 2026-07-24
- Related ADRs: [ADR 0002: Use the Commons Clause with the MIT License for source-available software](../adr/0002-use-commons-clause-with-mit.md)

This standard is active because ADR 0002 has been accepted. It is documentation of an
intended licensing policy, not legal advice or a guarantee of legal protection.

## Scope

This standard applies to MiKode-owned software repositories and publishable packages that
choose the MiKode source-available licensing model.

It does not change the licenses of third-party dependencies. Each dependency keeps its
own license and attribution requirements. Projects must review those requirements
separately before redistribution.

## Rules

Projects adopting this standard MUST:

1. Include a completed `LICENSE` file at the repository root.
2. Start from [`templates/LICENSE.template`](../templates/LICENSE.template), replacing
   every `{{PLACEHOLDER}}` with project-specific values before publication.
3. Preserve the Commons Clause License Condition v1.0 and MIT License text, including
   their required notices, unless a separately approved legal change replaces the
   template.
4. Describe the effective license as the MIT License with the Commons Clause License
   Condition v1.0, or equivalent wording that makes the restriction clear.
5. Describe the project as source-available. Projects MUST NOT call software under this
   combined license “open source” or “MIT licensed” without also stating the Commons
   Clause restriction.
6. Configure package metadata to identify the complete license and not the SPDX `MIT`
   identifier alone.
7. Verify that the completed `LICENSE` file is included in every published artifact.
8. Keep copyright and attribution notices required by the complete license in source
   distributions, binary distributions, and substantial copies where applicable.

For an npm package using this custom license, npm documents the following metadata pattern:

```json
{
	"license": "SEE LICENSE IN LICENSE"
}
```

Other package managers SHOULD use their documented equivalent for a custom or unlisted
license. A package manager's metadata is not a substitute for including the complete
license text.

Projects MUST NOT remove or weaken the Commons Clause restriction by continuing to publish
the same project under an `MIT`-only identifier. A change to the effective license requires
a deliberate version boundary, updated documentation, and a new or superseding decision
where the change affects more than one project.

## Required configuration

Before publishing a project under this standard, maintainers MUST verify all of the
following:

```text
[ ] LICENSE exists at the repository root.
[ ] No {{PLACEHOLDER}} remains in LICENSE.
[ ] Software name, licensor, and copyright year are correct.
[ ] Package metadata describes the complete custom license.
[ ] README and package documentation say source-available, not open source.
[ ] Required third-party notices are present.
[ ] The published artifact contains LICENSE and required notices.
```

The standard license source is [`templates/LICENSE.template`](../templates/LICENSE.template).
The template is not effective for another repository until it has been completed, copied
to that repository, referenced by its metadata, and included in the published artifact.

## Exceptions

A project MAY use an OSI-approved open-source license, a proprietary license, or another
source-available license when its requirements make this standard unsuitable. The project
MUST state the exception in its README and package metadata, and MUST provide the complete
license text and attribution notices required by the selected license.

An exception for one project does not change this cross-project standard. A change to the
shared default requires a new or superseding ADR.

## Adoption

New MiKode software projects should decide their license before the first public release.
Projects that adopt this standard later should choose a clear release boundary, update
the repository license and package metadata together, and explain the change in release
notes. Licenses already granted for earlier releases should not be relabeled without
appropriate legal review.

Maintainers should have the completed license and any material license change reviewed by
the copyright holder and an appropriately qualified legal adviser before publication.

## References

- [ADR 0002: Use the Commons Clause with the MIT License for source-available software](../adr/0002-use-commons-clause-with-mit.md)
- [License template](../templates/LICENSE.template)
- [Commons Clause License Condition v1.0](https://commonsclause.com/)
- [The MIT License](https://opensource.org/license/mit)
- [The Open Source Definition](https://opensource.org/osd)
- [npm package.json `license` field](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#license)
- [SPDX License List](https://spdx.org/licenses/)
