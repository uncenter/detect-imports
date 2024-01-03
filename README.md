# detect-imports

## Installation

```sh
npm i detect-imports
pnpm add detect-imports
yarn add detect-imports
bun add detect-imports
```

## Usage

```ts
import { detectImports } from 'detect-imports';

detectImports('import x from "y";');
// [
// 	{
// 		type: 'static',
// 		imports: 'x',
// 		specifier: 'y',
// 		code: 'import x from "y";',
// 		start: 0,
// 		end: 18,
// 		defaultImport: 'x',
// 		namespacedImport: undefined,
// 		namedImports: {},
// 	},
// ];

detectImports(`
import { a } from "b";
import type { C } from "d";
`);
// [
// 	{
// 		type: 'static',
// 		imports: '{ a }',
// 		specifier: 'b',
// 		code: 'import { a } from "b";\n',
// 		start: 1,
// 		end: 24,
// 		defaultImport: undefined,
// 		namespacedImport: undefined,
// 		namedImports: {
// 			a: 'a',
// 		},
// 	},
// 	{
// 		type: 'type',
// 		imports: '{ C } ',
// 		specifier: 'd',
// 		code: 'import type { C } from "d";\n',
// 		start: 24,
// 		end: 52,
// 	},
// ];
```

## License

[MIT](LICENSE)
