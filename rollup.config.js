import esbuild from 'rollup-plugin-esbuild'
import alias from '@rollup/plugin-alias'
import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { externals } from 'rollup-plugin-node-externals'
import size from 'rollup-plugin-filesize'

export default defineConfig([
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: ['src/index.ts'],
    plugins: [
      // exclude dependencies and peerDependencies
      externals({
        devDeps: false,
        builtinsPrefix: 'strip',
      }),
      esbuild({
        target: 'es2020', // Node 14
      }), // so Rollup can convert TypeScript to JavaScript
      alias({
        resolve: ['.ts', '.js', '.tsx', '.jsx'],
        entries: [{ find: '@/', replacement: './src/' }],
      }),
      commonjs(),
      resolve({
        preferBuiltins: true,
      }),
      size(),
    ],
    output: [
      { dir: 'lib', format: 'cjs', entryFileNames: '[name].cjs' },
      { dir: 'lib', format: 'esm', entryFileNames: '[name].mjs' },
    ],
  },
])
