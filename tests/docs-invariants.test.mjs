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
		'[ADR 0001](adr/0001-use-example.md)\n[Example standard](standards/example.md)\n',
	);
	writeFileSync(
		path.join(root, 'adr', '0001-use-example.md'),
		'# ADR 0001: Use example\n\n- Status: Accepted\n- Date: 2026-08-30\n- Domains: Shared\n- Applies to: Example projects\n\n## Context\n',
	);
	writeFileSync(
		path.join(root, 'adr', 'README.md'),
		'# ADRs\n\n## Accepted decisions\n\n| ADR | Domains | Applies to | Decision |\n| --- | --- | --- | --- |\n| [0001](0001-use-example.md) | Shared | Example projects | Use example. |\n\n## Proposed decisions\n\n## Superseded decisions\n',
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

test('rejects an ADR missing from its index', () => {
	withFixture(root => {
		writeFileSync(
			path.join(root, 'adr', 'README.md'),
			'# ADRs\n\n## Accepted decisions\n\n## Proposed decisions\n\n## Superseded decisions\n',
		);

		assert.ok(
			validateEngineeringDocs(root).includes(
				'adr/0001-use-example.md: expected exactly one ADR index row, found 0',
			),
		);
	});
});

test('rejects an ADR indexed under a section that contradicts its status', () => {
	withFixture(root => {
		writeFileSync(
			path.join(root, 'adr', 'README.md'),
			'# ADRs\n\n## Accepted decisions\n\n## Proposed decisions\n\n| ADR | Domains | Applies to | Decision |\n| --- | --- | --- | --- |\n| [0001](0001-use-example.md) | Shared | Example projects | Use example. |\n\n## Superseded decisions\n',
		);

		assert.ok(
			validateEngineeringDocs(root).includes(
				'adr/0001-use-example.md: status Accepted must be indexed under Accepted decisions',
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
