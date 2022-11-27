import type { Plugin } from 'rollup'
import path from 'path'
import fs from 'fs-extra'

import type { UserOptions } from './convention/types'
import { PackageContext } from './convention/context'
import { debug } from './convention/utils'

const NAME = 'rpce'

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
      return {
        ...options,
        input,
      }
    },

    async writeBundle() {
      let pkg = fs.readJSONSync(path.resolve(process.cwd(), 'package.json'))
      const partialPkg = await ctx.resolvePkg()
      debug.pkg('partialPkg %o', partialPkg)
      pkg = Object.assign(pkg, partialPkg)
      fs.writeJSONSync(path.resolve(process.cwd(), 'package.json'), pkg, {
        spaces: 2,
      })
    },
  }
}

export default plugin
