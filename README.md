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
    input: 'src/index.ts',
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

see [examples](https://github.com/JiangWeixian/rollup-plugin-condition-exports/examples/basic) from more details

`options`

- `declaration` - disable types setup

## know issues

object input is not supported

```js
input: {
  a: 'src/md.ts',
  index: 'src/index.ts',
}
```

## development

- **Setup** - `pnpm i`
- **Build** - `pnpm build`

# 
<div align='right'>

*built with ❤️ by 😼*

</div>

