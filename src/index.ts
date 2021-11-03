import type { Plugin } from 'rollup'
import setValue from 'set-value'
import path from 'path'
import fs from 'fs-extra'
import debug from 'debug'
import { createFilter } from 'rollup-pluginutils'

type Output = Record<string, string | undefined> & {
  exports?: Record<string, any>
}

const output: Output = {}

const strip = (filename: string) => {
  return filename.replace(/(\.es\.js)|(\.js)|(\.ts)|(\.d\.ts)/g, '')
}

const NAME = 'rollup-plugin-condition-exports'

const log = debug(NAME)

export default function plugin(): Plugin {
  let hasTs = false
  let shouldRun = false
  const filter = createFilter([], [/tslib/g])
  return {
    name: NAME,
    /* Type: (options: OutputOptions, bundle: { [fileName: string]: AssetInfo | ChunkInfo }, isWrite: boolean) => void  */
    /* Kind: async, sequential                                                                                          */
    options(options) {
      hasTs =
        options.plugins?.some((p) => {
          if (typeof p === 'object') {
            return p?.name?.includes('typescript')
          }
          return false
        }) || false
      return options
    },

    generateBundle(options, bundle, _isWrite) {
      const dir = options.dir === '.' ? '' : options.dir || ''
      shouldRun = !!options.dir
      if (!shouldRun) {
        log('Skip because of not in dir mode')
      }
      if (options.format === 'cjs') {
        if (options.dir) {
          output.main = path.join(dir, 'index.js')
          Object.keys(bundle).forEach((filename) => {
            // tslib
            if (!filter(filename)) {
              return
            }
            // types files
            if (path.extname(filename) === '.ts') {
              return
            }
            setValue(
              output,
              `exports/.\\/${strip(filename)}/require`,
              `./${path.join(dir, filename)}`,
              {
                separator: '/',
              },
            )
          })
        }
      }
      if (options.format === 'es') {
        if (options.dir) {
          output.module = path.join(dir, 'index.es.js')
          Object.keys(bundle).forEach((filename) => {
            if (!filter(filename)) {
              return
            }
            if (path.extname(filename) === '.ts') {
              setValue(
                output,
                `exports/.\\/${strip(filename)}/types`,
                `./${path.join(dir, filename)}`,
                {
                  separator: '/',
                },
              )
              return
            }
            setValue(
              output,
              `exports/.\\/${strip(filename)}/import`,
              `./${path.join(dir, filename)}`,
              {
                separator: '/',
              },
            )
          })
        }
      }
      if (hasTs) {
        output.typings = path.join(dir, 'index.d.ts')
      }
      setValue(output, 'exports/.', './package.json', {
        separator: '/',
      })
      log('%O', output)
    },

    /* Type: (bundle: { [fileName: string]: AssetInfo | ChunkInfo }) => void */
    /* Kind: async, parallel                                                  */
    writeBundle() {
      if (shouldRun) {
        const pkg = fs.readJSONSync(path.resolve(process.cwd(), 'package.json'))
        const next = Object.assign(pkg, output)
        fs.writeJSONSync(path.resolve(process.cwd(), 'package.json'), next, {
          spaces: 2,
        })
      }
    },
  }
}
