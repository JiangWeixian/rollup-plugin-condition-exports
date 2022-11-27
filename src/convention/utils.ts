import { resolve } from 'path'
import { URLSearchParams } from 'url'
import { slash } from '@antfu/utils'
import { cacheAllRouteRE, countSlashRE, dynamicRouteRE, replaceDynamicRouteRE } from './constants'
import Debug from 'debug'

import type { ResolvedOptions } from './types'

export const debug = {
  env: Debug('rpce:env'),
  options: Debug('rpce:options'),
  pages: Debug('rpce:pages'),
  search: Debug('rpce:search'),
  pkg: Debug('rpce:pkg'),
}

export function extsToGlob(extensions: string[]) {
  return extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0] || ''
}

export function countSlash(value: string) {
  return (value.match(countSlashRE) || []).length
}

function isPagesDir(path: string, options: ResolvedOptions) {
  for (const page of options.dirs) {
    const dirPath = slash(resolve(options.root, page.dir))
    if (path.startsWith(dirPath)) return true
  }
  return false
}

export function isTarget(path: string, options: ResolvedOptions) {
  return isPagesDir(path, options) && options.extensionsRE.test(path)
}

export function isDynamicRoute(routePath: string) {
  return dynamicRouteRE.test(routePath)
}

export function isCatchAllRoute(routePath: string) {
  return cacheAllRouteRE.test(routePath)
}

export function normalizeName(name: string, isDynamic: boolean) {
  if (!isDynamic) return name

  return name.replace(replaceDynamicRouteRE, '$1')
}

export function buildReactRoutePath(node: string): string | undefined {
  const isDynamic = isDynamicRoute(node)
  const isCatchAll = isCatchAllRoute(node)
  const normalizedName = normalizeName(node, isDynamic)

  if (isDynamic) {
    if (isCatchAll) return '*'

    return `:${normalizedName}`
  }

  return `${normalizedName}`
}

export function parsePageRequest(id: string) {
  const [moduleId, rawQuery] = id.split('?', 2)
  const query = new URLSearchParams(rawQuery)
  const pageId = query.get('id')
  return {
    moduleId,
    query,
    pageId,
  }
}
