import type { LayoutVariantId, LanguageId } from '../public/types.js'
import type { LayoutShape } from './layout.types.js'
import type { LanguageProfile } from './language.types.js'
import type { RegistryData, CompositionRulesCatalog } from './registry.types.js'
import {
  validateLayoutShape,
  validateLanguageProfile,
  validateRegistry,
  validateCompositionRules,
} from './validator.js'
import { checkLayoutIntegrity, checkCompositionIntegrity } from './integrity-checker.js'

/** Thrown when a data file cannot be fetched or imported. */
export class DataLoaderError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DataLoaderError'
  }
}

export interface DataLoaderOptions {
  /** If provided, all data files are fetched from `baseUrl + '/' + path` via HTTP.
   *  If absent, Vite dynamic imports are used (bundler / npm install context). */
  baseUrl?: string
}

export interface DataLoader {
  /** Loads the registry index from the configured source.
   * @throws {DataLoaderError} on network/import failure or HTTP error.
   * @throws {ValidationError} if the data fails schema validation. */
  loadRegistry(): Promise<RegistryData>
  /** Loads and validates a layout shape.
   * @throws {DataLoaderError} on network/import failure or HTTP error.
   * @throws {ValidationError} if the data fails schema validation.
   * @throws {IntegrityError} if the layout has duplicate keyIds. */
  loadLayoutShape(id: LayoutVariantId): Promise<LayoutShape>
  /** Loads and validates a language profile.
   * @throws {DataLoaderError} on network/import failure or HTTP error.
   * @throws {ValidationError} if the data fails schema validation. */
  loadLanguageProfile(id: LanguageId): Promise<LanguageProfile>
  /** Loads and validates the composition rules catalog.
   * @throws {DataLoaderError} on network/import failure or HTTP error.
   * @throws {ValidationError} if the data fails schema validation.
   * @throws {IntegrityError} if the catalog has duplicate triggers. */
  loadCompositionRules(): Promise<CompositionRulesCatalog>
}

// ── Known data file paths ────────────────────────────────────────────────────

const LAYOUT_PATHS: Record<LayoutVariantId, string> = {
  'desktop-azerty': 'data/layouts/desktop-azerty.json',
  'mobile-default': 'data/layouts/mobile-default.json',
}

const LANGUAGE_PATHS: Record<LanguageId, string> = {
  'yoruba': 'data/languages/yoruba.json',
  'fon-adja': 'data/languages/fon-adja.json',
  'baatonum': 'data/languages/baatonum.json',
  'dendi': 'data/languages/dendi.json',
}

const REGISTRY_PATH = 'data/registry.json'
const COMPOSITION_PATH = 'data/composition-rules.json'

// ── Bundler transport (Vite import.meta.glob) ────────────────────────────────

const BUNDLER_LAYOUT_GLOB = import.meta.glob<{ default: unknown }>(
  '../../data/layouts/*.json',
)
const BUNDLER_LANGUAGE_GLOB = import.meta.glob<{ default: unknown }>(
  '../../data/languages/*.json',
)
const BUNDLER_REGISTRY_GLOB = import.meta.glob<{ default: unknown }>(
  '../../data/registry.json',
)
const BUNDLER_COMPOSITION_GLOB = import.meta.glob<{ default: unknown }>(
  '../../data/composition-rules.json',
)

/* c8 ignore start — bundler transport is exercised by Task 6 integration tests */
async function bundlerLoad(
  glob: Record<string, () => Promise<{ default: unknown }>>,
  relativePath: string,
): Promise<unknown> {
  const loader = glob[relativePath]
  if (!loader) {
    throw new DataLoaderError(
      `[DataLoader] File not found in bundle: '${relativePath}'`,
    )
  }
  const mod = await loader()
  return mod.default
}
/* c8 ignore stop */

// ── Fetch transport (CDN / HTTP) ─────────────────────────────────────────────

async function fetchLoad(baseUrl: string, path: string): Promise<unknown> {
  const url = `${baseUrl.replace(/\/$/, '')}/${path}`
  let res: Response
  try {
    res = await fetch(url)
  } catch (err) {
    throw new DataLoaderError(
      `[DataLoader] Network error loading '${path}': ${String(err)}`,
    )
  }
  if (!res.ok) {
    throw new DataLoaderError(
      `[DataLoader] HTTP ${res.status} loading '${path}'`,
    )
  }
  return res.json() as Promise<unknown>
}

// ── Factory ──────────────────────────────────────────────────────────────────

/**
 * Creates a data loader that fetches JSON files either from a CDN (when `baseUrl`
 * is provided) or via Vite bundler imports (when no `baseUrl`).
 * All loaded data is validated against AJV schemas before being returned.
 * @example
 * // CDN usage
 * const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
 * // Bundler / npm install usage
 * const loader = createDataLoader()
 */
export function createDataLoader(options?: DataLoaderOptions): DataLoader {
  const baseUrl = options?.baseUrl
  const cache = new Map<string, unknown>()

  async function load(
    path: string,
    bundlerKey: string,
    glob: Record<string, () => Promise<{ default: unknown }>>,
  ): Promise<unknown> {
    const cached = cache.get(path)
    if (cached !== undefined) return cached
    const raw = baseUrl
      ? await fetchLoad(baseUrl, path)
      : /* c8 ignore next */ await bundlerLoad(glob, bundlerKey)
    cache.set(path, raw)
    return raw
  }

  return {
    async loadRegistry(): Promise<RegistryData> {
      const raw = await load(REGISTRY_PATH, '../../data/registry.json', BUNDLER_REGISTRY_GLOB)
      return validateRegistry(raw)
    },

    async loadLayoutShape(id: LayoutVariantId): Promise<LayoutShape> {
      const path = LAYOUT_PATHS[id]
      const raw = await load(path, `../../data/layouts/${id}.json`, BUNDLER_LAYOUT_GLOB)
      const validated = validateLayoutShape(raw)
      checkLayoutIntegrity(validated)
      return validated
    },

    async loadLanguageProfile(id: LanguageId): Promise<LanguageProfile> {
      const path = LANGUAGE_PATHS[id]
      const raw = await load(path, `../../data/languages/${id}.json`, BUNDLER_LANGUAGE_GLOB)
      return validateLanguageProfile(raw)
    },

    async loadCompositionRules(): Promise<CompositionRulesCatalog> {
      const raw = await load(
        COMPOSITION_PATH,
        '../../data/composition-rules.json',
        BUNDLER_COMPOSITION_GLOB,
      )
      const validated = validateCompositionRules(raw)
      checkCompositionIntegrity(validated)
      return validated
    },
  }
}
