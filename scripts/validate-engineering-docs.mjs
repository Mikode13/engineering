import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ADR_STATUSES = new Set(['Accepted', 'Deprecated', 'Proposed', 'Superseded']);
const ADR_DOMAINS = new Set(['Backend', 'Delivery', 'Frontend', 'Shared']);
const STANDARD_STATUSES = new Set(['Active', 'Deprecated', 'Draft']);

const ADR_INDEX_SECTIONS = {
	Accepted: 'Accepted decisions',
	Deprecated: 'Deprecated decisions',
	Proposed: 'Proposed decisions',
	Superseded: 'Superseded decisions',
};

const STANDARD_INDEX_SECTIONS = {
	Active: 'Active standards',
	Deprecated: 'Deprecated standards',
	Draft: 'Draft standards',
};

const normalizeWhitespace = value => value.trim().replace(/\s+/g, ' ');

const readDocument = file => readFileSync(file, 'utf8');

const markdownSections = markdown => {
	const sections = new Map();
	let currentSection;

	for (const line of markdown.split('\n')) {
		if (line.startsWith('## ')) {
			currentSection = line.slice(3).trim();
			sections.set(currentSection, []);
			continue;
		}

		if (currentSection) {
			sections.get(currentSection).push(line);
		}
	}

	return sections;
};

const documentMetadata = markdown => {
	const metadata = new Map();
	let currentField;

	for (const line of markdown.split('\n').slice(1)) {
		if (line.startsWith('## ')) {
			break;
		}

		const field = /^- ([^:]+):\s*(.*)$/.exec(line);
		if (field) {
			currentField = field[1];
			metadata.set(currentField, field[2]);
			continue;
		}

		if (currentField && /^\s{2,}\S/.test(line)) {
			metadata.set(currentField, `${metadata.get(currentField)} ${line.trim()}`);
		}
	}

	return metadata;
};

const validDate = value => {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
};

const requireMetadata = (errors, file, metadata, field) => {
	const value = normalizeWhitespace(metadata.get(field) ?? '');
	if (!value) {
		errors.push(`${file}: missing ${field} metadata`);
	}
	return value;
};

const adrIndexRows = markdown => {
	const rows = [];

	for (const [section, lines] of markdownSections(markdown)) {
		for (const line of lines) {
			const row = /^\|\s*\[(\d{4})\]\(([^)]+\.md)\)\s*\|\s*([^|]+)\|\s*([^|]+)\|/.exec(line);
			if (row) {
				rows.push({
					number: row[1],
					file: row[2],
					domains: normalizeWhitespace(row[3]),
					appliesTo: normalizeWhitespace(row[4]),
					section,
				});
			}
		}
	}

	return rows;
};

const standardIndexEntries = markdown => {
	const entries = [];

	for (const [section, lines] of markdownSections(markdown)) {
		for (const line of lines) {
			const entry = /^- \[[^\]]+\]\(([^)]+\.md)\)/.exec(line);
			if (entry) {
				entries.push({ file: entry[1], section });
			}
		}
	}

	return entries;
};

