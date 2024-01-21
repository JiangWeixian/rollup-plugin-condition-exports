import {
  extname,
  join,
  relative,
  resolve,
} from 'node:path'

import { slash, toArray } from '@antfu/utils'
import { cleanDoubleSlashes } from 'ufo'

import { getPageFiles } from './files'
import { resolveOptions } from './options'
import { resolver } from './resolver'
import { debug } from './utils'

import type {
  PageOptions,
  ResolvedOptions,
  UserOptions,
} from './types'

export interface PageRoute {
  path: string
  route: string
  rawPath: string
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

  async addPage(path: string[] | string, pageDir: PageOptions) {
    debug.pages('add', path)
    for (const p of toArray(path)) {
      const pageDirPath = slash(resolve(this.root, pageDir.dir))
      const path = slash(p.replace(`${pageDirPath}`, this.options.outDir).replace(extname(p), ''))
      const route = slash(join(p.replace(`${pageDirPath}/`, '').replace(extname(p), '')))
      this._pageRouteMap.set(p, {
        path,
        rawPath: p,
        route,
      })
    }
  }

  async removePage(path: string) {
    debug.pages('remove', path)
    this._pageRouteMap.delete(path)
  }

  async resolvePkg() {
    return this.resolver.resolvePkg(this)
  }

  async resolveInputs() {
    const inputs = [...this._pageRouteMap.values()].map(v => v.rawPath)
    return Object.assign(
      {},
      Object.fromEntries(
        inputs.map((name) => {
          const filePath = relative(join(this.options.root, this.options.dirs.dir), name)
          return [cleanDoubleSlashes(filePath).replace(extname(filePath), ''), name]
        }),
      ),
    )
  }

  async searchGlob() {
    const pageDirFiles = [this.options.dirs].map((page) => {
      const pagesDirPath = slash(resolve(this.options.root, page.dir))
      const files = getPageFiles(pagesDirPath, this.options)
      debug.search(page.dir, files)
      return {
        ...page,
        files: files.map(file => slash(file)),
      }
    })

    for (const page of pageDirFiles) {
      await this.addPage(page.files, page)
    }
  }

  get pageRouteMap() {
    return this._pageRouteMap
  }
}
