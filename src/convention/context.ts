import { extname, join, resolve } from 'path'
import { slash, toArray } from '@antfu/utils'
import { resolveOptions } from './options'
import { getPageFiles } from './files'
import { debug } from './utils'
import { resolver } from './resolver'

import type { PageOptions, ResolvedOptions, UserOptions } from './types'

export interface PageRoute {
  path: string
  route: string
}

export class PackageContext {
  private _pageRouteMap = new Map<string, PageRoute>()

  rawOptions: UserOptions
  root: string
  options: ResolvedOptions
  resolver = resolver()

  constructor(userOptions: UserOptions, root: string = process.cwd()) {
    this.rawOptions = userOptions
    this.root = slash(root)
    debug.env('root', this.root)
    this.options = resolveOptions(userOptions, this.root)
    debug.options(this.options)
  }

  async addPage(path: string | string[], pageDir: PageOptions) {
    debug.pages('add', path)
    for (const p of toArray(path)) {
      const pageDirPath = slash(resolve(this.root, pageDir.dir))
      const path = p.replace(`${pageDirPath}`, this.options.outDir).replace(extname(p), '')
      const route = slash(
        join(pageDir.baseRoute, p.replace(`${pageDirPath}/`, '').replace(extname(p), '')),
      )
      this._pageRouteMap.set(p, {
        path,
        route,
      })
    }
  }

  async removePage(path: string) {
    debug.pages('remove', path)
    this._pageRouteMap.delete(path)
  }

  async resolveRoutes() {
    return this.resolver.resolveExports(this)
  }

  async searchGlob() {
    const pageDirFiles = this.options.dirs.map((page) => {
      const pagesDirPath = slash(resolve(this.options.root, page.dir))
      const files = getPageFiles(pagesDirPath, this.options)
      console.log(files)
      debug.search(page.dir, files)
      return {
        ...page,
        files: files.map((file) => slash(file)),
      }
    })

    for (const page of pageDirFiles) await this.addPage(page.files, page)
  }

  get pageRouteMap() {
    return this._pageRouteMap
  }
}