const validateAdrs = root => {
	const errors = [];
	const directory = path.join(root, 'adr');
	const files = readdirSync(directory)
		.filter(file => file !== 'README.md' && file.endsWith('.md'))
		.sort();
	const indexRows = adrIndexRows(readDocument(path.join(directory, 'README.md')));
	const rootReadme = readDocument(path.join(root, 'README.md'));

	files.forEach((file, index) => {
		const filename = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.exec(file);
		if (!filename) {
			errors.push(`adr/${file}: filename must use NNNN-lowercase-kebab-case.md`);
			return;
		}

		const number = filename[1];
		const expectedNumber = String(index + 1).padStart(4, '0');
		if (number !== expectedNumber) {
			errors.push(`adr/${file}: expected sequential ADR number ${expectedNumber}`);
		}

		const markdown = readDocument(path.join(directory, file));
		if (!markdown.startsWith(`# ADR ${number}: `)) {
			errors.push(`adr/${file}: title must start with # ADR ${number}:`);
		}

		const metadata = documentMetadata(markdown);
		const status = requireMetadata(errors, `adr/${file}`, metadata, 'Status');
		const date = requireMetadata(errors, `adr/${file}`, metadata, 'Date');
		const domains = requireMetadata(errors, `adr/${file}`, metadata, 'Domains');
		const appliesTo = requireMetadata(errors, `adr/${file}`, metadata, 'Applies to');

		if (status && !ADR_STATUSES.has(status)) {
			errors.push(`adr/${file}: unsupported status ${status}`);
		}
		if (date && !validDate(date)) {
			errors.push(`adr/${file}: Date must be a real YYYY-MM-DD value`);
		}

		const parsedDomains = domains ? domains.split(',').map(normalizeWhitespace) : [];
		const invalidDomains = parsedDomains.filter(domain => !ADR_DOMAINS.has(domain));
		if (invalidDomains.length > 0) {
			errors.push(`adr/${file}: unsupported domains ${invalidDomains.join(', ')}`);
		}
		if (new Set(parsedDomains).size !== parsedDomains.length) {
			errors.push(`adr/${file}: Domains must not contain duplicates`);
		}

		const matchingRows = indexRows.filter(row => row.file === file);
		if (matchingRows.length !== 1) {
			errors.push(`adr/${file}: expected exactly one ADR index row, found ${matchingRows.length}`);
		} else {
			const row = matchingRows[0];
			const expectedSection = ADR_INDEX_SECTIONS[status];
			if (expectedSection && row.section !== expectedSection) {
				errors.push(`adr/${file}: status ${status} must be indexed under ${expectedSection}`);
			}
			if (row.number !== number) {
				errors.push(`adr/${file}: ADR index number ${row.number} does not match filename`);
			}
			if (row.domains !== domains) {
				errors.push(`adr/${file}: ADR index domains do not match document metadata`);
			}
			if (row.appliesTo !== appliesTo) {
				errors.push(`adr/${file}: ADR index applicability does not match document metadata`);
			}
		}

		const rootLink = `adr/${file}`;
		const rootOccurrences = rootReadme.split(rootLink).length - 1;
		if (status === 'Proposed' && rootOccurrences !== 0) {
			errors.push(`adr/${file}: proposed ADRs must not be indexed in the root README`);
		}
		if (status !== 'Proposed' && rootOccurrences === 0) {
			errors.push(`adr/${file}: ${status} ADR is missing from the root README`);
		}
	});

	for (const row of indexRows) {
		if (!files.includes(row.file)) {
			errors.push(`adr/README.md: index references missing ADR file ${row.file}`);
		}
	}

	return errors;
};

const validateStandards = root => {
	const errors = [];
	const directory = path.join(root, 'standards');
	const files = readdirSync(directory)
		.filter(file => file !== 'README.md' && file.endsWith('.md'))
		.sort();
	const indexEntries = standardIndexEntries(readDocument(path.join(directory, 'README.md')));
	const rootReadme = readDocument(path.join(root, 'README.md'));

	for (const file of files) {
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(file)) {
			errors.push(`standards/${file}: filename must use lowercase-kebab-case.md`);
		}

		const metadata = documentMetadata(readDocument(path.join(directory, file)));
		const status = requireMetadata(errors, `standards/${file}`, metadata, 'Status');
		if (status && !STANDARD_STATUSES.has(status)) {
			errors.push(`standards/${file}: unsupported status ${status}`);
		}

		const matchingEntries = indexEntries.filter(entry => entry.file === file);
		if (matchingEntries.length !== 1) {
			errors.push(
				`standards/${file}: expected exactly one standards index entry, found ${matchingEntries.length}`,
			);
		} else {
			const expectedSection = STANDARD_INDEX_SECTIONS[status];
			if (expectedSection && matchingEntries[0].section !== expectedSection) {
				errors.push(`standards/${file}: status ${status} must be indexed under ${expectedSection}`);
			}
		}

		if (status === 'Active' && !rootReadme.includes(`standards/${file}`)) {
			errors.push(`standards/${file}: active standard is missing from the root README`);
		}
	}

	for (const entry of indexEntries) {
		if (!files.includes(entry.file)) {
			errors.push(`standards/README.md: index references missing standard ${entry.file}`);
		}
	}

	return errors;
};

export const validateEngineeringDocs = root => [...validateAdrs(root), ...validateStandards(root)];

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
	const root = path.resolve(process.argv[2] ?? '.');
	const errors = validateEngineeringDocs(root);

	if (errors.length > 0) {
		console.error('Engineering document invariants failed:');
		for (const error of errors) {
			console.error(`- ${error}`);
		}
		process.exitCode = 1;
	} else {
		console.log('Engineering document invariants passed.');
	}
}
