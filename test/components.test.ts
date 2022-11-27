import { describe, it, expect } from 'vitest'
import path from 'path'

import { PackageContext } from '../src/convention/context'

const FIXTURES = path.resolve(__dirname, './fixtures')

describe('basic', () => {
  it('search inputs', async () => {
    const ctx = new PackageContext(
      { dirs: 'components', exclude: ['**/**/!(index).{tsx,ts}'] },
      FIXTURES,
    )
    await ctx.searchGlob()
    const inputs = await ctx.resolveInputs()
    expect(inputs.map((v) => v.replace(FIXTURES, ''))).toMatchInlineSnapshot(`
      [
        "/components/index.ts",
        "/components/button/index.ts",
      ]
    `)
  })
  it('resolve pkg', async () => {
    const ctx = new PackageContext(
      { dirs: 'components', exclude: ['**/**/!(index).{tsx,ts}'] },
      FIXTURES,
    )
    await ctx.searchGlob()
    const pkg = await ctx.resolvePkg()
    expect(pkg).toMatchSnapshot()
  })
})
