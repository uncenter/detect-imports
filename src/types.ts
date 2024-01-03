export type ESMImport = {
	type: 'static' | 'dynamic';
	code: string;
	start: number;
	end: number;
};

export type StaticImport = ESMImport & {
	type: 'static';
	imports: string;
	specifier: string;
	defaultImport?: string;
	namespacedImport?: string;
	namedImports?: { [name: string]: string };
};

export type TypeImport = Omit<ESMImport, 'type'> & {
	type: 'type';
	imports: string;
	specifier: string;
};
