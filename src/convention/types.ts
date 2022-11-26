import type { ReactRoute } from './resolver'
import type { PackageContext } from './context'
import type { Awaitable } from '@antfu/utils'

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type ImportMode = 'sync' | 'async'
export type ImportModeResolver = (filepath: string, pluginOptions: ResolvedOptions) => ImportMode

export interface ParsedJSX {
  value: string
  loc: {
    start: {
      line: number
    }
  }
}

export type CustomBlock = Record<string, any>

export type InternalPageResolvers = 'vue' | 'react' | 'solid'

export interface PageOptions {
  dir: string
  baseRoute: string
}

export interface PageResolver {
  resolveExtensions: () => string[]
  resolveExports: (ctx: PackageContext) => Awaitable<ReactRoute[]>
}

/**
 * Plugin options.
 */
interface Options {
  /**
   * Paths to the directory to search for page components.
   * @default 'src/pages'
   */
  dirs: string | (string | PageOptions)[]
  /**
   * Paths to the directory output bundle files
   * @default 'src/pages'
   */
  outDir: string
  /**
   * Valid file extensions
   * @default ['tsx', 'ts', 'jsx', 'jsx']
   */
  extensions: string[]
  /**
   * CJS format extension
   * @default 'cjs'
   */
  cjsExtension: string
  /**
   * ESM format extension
   * @default 'mjs'
   */
  esmExtension: string
  /**
   * List of path globs to exclude when resolving pages.
   */
  exclude: string[]
  /**
   * Import routes directly or as async components
   * @default 'root index file => "sync", others => "async"'
   */
  importMode: ImportMode | ImportModeResolver
  /**
   * Separator for generated route names.
   * @default -
   */
  routeNameSeparator: string
  /**
   * Extend route records
   */
  extendRoute?: (route: any, parent: any | undefined) => any | void
  /**
   * Custom generated routes
   */
  onRoutesGenerated?: (routes: any[]) => Awaitable<any[] | void>
  /**
   * Custom generated client code
   */
  onClientGenerated?: (clientCode: string) => Awaitable<string | void>
}

export type UserOptions = Partial<Options>

export interface ResolvedOptions
  extends Omit<
    Options,
    'pagesDir' | 'replaceSquareBrackets' | 'nuxtStyle' | 'syncIndex' | 'moduleId'
  > {
  /**
   * Resolves to the `root` value from Vite config.
   * @default config.root
   */
  root: string
  /**
   * Resolved page dirs
   */
  dirs: PageOptions[]
  /**
   * RegExp to match extensions
   */
  extensionsRE: RegExp
}
