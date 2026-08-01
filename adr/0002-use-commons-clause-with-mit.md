# ADR 0002: Use the Commons Clause with the MIT License for source-available software

- Status: Accepted
- Date: 2026-07-24
- Domains: Shared
- Applies to: MiKode software adopting the source-available policy

## Context

MiKode wants to make the source code of its software available so that users can inspect,
use, modify, embed, and redistribute it. At the same time, the proposed licensing model
should prevent someone from selling the software itself, or a product or service whose
value derives entirely or substantially from the software, as defined by the clause.

The existing [`LICENSE.template`](../templates/LICENSE.template) expresses this idea by
combining the MIT License with the Commons Clause License Condition v1.0. That combination
must be described accurately: it is source-available, but it is not open source under the
Open Source Definition because the Commons Clause restricts selling the software.

## Decision

For MiKode software that adopts this policy, use the MIT License together with the
Commons Clause License Condition v1.0, using the exact legal text in
[`templates/LICENSE.template`](../templates/LICENSE.template) as the starting point.

The combined license is the effective license for the project. Projects adopting it
must:

- include a completed `LICENSE` file at the repository root;
- replace every template placeholder before publishing or distributing the software;
- describe the project as source-available, not open source or simply MIT licensed;
- identify the complete license in package metadata rather than representing it as the
  SPDX `MIT` license alone; and
- ensure the completed license is included in published artifacts.

This repository documents the policy and provides the template. It does not provide
legal advice or determine whether a particular project can adopt the license. The
copyright holder must confirm ownership of the code and obtain appropriate legal review
before publication.

## Alternatives considered

### MIT License alone

MIT alone is simple, widely understood, and permits commercial use, including selling the
software itself. It does not satisfy the proposed goal of reserving standalone resale as
a separately negotiated use.

### Another permissive license with the Commons Clause

The Commons Clause can be combined with a permissive base license. MIT was selected for
the initial template because the team already prepared the legal text and wants a short,
familiar base license. A different base license would require a separate decision,
especially if it adds patent, notice, or redistribution obligations.

### Copyleft licensing

GPL or AGPL could impose reciprocal source-sharing obligations, but those obligations are
broader and solve a different problem from the narrow standalone-sale restriction being
considered here.

### Proprietary licensing

A proprietary license could provide stronger control, but it would not provide the same
source availability and reuse permissions.

### No shared policy

Allowing each repository to choose independently would make the permissions and commercial
limits harder for users and downstream package consumers to understand.

## Consequences

### Positive

- Source remains available for inspection, modification, integration, and redistribution
  within the limits of the complete license.
- MiKode can allow commercial applications and value-added products while reserving the
  sale of the software itself.
- Projects have one reusable template and one consistent explanation of the model.
- The policy makes the difference between source-available and open-source software
  explicit.

### Negative

- The license is not OSI-approved open-source licensing, which may exclude users,
  ecosystems, or distribution channels that require an open-source license.
- The meaning of “Sell” and “substantially” requires careful communication and may need
  legal interpretation in particular situations.
- Package metadata and documentation cannot use the simple `MIT` identifier by itself.
- Adopting the policy may reduce compatibility with projects that require permissive
  open-source dependencies or standard SPDX license expressions.

## Related standards

- [Licensing standard](../standards/licensing.md)
- [License template](../templates/LICENSE.template)

## References

- [Commons Clause License Condition v1.0](https://commonsclause.com/)
- [The MIT License](https://opensource.org/license/mit)
- [The Open Source Definition](https://opensource.org/osd)
- [npm package.json `license` field](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#license)
