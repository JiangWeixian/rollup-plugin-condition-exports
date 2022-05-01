import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import alias from '@rollup/plugin-alias'
import size from 'rollup-plugin-size'
import ce from 'rollup-plugin-condition-exports'
import { defineConfig } from 'rollup'

export default defineConfig([
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: {
      a: 'src/md.ts',
      index: 'src/index.ts',
    },
    plugins: [
      typescript(), // so Rollup can convert TypeScript to JavaScript
      alias({
        resolve: ['.ts', '.js', '.tsx', '.jsx'],
        entries: [{ find: '@/', replacement: './src/' }],
      }),
      commonjs(),
      ce({ disabledFields: ['types'] }),
      size(),
    ],
    output: [
      { dir: 'cjs', format: 'cjs' },
      { dir: 'es', entryFileNames: '[name].mjs', format: 'es' },
    ],
  },
])
