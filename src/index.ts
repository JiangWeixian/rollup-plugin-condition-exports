import type { Plugin } from 'rollup'
import setValue from 'set-value'
import path from 'path'
import fs from 'fs-extra'
import debug from 'debug'

type Output = Record<string, string | undefined> & {
  exports?: Record<string, any>
}

const output: Output = {}

const strip = (filename: string, replacement = '') => {
  return filename.replace(/(\.es\.js)|(\.js)|(\.ts)|(\.d\.ts)|(\.mjs)/g, replacement)
}

const normalize = (name: string) => {
  if (name === 'index') {
    return {
      import: `exports/.\/import`,
      types: `exports/.\/types`,
      require: `exports/.\/require`,
    }
  }
  return {
    import: `exports/.\\/${strip(name)}/import`,
    types: `exports/.\\/${strip(name)}/types`,
    require: `exports/.\\/${strip(name)}/require`,
  }
}

const NAME = 'rollup-plugin-condition-exports'

const log = debug(NAME)

export default function plugin(
  { declaration = true }: { declaration: boolean } = { declaration: true },
): Plugin {
  let shouldRun = false
  return {
    name: NAME,
    generateBundle(options, bundle, _isWrite) {
      const dir = options.dir === '.' ? '' : options.dir || ''
      shouldRun = !!options.dir
      if (!shouldRun) {
        log('Skip because of not in dir mode')
      }
      Object.keys(bundle).forEach((filename) => {
        if (!bundle[filename].name) {
          return
        }
        const exports = normalize(bundle[filename].name!)
        if (options.format === 'cjs' && options.dir) {
          // setup `exports.[module].require`
          setValue(output, exports.require, `./${path.join(dir, filename)}`, {
            separator: '/',
          })
          if (bundle[filename].name === 'index') {
            output.main = path.join(dir, filename)
          }
        }
        if (['es', 'esm'].includes(options.format) && options.dir) {
          // setup types
          if (declaration) {
            const typesFilename = strip(filename, '.d.ts')
            setValue(output, exports.types, `./${path.join(dir, typesFilename)}`, {
              separator: '/',
            })
            if (bundle[filename].name !== 'index') {
              setValue(
                output,
                `typesVersions/*/${strip(filename)}`,
                [`${path.join(dir, typesFilename)}`],
                {
                  separator: '/',
                },
              )
            }
          }
          if (bundle[filename].name === 'index') {
            output.module = path.join(dir, filename)
          }
          // setup `exports.[module].import`
          setValue(output, exports.import, `./${path.join(dir, filename)}`, {
            separator: '/',
          })
        }
      })
      // TODO: is needed?
      if (declaration) {
        output.typings = path.join(dir, 'index.d.ts')
      }
      setValue(output, `exports/.\\/package.json`, `./package.json`, {
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
