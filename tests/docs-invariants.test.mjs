import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { validateEngineeringDocs } from '../scripts/validate-engineering-docs.mjs';

const createFixture = () => {
	const root = mkdtempSync(path.join(tmpdir(), 'engineering-docs-'));
	mkdirSync(path.join(root, 'adr'));
	mkdirSync(path.join(root, 'standards'));

	writeFileSync(
		path.join(root, 'README.md'),
		'[ADRs](adr/README.md)\n[Standards](standards/README.md)\n[Templates](templates/README.md)\n',
	);
	writeFileSync(
		path.join(root, 'adr', '0001-use-example.md'),
		'# ADR 0001: Use example\n\n- Status: Accepted\n- Date: 2026-08-30\n- Domains: Shared\n- Applies to: Example projects\n\n## Context\n',
	);
	writeFileSync(
		path.join(root, 'adr', 'README.md'),
		'# ADRs\n\n## Decisions\n\n| ADR | Status | Domains | Applies to | Decision |\n| --- | --- | --- | --- | --- |\n| [0001](0001-use-example.md) | Accepted | Shared | Example projects | Use example. |\n',
	);
	writeFileSync(
		path.join(root, 'standards', 'example.md'),
		'# Example standard\n\n- Status: Active\n- Last reviewed: 2026-08-30\n\n## Scope\n',
	);
	writeFileSync(
		path.join(root, 'standards', 'README.md'),
		'# Standards\n\n## Active standards\n\n- [Example standard](example.md)\n\n## Draft standards\n',
	);

	return root;
};

const withFixture = assertion => {
	const root = createFixture();
	try {
		assertion(root);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
};

test('accepts a consistent engineering document set', () => {
	withFixture(root => assert.deepEqual(validateEngineeringDocs(root), []));
});

test('rejects a root README that does not link to a canonical index', () => {
	withFixture(root => {
		const readmePath = path.join(root, 'README.md');
		const readme = readFileSync(readmePath, 'utf8');
		writeFileSync(readmePath, readme.replace('[Templates](templates/README.md)\n', ''));

		assert.ok(
			validateEngineeringDocs(root).includes(
				'README.md: missing navigation link to templates/README.md',
			),
		);
	});
});

test('rejects an ADR missing from its index', () => {
	withFixture(root => {
		writeFileSync(path.join(root, 'adr', 'README.md'), '# ADRs\n\n## Decisions\n');

		assert.ok(
			validateEngineeringDocs(root).includes(
				'adr/0001-use-example.md: expected exactly one ADR index row, found 0',
			),
		);
	});
});

test('rejects an ADR index status that contradicts its document', () => {
	withFixture(root => {
		const indexPath = path.join(root, 'adr', 'README.md');
		const index = readFileSync(indexPath, 'utf8');
		writeFileSync(indexPath, index.replace('| Accepted |', '| Proposed |'));

		assert.ok(
			validateEngineeringDocs(root).includes(
				'adr/0001-use-example.md: ADR index status does not match document metadata',
			),
		);
	});
});

test('rejects ADR index metadata that differs from the document', () => {
	withFixture(root => {
		const indexPath = path.join(root, 'adr', 'README.md');
		const index = readFileSync(indexPath, 'utf8');
		writeFileSync(indexPath, index.replace('Example projects', 'All repositories'));

		assert.ok(
			validateEngineeringDocs(root).includes(
				'adr/0001-use-example.md: ADR index applicability does not match document metadata',
			),
		);
	});
});

test('rejects a non-sequential ADR number', () => {
	withFixture(root => {
		writeFileSync(
			path.join(root, 'adr', '0003-skip-number.md'),
			'# ADR 0003: Skip number\n\n- Status: Proposed\n- Date: 2026-08-30\n- Domains: Shared\n- Applies to: Example projects\n\n## Context\n',
		);

		assert.ok(
			validateEngineeringDocs(root).includes(
				'adr/0003-skip-number.md: expected sequential ADR number 0002',
			),
		);
	});
});

test('rejects a standard indexed under a section that contradicts its status', () => {
	withFixture(root => {
		writeFileSync(
			path.join(root, 'standards', 'README.md'),
			'# Standards\n\n## Active standards\n\n## Draft standards\n\n- [Example standard](example.md)\n',
		);

		assert.ok(
			validateEngineeringDocs(root).includes(
				'standards/example.md: status Active must be indexed under Active standards',
			),
		);
	});
});
