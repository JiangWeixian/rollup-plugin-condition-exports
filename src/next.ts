import type { Plugin } from 'rollup'
import path from 'path'
import fs from 'fs-extra'
import debug from 'debug'

import type { UserOptions } from './convention/types'
import { PackageContext } from './convention/context'

const NAME = 'rpce'

const log = debug(NAME)

function plugin({ ...rest }: UserOptions = {}): Plugin {
  const options: UserOptions = {
    ...rest,
  }
  const ctx = new PackageContext(options)
  return {
    name: NAME,
    async options(options) {
      await ctx.searchGlob()
      const input = await ctx.resolveInputs()
      console.log(options)
      return {
        ...options,
        input,
      }
    },

    async writeBundle() {
      let pkg = fs.readJSONSync(path.resolve(process.cwd(), 'package.json'))
      const partialPkg = await ctx.resolvePkg()
      log('partialPkg %o', partialPkg)
      pkg = Object.assign(pkg, partialPkg)
      fs.writeJSONSync(path.resolve(process.cwd(), 'package.json'), pkg, {
        spaces: 2,
      })
    },
  }
}

export default plugin
