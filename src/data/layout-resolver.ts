import type { LayoutVariantId, LanguageId, KeyId } from '../public/types.js'
import type { LayoutShape } from './layout.types.js'
import type { LanguageProfile, CompositionRule } from './language.types.js'
import type { CompositionRulesCatalog } from './registry.types.js'
import { createKeyOutput, createResolvedKey, createResolvedLayout, type ResolvedKey, type ResolvedLayout } from './runtime.types.js'
import { checkLanguageIntegrity } from './integrity-checker.js'

export interface ResolverOptions {
  /** Maximum number of resolved layouts to cache. Defaults to 16. */
  maxCacheSize?: number
}

export interface LayoutResolver {
  /** Resolves a layout+language pair, with caching.
   * @param catalog - Reserved for future trigger gating; not yet used in resolution. */
  resolve(
    shape: LayoutShape,
    profile: LanguageProfile,
    catalog: CompositionRulesCatalog,
    layoutId: LayoutVariantId,
    languageId: LanguageId,
  ): ResolvedLayout
  /** Empties the resolved layout cache. */
  clearCache(): void
  /** Returns the current number of cached resolved layouts. */
  getCacheSize(): number
}

/**
 * Creates a layout resolver that builds and caches {@link ResolvedLayout} instances.
 * @example
 * const resolver = createLayoutResolver({ maxCacheSize: 8 })
 * const resolved = resolver.resolve(shape, profile, catalog, 'desktop-azerty', 'yoruba')
 */
export function createLayoutResolver(options?: ResolverOptions): LayoutResolver {
  const maxCacheSize = options?.maxCacheSize ?? 16
  const cache = new Map<string, ResolvedLayout>()

  return {
    resolve(shape, profile, _catalog /* reserved for future trigger gating */, layoutId, languageId) {
      const cacheKey = `${layoutId}::${languageId}`
      const cached = cache.get(cacheKey)
      if (cached !== undefined) return cached

      // Cross-file integrity: every language key must exist in the layout
      checkLanguageIntegrity(profile, shape)

      // Build keyMap: keyId → multi-layer resolved behavior
      const keyMap = new Map<KeyId, ResolvedKey>()
      for (const entry of profile.characters) {
        const layers = {
          base: createKeyOutput(entry.baseChar, entry.composition?.[0]),
          shift: createKeyOutput(entry.shiftChar ?? entry.baseChar.toUpperCase()),
          altGr: createKeyOutput(entry.altGrChar ?? ''),
        }
        const longPress = entry.longPress ? [...entry.longPress] : []
        keyMap.set(entry.keyId, createResolvedKey(entry.keyId, layers, longPress))
      }

      // Build compositionMap: trigger → all rules for that trigger
      const compositionMap = new Map<string, CompositionRule[]>()
      for (const rule of profile.compositionRules) {
        const rules = compositionMap.get(rule.trigger) ?? []
        rules.push(rule)
        compositionMap.set(rule.trigger, rules)
      }

      // Evict oldest entry when at capacity (insertion-order Map)
      if (cache.size >= maxCacheSize) {
        const oldestKey = cache.keys().next().value
        if (oldestKey !== undefined) cache.delete(oldestKey)
      }

      const resolved = createResolvedLayout(shape, profile, keyMap, compositionMap)
      cache.set(cacheKey, resolved)
      return resolved
    },

    clearCache() {
      cache.clear()
    },

    getCacheSize() {
      return cache.size
    },
  }
}
