import { describe, it, expect } from 'vitest'
import path, { join } from 'path'

import { PackageContext } from '../src/convention/context'

const FIXTURES = path.resolve(__dirname, './fixtures')

describe('basic', () => {
  it('search inputs', async () => {
    const ctx = new PackageContext({}, FIXTURES)
    await ctx.searchGlob()
    const inputs = await ctx.resolveInputs()
    const normalizedInputs = Object.fromEntries(
      Object.entries(inputs).map(([id, abPath]) => {
        return [id, abPath.replace(join(ctx.options.root, ctx.options.dirs.baseRoute), '')]
      }),
    )
    expect(normalizedInputs).toMatchInlineSnapshot(`
{
  "about": "/exports/about.tsx",
  "about/index": "/exports/about/index.tsx",
  "blog/[...all]": "/exports/blog/[...all].tsx",
  "blog/[id]": "/exports/blog/[id].tsx",
  "blog/index": "/exports/blog/index.tsx",
  "blog/today/[...all]": "/exports/blog/today/[...all].tsx",
  "blog/today/index": "/exports/blog/today/index.tsx",
  "components": "/exports/components.tsx",
  "condition/browser": "/exports/condition/browser.tsx",
  "condition/node": "/exports/condition/node.tsx",
  "index": "/exports/index.tsx",
  "no-condition": "/exports/no-condition.tsx",
  "no-condition/node": "/exports/no-condition/node.tsx",
}
    `)
  })

  it('resolve pkg', async () => {
    const ctx = new PackageContext({}, FIXTURES)
    await ctx.searchGlob()
    const pkg = await ctx.resolvePkg()
    expect(pkg).toMatchSnapshot()
  })

  it('modify generated files', async () => {
    const ctx = new PackageContext(
      {
        dirs: 'basic',
        async onRoutesGenerated(routes) {
          return routes.filter((route) => !route.element?.includes('index'))
        },
      },
      FIXTURES,
    )
    await ctx.searchGlob()
    const pkg = await ctx.resolvePkg()
    expect(pkg).toMatchSnapshot()
  })
})

describe('custom dir', () => {
  it('custom dirs should work', async () => {
    const ctx = new PackageContext({ dirs: 'basic' }, FIXTURES)
    await ctx.searchGlob()
    const inputs = await ctx.resolveInputs()
    const normalizedInputs = Object.fromEntries(
      Object.entries(inputs).map(([id, abPath]) => {
        return [id, abPath.replace(join(ctx.options.root, ctx.options.dirs.baseRoute), '')]
      }),
    )
    expect(normalizedInputs).toMatchInlineSnapshot(`
{
  "about": "/about.tsx",
  "about/index": "/about/index.tsx",
  "blog/[...all]": "/blog/[...all].tsx",
  "blog/[id]": "/blog/[id].tsx",
  "blog/index": "/blog/index.tsx",
  "blog/today/[...all]": "/blog/today/[...all].tsx",
  "blog/today/index": "/blog/today/index.tsx",
  "components": "/components.tsx",
  "condition/browser": "/condition/browser.tsx",
  "condition/node": "/condition/node.tsx",
  "index": "/index.tsx",
  "no-condition": "/no-condition.tsx",
  "no-condition/node": "/no-condition/node.tsx",
}
    `)
  })

  it('resolve pkg', async () => {
    const ctx = new PackageContext({ dirs: 'basic' }, FIXTURES)
    await ctx.searchGlob()
    const pkg = await ctx.resolvePkg()
    expect(pkg).toMatchSnapshot()
  })
})
