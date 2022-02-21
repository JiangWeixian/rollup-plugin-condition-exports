import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import alias from '@rollup/plugin-alias'
import size from 'rollup-plugin-size'
import ce from 'rollup-plugin-condition-exports'
import multiInput from 'rollup-plugin-multi-input';
import { defineConfig } from 'rollup'

export default defineConfig([
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: ['components/**/index.ts', 'components/index.ts'],
    plugins: [
      multiInput({
        relative: 'components/'
      }),
      typescript({
        tsconfigOverride: {
          exclude: ['src']
        }
      }), // so Rollup can convert TypeScript to JavaScript
      alias({
        resolve: ['.ts', '.js', '.tsx', '.jsx'],
        entries: [{ find: '@/', replacement: './src/' }],
      }),
      commonjs(),
      ce(),
      size(),
    ],
    output: [
      { dir: 'cjs', format: 'cjs' },
      { dir: 'es', entryFileNames: '[name].mjs', format: 'es' },
    ],
  },
])
