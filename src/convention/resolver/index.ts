/* eslint-disable import/no-extraneous-dependencies */
import { join } from 'node:path'

import { isEmpty } from 'lodash-es'

import {
  buildReactRoutePath,
  countSlash,
  debug,
} from '../utils'

import type { PackageContext } from '../context'
import type {
  Optional,
  PageResolver,
  ResolvedOptions,
} from '../types'

export interface ReactRouteBase {
  children?: ReactRouteBase[]
  leaf: boolean
  element?: string
  index?: boolean
  path?: string
  condition?: string
  rawRoute: string
}

export interface ReactRoute extends Omit<Optional<ReactRouteBase, 'path'>, 'children'> {
  children?: ReactRoute[]
}

function prepareRoutes(routes: ReactRoute[], options: ResolvedOptions, parent?: ReactRoute) {
  for (const route of routes) {
    if (parent) {
      route.path = route.path?.replace(/^\//, '')
    }

    if (route.children) {
      route.children = prepareRoutes(route.children, options, route)
    }
  }

  return routes
}

async function computeExports(ctx: PackageContext): Promise<ReactRoute[]> {
  const pageRoutes = [...ctx.pageRouteMap.values()].sort(
    (a, b) => countSlash(a.route) - countSlash(b.route),
  )

  const routes: ReactRouteBase[] = []

  pageRoutes.forEach((page) => {
    const pathNodes = page.route.split('/')
    const element = page.path
    let parentRoutes = routes

    for (let i = 0; i < pathNodes.length; i++) {
      const node = pathNodes[i]

      const route: ReactRouteBase = {
        path: '',
        leaf: i === pathNodes.length - 1,
        rawRoute: pathNodes.slice(0, i + 1).join('/'),
      }

      if (i === pathNodes.length - 1) {
        route.element = element
        route.condition = ctx.options.conditions.includes(node) ? node : undefined
      }

      const isIndexRoute = node.endsWith('index')

      if (!route.path && isIndexRoute) {
        route.path = ''
      } else if (!isIndexRoute) {
        route.path = buildReactRoutePath(node)
      }

      // Check parent exits
      const parent = parentRoutes.find((parent) => {
        return pathNodes.slice(0, i).join('/') === parent.rawRoute
      })

      // only enable condition exports on dirs
      if (parent) {
        route.condition = parent.element ? undefined : route.condition
      }

      // only nested route on condition exports dir
      if (parent && route.condition) {
        // Make sure children exits in parent
        parent.children = parent.children || []
        // Append to parent's children
        parentRoutes = parent.children
      }

      const exits = parentRoutes.some((parent) => {
        return pathNodes.slice(0, i + 1).join('/') === parent.rawRoute
      })
      if (!exits) {
        parentRoutes.push(route)
        // absolute route path
        route.path = !route.condition ? join(parent?.path ?? '', route.path ?? '') : parent?.path
      }
    }
  })

  // sort by dynamic routes
  let finalRoutes = prepareRoutes(routes, ctx.options)

  finalRoutes = (await ctx.options.onRoutesGenerated?.(finalRoutes)) || finalRoutes

  return finalRoutes
}

const formatDeclarationPath = (element: string, ctx: PackageContext) => {
  const childDir = ctx.options.dirs.dir.replace(ctx.options.dirs.base, '')
  return `${element?.replace(ctx.options.outDir, join(ctx.options.declarationDir, childDir))}.d.ts`
}

const _resolvePkg = (routes: ReactRoute[], ctx: PackageContext, pkg: any = {}) => {
  for (const route of routes) {
    const path = route.path && route.path !== '.' ? `./${route.path}` : '.'
    if (route.leaf) {
      if (path === '.') {
        pkg.main = `${route.element}.${ctx.options.cjsExtension}`
        pkg.module = `${route.element}.${ctx.options.esmExtension}`
        pkg.types = formatDeclarationPath(route.element!, ctx)
      } else {
        pkg.typesVersions[`${path.slice(2)}`] = [formatDeclarationPath(route.element!, ctx)]
      }
      pkg.exports[`${path}`] = pkg.exports[`${path}`] ?? {}
      let subExports = pkg.exports[`${path}`]
      if (route.condition) {
        pkg.exports[`${path}`][route.condition] = pkg.exports[`${path}`][route.condition] ?? {}
        subExports = pkg.exports[`${path}`][route.condition]
      }
      subExports.import = `./${route.element}.${ctx.options.esmExtension}`
      subExports.require = `./${route.element}.${ctx.options.cjsExtension}`
      subExports.types = `./${formatDeclarationPath(route.element!, ctx)}`
    }
    if (route.children) {
      _resolvePkg(route.children, ctx, pkg)
    }
  }
}

export async function resolvePkg(ctx: PackageContext) {
  const finalRoutes = await computeExports(ctx)
  debug.search('final routes %o', finalRoutes)
  const pkg: any = {
    exports: {},
    typesVersions: {},
  }
  pkg.exports['./package.json'] = './package.json'
  _resolvePkg(finalRoutes, ctx, pkg)
  pkg.typesVersions = !isEmpty(pkg.typesVersions) ? { '*': pkg.typesVersions } : undefined
  return pkg
}

export function resolver(): PageResolver {
  return {
    resolveExtensions() {
      return ['tsx', 'jsx', 'ts', 'js']
    },
    async resolvePkg(ctx) {
      return resolvePkg(ctx)
    },
  }
}
