# rollup-plugin-condition-exports

[![npm](https://img.shields.io/npm/v/rollup-plugin-condition-exports)](https://github.com/JiangWeixian/rollup-plugin-condition-exports) [![GitHub](https://img.shields.io/npm/l/rollup-plugin-condition-exports)](https://github.com/JiangWeixian/rollup-plugin-condition-exports) [![stackblitz](https://img.shields.io/badge/%E2%9A%A1%EF%B8%8Fstackblitz-online-blue)](https://stackblitz.com/github/JiangWeixian/rollup-plugin-condition-exports)

[Edit on StackBlitz ⚡️](https://stackblitz.com/github/JiangWeixian/rollup-plugin-condition-exports)

File system based api exports convention, like `nextjs`. files under `src/exports` will setup `main/module/typings/exports/typesVersions` in `package.json`

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

files under `src/exports` will setup `main/module/typings/exports/typesVersions` in `package.json`

```console
src
  exports
    feature
      node
      browser
    index.ts
```

👇 will setup fields in package

```json
{
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "require": "./dist/index.cjs",
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.ts"
    },
    "./feature": {
      "browser": {
        "require": "./dist/feature/browser.cjs",
        "import": "./dist/feature/browser.mjs",
        "types": "./dist/feature/browser.d.ts"
      },
      "node": {
        "require": "./dist/feature/node.cjs",
        "import": "./dist/feature/node.mjs",
        "types": "./dist/feature/node.d.ts"
      }
    }
  },
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "typesVersions": {
    "*": {
      "feature": [
        "dist/feature/node.d.ts",
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

### `dirs`

- types: `string | (string | PageOptions)[]`
- default: `src/exports`

Path to exports api directory

### `exclude`

- types: `string[]`

An array of glob patterns to exclude matches.

### `cjsExtension`

- types: `string`
- default: `cjs`

### `mjsExtension`

- types: `string`
- default: `mjs`

`exts: string | { cjs: string, es: string }`

### `outDir`

- types: `string`
- default: `dist`

Outdir of bundled files


### `declarationDir`

- types: `string`
- default: `dist`

Outdir of declaration files

### `conditions`

- types: `string[]`
- default: `['node', 'browser', 'deno']`

Condition exports name. checkout [nodejs#condition-exports](https://nodejs.org/api/packages.html#conditional-exports) for documentation about condition export names.

## development

- **Setup** - `pnpm i`
- **Build** - `pnpm build`

## credits

- <https://github.com/hannoeru/vite-plugin-pages>

# 
<div align='right'>

*built with ❤️ by 😼*

</div>

