import type { Plugin } from 'rollup'

export default function plugin(): Plugin {
  const output: Record<string, string | undefined> = {}
  return {
    name: 'rollup-plugin-condition-exports',
    /* Type: (options: OutputOptions, bundle: { [fileName: string]: AssetInfo | ChunkInfo }, isWrite: boolean) => void  */
    /* Kind: async, sequential                                                                                          */
    options(options) {
      console.log('input-options', options)
      return options
    },

    generateBundle(options, _bundle, _isWrite) {
      if (options.format === 'cjs') {
        output.main = options.file
      }
      if (options.format === 'es') {
        output.module = options.file
      }
      output.type = 'index.d.ts'
      console.log(output)
    },

    /* Type: (bundle: { [fileName: string]: AssetInfo | ChunkInfo }) => void */
    /* Kind: async, parallel                                                  */
    writeBundle() {
      // write pkg json
    },
  }
}
