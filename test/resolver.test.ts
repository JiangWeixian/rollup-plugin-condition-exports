import { describe, it } from 'vitest'
import path from 'path'

import { PackageContext } from '../src/convention/context'

const FIXTURES = path.resolve(__dirname, '../examples/basic')

describe('resolver', () => {
  it('resolve exports', async () => {
    const ctx = new PackageContext({}, FIXTURES)
    await ctx.searchGlob()
    console.log(await ctx.resolveRoutes())
  })
})
