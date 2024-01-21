/* eslint-disable etc/no-t */
import type { Awaitable } from '@antfu/utils'
import type { PackageContext } from './context'

export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>

export interface PageOptions {
  /**
   * Paths to the directory to search for page components.
   * @default 'src/exports'
   */
  dir: string
  /**
   * @example if dir is `src/exports` base will be `src`
   * @example if dir is `components` base will be `components`
   */
  base: string
}

export interface PageResolver {
  resolveExtensions: () => string[]
  resolvePkg: (ctx: PackageContext) => Awaitable<any>
}

/**
 * Plugin options.
 */
interface Options {
  /**
   * Paths to the directory to search for page components.
   * @default 'src/exports'
   */
  dirs: PageOptions | string
  /**
   * Paths to the directory output bundle files
   * @default 'dist'
   */
  outDir: string
  /**
   * Paths to the directory output dts files
   * @default 'dist'
   */
  declarationDir: string
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
   * List of exports condition names
   * @default ['node', 'browser', 'default']
   */
  conditions: string[]
  /**
   * Custom generated routes
   */
  onRoutesGenerated?: (routes: any[]) => Awaitable<any[] | void>
}

export type UserOptions = Partial<Options>

export interface ResolvedOptions
  extends Omit<
    Options,
    'dirs' | 'moduleId' | 'nuxtStyle' | 'pagesDir' | 'replaceSquareBrackets' | 'syncIndex'
  > {
  /**
   * Resolves to the `root` value from Vite config.
   * @default config.root
   */
  root: string
  /**
   * Resolved page dirs
   */
  dirs: PageOptions
  /**
   * RegExp to match extensions
   */
  extensionsRE: RegExp
}
