import { buildReactRoutePath, countSlash } from '../utils'
import type { Optional, PageResolver, ResolvedOptions } from '../types'
import type { PackageContext } from '../context'

import { join } from 'path'

export interface ReactRouteBase {
  children?: ReactRouteBase[]
  leaf: boolean
  element?: string
  index?: boolean
  path?: string
  rawRoute: string
}

export interface ReactRoute extends Omit<Optional<ReactRouteBase, 'path'>, 'children'> {
  children?: ReactRoute[]
}

function prepareRoutes(routes: ReactRoute[], options: ResolvedOptions, parent?: ReactRoute) {
  for (const route of routes) {
    if (parent) route.path = route.path?.replace(/^\//, '')

    if (route.children) route.children = prepareRoutes(route.children, options, route)

    Object.assign(route, options.extendRoute?.(route, parent) || {})
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

      if (i === pathNodes.length - 1) route.element = element

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

      if (parent) {
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
        route.path = join(parent?.path ?? '', route.path ?? '')
      }
    }
  })

  // sort by dynamic routes
  let finalRoutes = prepareRoutes(routes, ctx.options)

  finalRoutes = (await ctx.options.onRoutesGenerated?.(finalRoutes)) || finalRoutes

  return finalRoutes
}

// FIXME: src/exports/[..all] is not allowed
const _resolveExports = (routes: ReactRoute[], ctx: PackageContext, exports: any = {}) => {
  for (const route of routes) {
    if (route.leaf) {
      console.log(route.path, route.element)
      const path = route.path && route.path !== '.' ? `./${route.path}` : '.'
      exports[`${path}`] = {
        require: `./${route.element}.${ctx.options.cjsExtension}`,
        import: `./${route.element}.${ctx.options.esmExtension}`,
      }
    }
    if (route.children) {
      _resolveExports(route.children, ctx, exports)
    }
  }
}

const resolveMainFields = (routes: ReactRoute[], ctx: PackageContext, mains: any = {}) => {
  const route = routes.find((route) => route.path === '.')
  if (route) {
    mains.main = `${route.element}.${ctx.options.cjsExtension}`
    mains.module = `${route.element}.${ctx.options.esmExtension}`
  }
}

export async function resolveExports(ctx: PackageContext) {
  const finalRoutes = await computeExports(ctx)
  const exports: Record<string, string | Record<string, string>> = {}
  const mains: Record<string, string | Record<string, string>> = {}
  exports['./package.json'] = './package.json'
  _resolveExports(finalRoutes, ctx, exports)
  resolveMainFields(finalRoutes, ctx, mains)
  console.log(exports, mains)
  return exports
}

export function resolver(): PageResolver {
  return {
    resolveExtensions() {
      return ['tsx', 'jsx', 'ts', 'js']
    },
    async resolveExports(ctx) {
      // TODO: typo
      return resolveExports(ctx) as any
    },
  }
}
