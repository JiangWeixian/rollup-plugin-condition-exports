import type { Plugin } from 'rollup'
import path from 'path'
import fs from 'fs-extra'
import debug from 'debug'
import { exportsTemplate, ExportsTemplateParams } from '@lotips/core/exports-template'

const NAME = 'rpce'

const log = debug(NAME)

type Options = Partial<ExportsTemplateParams>

export default function plugin(
  { types = true, exts, ...params }: Options = { types: true },
): Plugin {
  const names: string[] = []
  const formats: ExportsTemplateParams['formats'] = []
  const dirs: {
    cjs: string
    esm: string
  } = {
    cjs: 'cjs',
    esm: 'mjs',
  }
  return {
    name: NAME,

    generateBundle(options, bundle) {
      const dir = options.dir || 'dist'
      if (options.format !== 'cjs' && options.format !== 'es') {
        return
      }
      formats.push(options.format)
      if (options.format === 'cjs') {
        Object.keys(bundle)
          .filter((filename) => bundle[filename].name)
          .forEach((filename) => {
            names.push(bundle[filename].name!)
          })
      }
      dirs[options.format] = dir
    },

    writeBundle() {
      let pkg = fs.readJSONSync(path.resolve(process.cwd(), 'package.json'))
      const exports = exportsTemplate({
        names: params.names || names,
        dirs: params.dirs || dirs,
        exts,
        types,
        formats: params.formats || formats,
      })
      log('exports %s', JSON.stringify(exports))
      pkg = Object.assign(pkg, exports)
      fs.writeJSONSync(path.resolve(process.cwd(), 'package.json'), pkg, {
        spaces: 2,
      })
    },
  }
}
