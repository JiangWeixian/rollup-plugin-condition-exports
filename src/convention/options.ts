import { resolve, sep } from 'path'
import { slash } from '@antfu/utils'
import { withoutLeadingSlash, withoutTrailingSlash } from 'ufo'
import { getPageDirs } from './files'

import { defaultExtensions } from './constants'
import type { ResolvedOptions, UserOptions } from './types'

function resolvePageDirs(dirs: NonNullable<UserOptions['dirs']>, root: string, exclude: string[]) {
  const option = typeof dirs === 'string' ? { dir: dirs, base: '' } : dirs

  const segments = withoutTrailingSlash(withoutLeadingSlash(option.dir)).split(sep)
  option.dir = slash(resolve(root, option.dir)).replace(`${root}/`, '')
  option.base = slash(resolve(root, segments[0])).replace(`${root}/`, '')

  return getPageDirs(option, root, exclude)
}

export function resolveOptions(userOptions: UserOptions, viteRoot?: string): ResolvedOptions {
  const {
    dirs = 'src/exports',
    exclude = ['node_modules', '.git', '**/__*__/**'],
    onRoutesGenerated,
    cjsExtension = 'cjs',
    esmExtension = 'mjs',
    outDir = 'dist',
    declarationDir = 'dist',
    conditions = ['node', 'browser', 'default'],
  } = userOptions

  const root = viteRoot || slash(process.cwd())

  const extensions = userOptions.extensions || defaultExtensions

  const extensionsRE = new RegExp(`\\.(${extensions.join('|')})$`)

  const resolvedDirs = resolvePageDirs(dirs, root, exclude)
  const resolvedOutDir = slash(resolve(root, outDir)).replace(`${root}/`, '')
  const resolvedDeclarationDir = slash(resolve(root, declarationDir)).replace(`${root}/`, '')
  const resolvedOptions: ResolvedOptions = {
    dirs: resolvedDirs,
    outDir: resolvedOutDir,
    declarationDir: resolvedDeclarationDir,
    conditions,
    root,
    extensions,
    exclude,
    extensionsRE,
    onRoutesGenerated,
    cjsExtension,
    esmExtension,
  }

  return resolvedOptions
}
