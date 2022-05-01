# rollup-plugin-condition-exports
*auto setup `main/module/typings/exports/typesVersions`*

[![npm](https://img.shields.io/npm/v/rollup-plugin-condition-exports)](https://github.com/JiangWeixian/rollup-plugin-condition-exports) [![GitHub](https://img.shields.io/npm/l/rollup-plugin-condition-exports)](https://github.com/JiangWeixian/rollup-plugin-condition-exports) [![stackblitz](https://img.shields.io/badge/%E2%9A%A1%EF%B8%8Fstackblitz-online-blue)](https://stackblitz.com/github/JiangWeixian/rollup-plugin-condition-exports)

[Edit on StackBlitz ⚡️](https://stackblitz.com/github/JiangWeixian/rollup-plugin-condition-exports)

## install

```console
pnpm i rollup-plugin-condition-exports
```

## usage

```diff
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
+import ce from 'rollup-plugin-condition-exports'
import { defineConfig } from 'rollup'

export default defineConfig([
  {
    input: ['src/index.ts', 'src/do-something'],
    plugins: [
      typescript(), // so Rollup can convert TypeScript to JavaScript
      commonjs(),
+     ce(),
    ],
    output: [
      { dir: 'cjs', format: 'cjs' },
      { dir: 'es', entryFileNames: '[name].mjs', format: 'es' },
    ],
  },
])
```

👇 will setup fields in package

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts",
    },
    "./do-something": {
      "import": "./dist/do-something/index.mjs",
      "require": "./dist/do-something/index.cjs",
      "types": "./dist/do-something/index.d.ts",
    },
    "./package.json": "./package.json",
  },
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "typesVersions": {
    "*": {
      "do-something": [
        "dist/do-something/index.d.ts",
      ],
    },
  },
}
```

see [examples](https://github.com/JiangWeixian/rollup-plugin-condition-exports/examples/basic) from more details

## `options`

`package.json` `main/module/typings/exports/typesVersions` fields controlled by follows options.

- `exports` formation will be `[dir]/[name].[ext]`
- `typesVersions` formation will be `[dir|types.dir]/[name].d.ts`
- `main/module/types` formation will be `[dir]/index.[ext]`, only working if index name exit

`types: boolean | { dirs: string }`

enable setup `typesVersions` field.

`names: string[]`

default infer from rollup bundle info

`formats: ['cjs', 'es']`

default infer from rollup options, enable/disable exports.require or exports.import

`dirs: string | { cjs: string, es: string }`

default infer from rollup bundle info

`exts: string | { cjs: string, es: string }`

bundle file extname

`glob: string[]`

useful for like `react-components` project, get all exports module name by `fast-glob's patterns`

`base: string`

replace prefix string of glob result.

`disabledFields: string[]`

force disable some fields, regardless of other settings

## development

- **Setup** - `pnpm i`
- **Build** - `pnpm build`

# 
<div align='right'>

*built with ❤️ by 😼*

</div>

