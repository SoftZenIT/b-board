import { describe, it, expect, vi, afterEach } from 'vitest'
import { createDataLoader, DataLoaderError } from './loader.js'

// Minimal valid fixtures matching AJV schemas
const validLayout = {
  id: 'desktop-azerty',
  variant: 'desktop',
  layers: [{ name: 'base', rows: [{ slots: [{ keyId: 'key-a', width: 1 }] }] }],
  theme: 'light',
}

const validLanguage = {
  languageId: 'yoruba',
  name: 'Yoruba',
  nativeName: 'Yorùbá',
  characters: [{ keyId: 'key-a', baseChar: 'a' }],
  compositionRules: [],
}

const validRegistry = {
  version: '1.0.0',
  languages: [{ id: 'yoruba', path: 'data/languages/yoruba.json' }],
  layouts: [{ id: 'desktop-azerty', path: 'data/layouts/desktop-azerty.json' }],
}

const validCatalog = {
  version: '1.0.0',
  triggers: [{ trigger: '´', name: 'acute', mode: 'tone' }],
}

function mockFetchOk(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  })
}

function mockFetchError(status: number) {
  return vi.fn().mockResolvedValue({ ok: false, status })
}

function mockFetchNetworkFailure() {
  return vi.fn().mockRejectedValue(new Error('Network unreachable'))
}

describe('createDataLoader — fetch transport', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('loadLayoutShape: fetches, validates, and returns typed LayoutShape', async () => {
    vi.stubGlobal('fetch', mockFetchOk(validLayout))
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    const result = await loader.loadLayoutShape('desktop-azerty')
    expect(result.id).toBe('desktop-azerty')
    expect(result.variant).toBe('desktop')
  })

  it('loadLanguageProfile: fetches, validates, and returns typed LanguageProfile', async () => {
    vi.stubGlobal('fetch', mockFetchOk(validLanguage))
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    const result = await loader.loadLanguageProfile('yoruba')
    expect(result.languageId).toBe('yoruba')
  })

  it('loadRegistry: fetches and returns typed RegistryData', async () => {
    vi.stubGlobal('fetch', mockFetchOk(validRegistry))
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    const result = await loader.loadRegistry()
    expect(result.version).toBe('1.0.0')
  })

  it('loadCompositionRules: fetches and returns typed CompositionRulesCatalog', async () => {
    vi.stubGlobal('fetch', mockFetchOk(validCatalog))
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    const result = await loader.loadCompositionRules()
    expect(result.triggers).toHaveLength(1)
  })

  it('throws DataLoaderError on HTTP 404', async () => {
    vi.stubGlobal('fetch', mockFetchError(404))
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    await expect(loader.loadLayoutShape('desktop-azerty')).rejects.toThrow(DataLoaderError)
    await expect(loader.loadLayoutShape('desktop-azerty')).rejects.toThrow(/HTTP 404/)
  })

  it('throws DataLoaderError on HTTP 500', async () => {
    vi.stubGlobal('fetch', mockFetchError(500))
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    await expect(loader.loadRegistry()).rejects.toThrow(DataLoaderError)
  })

  it('throws DataLoaderError on network failure', async () => {
    vi.stubGlobal('fetch', mockFetchNetworkFailure())
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    await expect(loader.loadLayoutShape('desktop-azerty')).rejects.toThrow(DataLoaderError)
    await expect(loader.loadLayoutShape('desktop-azerty')).rejects.toThrow(/[Nn]etwork|fetch/)
  })

  it('throws ValidationError when fetched data fails schema validation', async () => {
    vi.stubGlobal('fetch', mockFetchOk({ id: 'bad', variant: 'tablet' }))
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    // ValidationError is thrown by the validator — it will propagate
    await expect(loader.loadLayoutShape('desktop-azerty')).rejects.toThrow()
  })

  it('does not re-fetch when the same file is requested twice', async () => {
    const mockFetch = mockFetchOk(validLayout)
    vi.stubGlobal('fetch', mockFetch)
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    await loader.loadLayoutShape('desktop-azerty')
    await loader.loadLayoutShape('desktop-azerty')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('fetches different layouts independently (no cross-contamination)', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(validLayout) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ...validLayout, id: 'mobile-default', variant: 'mobile' }) })
    vi.stubGlobal('fetch', mockFetch)
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    await loader.loadLayoutShape('desktop-azerty')
    await loader.loadLayoutShape('mobile-default')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('constructs fetch URL with baseUrl and known path', async () => {
    const mockFetch = mockFetchOk(validLayout)
    vi.stubGlobal('fetch', mockFetch)
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com' })
    await loader.loadLayoutShape('desktop-azerty')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://cdn.example.com/data/layouts/desktop-azerty.json',
    )
  })

  it('strips trailing slash from baseUrl before appending path', async () => {
    const mockFetch = mockFetchOk(validLayout)
    vi.stubGlobal('fetch', mockFetch)
    const loader = createDataLoader({ baseUrl: 'https://cdn.example.com/' })
    await loader.loadLayoutShape('desktop-azerty')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://cdn.example.com/data/layouts/desktop-azerty.json',
    )
  })
})
