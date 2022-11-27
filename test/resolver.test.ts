import { describe, it, expect } from 'vitest'
import path from 'path'

import { PackageContext } from '../src/convention/context'

const FIXTURES = path.resolve(__dirname, './fixtures')

describe('resolver', () => {
  it('search inputs', async () => {
    const ctx = new PackageContext({ dirs: 'basic' }, FIXTURES)
    await ctx.searchGlob()
    const inputs = await ctx.resolveInputs()
    expect(inputs.map((v) => v.replace(FIXTURES, ''))).toMatchInlineSnapshot(`
[
  "/basic/about.tsx",
  "/basic/components.tsx",
  "/basic/index.tsx",
  "/basic/no-condition.tsx",
  "/basic/about/index.tsx",
  "/basic/blog/[...all].tsx",
  "/basic/blog/[id].tsx",
  "/basic/blog/index.tsx",
  "/basic/condition/browser.tsx",
  "/basic/condition/node.tsx",
  "/basic/no-condition/node.tsx",
  "/basic/blog/today/[...all].tsx",
  "/basic/blog/today/index.tsx",
]
    `)
  })
  it('resolve pkg', async () => {
    const ctx = new PackageContext({ dirs: 'basic' }, FIXTURES)
    await ctx.searchGlob()
    const pkg = await ctx.resolvePkg()
    expect(pkg).toMatchSnapshot()
  })
})
