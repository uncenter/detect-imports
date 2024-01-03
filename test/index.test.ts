import type { StaticImport, TypeImport } from '../src/types';

import { expect, test } from 'vitest';

import { detectImports, findStaticImports } from '../src/index';

test('should detect a single static import', () => {
	const { specifier, imports } = findStaticImports(`import x from 'y'`).at(0);
	expect(specifier).toBe('y');
	expect(imports).toBe('x');
});

test('should detect multiple static imports', () => {
	const [one, two] = findStaticImports(
		`import x from 'y'; import { z } from 'abc';`,
	);

	expect(one.specifier).toBe('y');
	expect(one.imports).toBe('x');
	expect(one.defaultImport).toBe('x');
	expect(one.namedImports).toStrictEqual({});
	expect(one.namespacedImport).toBeUndefined();

	expect(two.specifier).toBe('abc');
	expect(two.imports).toBe('{ z }');
	expect(two.defaultImport).toBeUndefined();
	expect(two.namedImports).toHaveProperty('z');
	expect(two.namespacedImport).toBeUndefined();
});

test('should detect static and type imports', () => {
	const imports = detectImports(
		`import x from 'y'; import type { X } from 'y';`,
	);

	expect(imports.length).toBe(2);

	const [one, two] = imports as [StaticImport, TypeImport];

	expect(one.specifier).toBe('y');
	expect(one.imports).toBe('x');
	expect(one.defaultImport).toBe('x');
	expect(one.namedImports).toStrictEqual({});
	expect(one.namespacedImport).toBeUndefined();

	expect(two.specifier).toBe('y');
	expect(two.imports).toBe('{ X }');
});
