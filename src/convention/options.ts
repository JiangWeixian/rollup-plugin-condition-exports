import { resolve } from 'path'
import { slash, toArray } from '@antfu/utils'
import { getPageDirs } from './files'

import { defaultExtensions } from './constants'
import type { ImportModeResolver, ResolvedOptions, UserOptions } from './types'

function resolvePageDirs(dirs: UserOptions['dirs'], root: string, exclude: string[]) {
  dirs = toArray(dirs)
  return dirs.flatMap((dir) => {
    const option = typeof dir === 'string' ? { dir, baseRoute: '' } : dir

    option.dir = slash(resolve(root, option.dir)).replace(`${root}/`, '')
    option.baseRoute = option.baseRoute.replace(/^\//, '').replace(/\/$/, '')

    return getPageDirs(option, root, exclude)
  })
}

export const syncIndexResolver: ImportModeResolver = (filepath, options) => {
  for (const page of options.dirs) {
    if (page.baseRoute === '' && filepath.startsWith(`/${page.dir}/index`)) return 'sync'
  }
  return 'async'
}

export function resolveOptions(userOptions: UserOptions, viteRoot?: string): ResolvedOptions {
  const {
    dirs = ['src/exports'],
    exclude = ['node_modules', '.git', '**/__*__/**'],
    routeNameSeparator = '-',
    extendRoute,
    onRoutesGenerated,
    onClientGenerated,
    cjsExtension = 'cjs',
    esmExtension = 'mjs',
    outDir = 'dist',
    declarationDir = 'dist',
  } = userOptions

  const root = viteRoot || slash(process.cwd())

  const importMode = userOptions.importMode || 'async'

  const extensions = userOptions.extensions || defaultExtensions

  const extensionsRE = new RegExp(`\\.(${extensions.join('|')})$`)

  const resolvedDirs = resolvePageDirs(dirs, root, exclude)
  const resolvedOutDir = slash(resolve(root, outDir)).replace(`${root}/`, '')
  const resolvedDeclarationDir = slash(resolve(root, declarationDir)).replace(`${root}/`, '')
  const resolvedOptions: ResolvedOptions = {
    dirs: resolvedDirs,
    outDir: resolvedOutDir,
    declarationDir: resolvedDeclarationDir,
    root,
    extensions,
    importMode,
    exclude,
    extensionsRE,
    extendRoute,
    onRoutesGenerated,
    onClientGenerated,
    routeNameSeparator,
    cjsExtension,
    esmExtension,
  }

  return resolvedOptions
}
