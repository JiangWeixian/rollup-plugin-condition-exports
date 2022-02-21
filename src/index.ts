import type { Plugin } from 'rollup'
import set from 'set-value'
import path from 'path'
import fs from 'fs-extra'
import debug from 'debug'

type Output = Record<string, string | undefined> & {
  exports?: Record<string, any>
}

const output: Output = {}

/**
 * Remove ext name
 */
const strip = (filename: string, replacement = '') => {
  return filename.replace(/(\.es\.js)|(\.js)|(\.ts)|(\.d\.ts)|(\.mjs)/g, replacement)
}

/**
 * Remove tail index node
 */
export const normalize = (name: string) => {
  let nodes = name.split('/')
  if (nodes[nodes.length - 1] === 'index') {
    nodes = nodes.splice(0, nodes.length - 1)
  }
  // if (nodes.join() === 'index') {
  //   return {
  //     import: `exports/.\/import`,
  //     types: `exports/.\/types`,
  //     require: `exports/.\/require`,
  //   }
  // }
  if (nodes.length === 0) {
    return {
      import: '',
      types: '',
      require: '',
    }
  }
  const finalName = nodes.join('/')
  return {
    import: `exports."./${finalName}".import`,
    types: `exports."./${finalName}".types`,
    require: `exports."./${finalName}".require`,
  }
}

const setValue = (object: any, path: string, value: any) => {
  set(object, path, value)
}

const NAME = 'rpce'

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
        console.log(filename, bundle[filename].name)
        const exports = normalize(bundle[filename].name!)
        if (options.format === 'cjs' && options.dir) {
          // setup `exports.[module].require`
          exports.require && setValue(output, exports.require, `./${path.join(dir, filename)}`)
          if (bundle[filename].name === 'index') {
            output.main = path.join(dir, filename)
          }
        }
        if (['es', 'esm'].includes(options.format) && options.dir) {
          // setup types
          if (declaration) {
            const typesFilename = strip(filename, '.d.ts')
            exports.types && setValue(output, exports.types, `./${path.join(dir, typesFilename)}`)
            if (bundle[filename].name !== 'index') {
              setValue(output, `typesVersions$*$${strip(filename)}`, [
                `${path.join(dir, typesFilename)}`,
              ])
            }
          }
          if (bundle[filename].name === 'index') {
            output.module = path.join(dir, filename)
          }
          // setup `exports.[module].import`
          exports.import && setValue(output, exports.import, `./${path.join(dir, filename)}`)
        }
      })
      if (declaration) {
        output.typings = path.join(dir, 'index.d.ts')
      }
      setValue(output, `exports..\/package`, `./package.json`)
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
