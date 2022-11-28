import { describe, it, expect } from 'vitest'
import path from 'path'

import { PackageContext } from '../src/convention/context'

const FIXTURES = path.resolve(__dirname, './fixtures')

describe('index only', () => {
  it('resolve pkg', async () => {
    const ctx = new PackageContext(
      { dirs: 'only-index', exclude: ['**/**/!(index).{tsx,ts}'] },
      FIXTURES,
    )
    await ctx.searchGlob()
    const pkg = await ctx.resolvePkg()
    expect(pkg.typesVersions).toBeUndefined()
  })
})
