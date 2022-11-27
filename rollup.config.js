import esbuild from 'rollup-plugin-esbuild'
import alias from '@rollup/plugin-alias'
import { defineConfig } from 'rollup'
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
      esbuild({
        target: 'es2020',
      }), // so Rollup can convert TypeScript to JavaScript
      alias({
        resolve: ['.ts', '.js', '.tsx', '.jsx'],
        entries: [{ find: '@/', replacement: './src/' }],
      }),
      // exclude dependencies and peerDependencies
      externals({
        devDeps: false,
      }),
      size(),
    ],
    output: [
      { dir: 'lib', format: 'cjs', entryFileNames: '[name].cjs' },
      { dir: 'lib', format: 'esm', entryFileNames: '[name].mjs' },
    ],
  },
])
