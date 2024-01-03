import type { TypeImport, StaticImport } from './types';

function matchAll(
	regex: RegExp,
	string: string,
	addition: Record<never, never>,
) {
	const matches = [];
	for (const match of string.matchAll(regex)) {
		matches.push({
			...addition,
			...match.groups,
			code: match[0],
			start: match.index,
			end: match.index + match[0].length,
		});
	}
	return matches;
}

function clearImports(imports: string) {
	return (imports || '')
		.replace(/(\/\/[^\n]*\n|\/\*.*\*\/)/g, '')
		.replace(/\s+/g, ' ');
}

function getImportNames(cleanedImports: string) {
	const topLevelImports = cleanedImports.replace(/{([^}]*)}/, '');
	const namespacedImport = topLevelImports.match(/\* as \s*(\S*)/)?.[1];
	const defaultImport =
		topLevelImports
			.split(',')
			.find((index) => !/[*{}]/.test(index))
			?.trim() || undefined;

	return {
		namespacedImport,
		defaultImport,
	};
}

const ESM_STATIC_IMPORT_RE =
	/(?<=\s|^|;)import\s*([\s"']*(?<imports>[\p{L}\p{M}\w\t\n\r $*,/{}@.]+)from\s*)?["']\s*(?<specifier>(?<="\s*)[^"]*[^\s"](?=\s*")|(?<='\s*)[^']*[^\s'](?=\s*'))\s*["'][\s;]*/gmu;
const IMPORT_NAMED_TYPE_RE =
	/(?<=\s|^|;)import\s*type\s+([\s"']*(?<imports>[\w\t\n\r $*,/{}]+)from\s*)?["']\s*(?<specifier>(?<="\s*)[^"]*[^\s"](?=\s*")|(?<='\s*)[^']*[^\s'](?=\s*'))\s*["'][\s;]*/gm;
const TYPE_RE = /^\s*?type\s/;

export function findStaticImports(code: string): StaticImport[] {
	return matchAll(ESM_STATIC_IMPORT_RE, code, {
		type: 'static',
	})
		.map((imp) => {
			const cleanedImports = clearImports(imp.imports);

			const namedImports = {};
			for (const namedImport of cleanedImports
				.match(/{([^}]*)}/)?.[1]
				?.split(',') || []) {
				const [, source = namedImport.trim(), importName = source] =
					namedImport.match(/^\s*(\S*) as (\S*)\s*$/) || [];
				if (source && !TYPE_RE.test(source)) {
					namedImports[source] = importName;
				}
			}
			const { namespacedImport, defaultImport } =
				getImportNames(cleanedImports);

			return {
				...imp,
				imports: imp.imports.trim(),
				defaultImport,
				namespacedImport,
				namedImports,
			} as StaticImport;
		})
		.filter((imp) => !imp.code.startsWith('import type')) as StaticImport[];
}

export function findTypeImports(code: string): TypeImport[] {
	return [
		...matchAll(IMPORT_NAMED_TYPE_RE, code, { type: 'type' }),
		...matchAll(ESM_STATIC_IMPORT_RE, code, { type: 'static' }).filter(
			(match) => /[^A-Za-z]type\s/.test(match.imports),
		),
	].map((imp) => {
		return {
			...imp,
			imports: imp.imports.trim(),
		};
	});
}

export function detectImports(code: string) {
	return [...findStaticImports(code), ...findTypeImports(code)];
}
