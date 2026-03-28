import { describe, it, expect } from 'vitest'
import { createDataLoader } from '@/data/loader.js'
import { createLayoutResolver } from '@/data/layout-resolver.js'
import type { ResolvedLayout } from '@/data/runtime.types.js'

const LANGUAGE_IDS = ['yoruba', 'fon-adja', 'baatonum', 'dendi'] as const
const LAYOUT_IDS = ['desktop-azerty', 'mobile-default'] as const

describe('Data pipeline — real files, no mocks', () => {
  // Bundler loader (no baseUrl — uses import.meta.glob with actual data/ files)
  const loader = createDataLoader()
  const resolver = createLayoutResolver()

  it('loads the registry without error', async () => {
    const registry = await loader.loadRegistry()
    expect(registry.version).toMatch(/^\d+\.\d+\.\d+$/)
    expect(registry.languages.length).toBeGreaterThan(0)
    expect(registry.layouts.length).toBeGreaterThan(0)
  })

  it('loads the composition rules catalog without error', async () => {
    const catalog = await loader.loadCompositionRules()
    expect(catalog.triggers.length).toBeGreaterThan(0)
  })

  it.each(LAYOUT_IDS)('loads layout shape "%s" without error', async (id) => {
    const shape = await loader.loadLayoutShape(id)
    expect(shape.id).toBe(id)
    expect(shape.layers.length).toBeGreaterThan(0)
  })

  it.each(LANGUAGE_IDS)('loads language profile "%s" without error', async (id) => {
    const profile = await loader.loadLanguageProfile(id)
    expect(profile.languageId).toBe(id)
    expect(profile.characters.length).toBeGreaterThan(0)
  })

  it('resolves all 8 language × layout combinations', async () => {
    const catalog = await loader.loadCompositionRules()
    const resolved: ResolvedLayout[] = []

    for (const layoutId of LAYOUT_IDS) {
      for (const languageId of LANGUAGE_IDS) {
        const shape = await loader.loadLayoutShape(layoutId)
        const profile = await loader.loadLanguageProfile(languageId)
        const r = resolver.resolve(shape, profile, catalog, layoutId, languageId)
        resolved.push(r)
      }
    }

    expect(resolved).toHaveLength(8)
    for (const r of resolved) {
      expect(r.keyMap.size).toBeGreaterThan(0)
      expect(r.compositionMap).toBeDefined()
      expect(r.layout).toBeDefined()
      expect(r.language).toBeDefined()
    }
  })

  it('completes full pipeline (all 8 combinations) within 200ms', async () => {
    const catalog = await loader.loadCompositionRules()
    const start = Date.now()

    for (const layoutId of LAYOUT_IDS) {
      for (const languageId of LANGUAGE_IDS) {
        const shape = await loader.loadLayoutShape(layoutId)
        const profile = await loader.loadLanguageProfile(languageId)
        resolver.resolve(shape, profile, catalog, layoutId, languageId)
      }
    }

    expect(Date.now() - start).toBeLessThan(200)
  })

  it('cache hit on second resolve of same combination', async () => {
    const shape = await loader.loadLayoutShape('desktop-azerty')
    const profile = await loader.loadLanguageProfile('yoruba')
    const catalog = await loader.loadCompositionRules()
    const r1 = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    const r2 = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
    expect(r1).toBe(r2)
  })
})
