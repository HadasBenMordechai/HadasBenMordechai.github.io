import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAiModelsStore } from '@/stores/ai-models';
import { fetchWithFallback } from '@/helpers';
import fixture from '../../fixtures/openrouter-models.json';

vi.mock('@/helpers', () => ({ fetchWithFallback: vi.fn() }));

const fetchMock = vi.mocked(fetchWithFallback);

const rawModel = (overrides: Record<string, unknown> = {}) => ({
  id: 'vendor/model',
  name: 'Vendor: Model',
  created: 1700000000,
  description: 'A model',
  context_length: 128000,
  architecture: { tokenizer: 'GPT', input_modalities: ['text'] },
  pricing: { prompt: '0.000001', completion: '0.000002' },
  ...overrides,
});

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), init);

describe('ai-models store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    fetchMock.mockReset();
  });

  it('has an empty initial state', () => {
    const store = useAiModelsStore();

    expect(store.aiModels).toEqual([]);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
    expect(store.inputModalityOptions).toEqual([]);
  });

  it('fetches from OpenRouter with the local fixture as fallback', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));
    const store = useAiModelsStore();

    await store.fetchAiModels();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/models',
      expect.stringContaining('openrouter-models.json'),
    );
  });

  it('toggles isLoading while fetching', async () => {
    let resolve!: (r: Response) => void;
    fetchMock.mockReturnValue(new Promise(r => (resolve = r)));
    const store = useAiModelsStore();

    const promise = store.fetchAiModels();
    expect(store.isLoading).toBe(true);

    resolve(jsonResponse({ data: [] }));
    await promise;
    expect(store.isLoading).toBe(false);
  });

  it('parses string prices into numbers and keeps the other fields', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [rawModel()] }));
    const store = useAiModelsStore();

    await store.fetchAiModels();

    expect(store.aiModels).toEqual([
      expect.objectContaining({
        id: 'vendor/model',
        name: 'Vendor: Model',
        pricing: { prompt: 0.000001, completion: 0.000002 },
      }),
    ]);
    expect(store.error).toBeNull();
  });

  it('normalizes the real OpenRouter fixture', async () => {
    fetchMock.mockResolvedValue(jsonResponse(fixture));
    const store = useAiModelsStore();

    await store.fetchAiModels();

    expect(store.aiModels).toHaveLength(fixture.data.length);
    for (const model of store.aiModels) {
      expect(typeof model.pricing.prompt).toBe('number');
      expect(typeof model.pricing.completion).toBe('number');
    }
  });

  it('builds sorted, de-duplicated input modality options', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: [
          rawModel({
            id: 'a',
            architecture: { tokenizer: 'x', input_modalities: ['text', 'image'] },
          }),
          rawModel({
            id: 'b',
            architecture: { tokenizer: 'x', input_modalities: ['audio', 'text'] },
          }),
          rawModel({ id: 'c', architecture: { tokenizer: 'x', input_modalities: ['file'] } }),
        ],
      }),
    );
    const store = useAiModelsStore();

    await store.fetchAiModels();

    expect(store.inputModalityOptions).toEqual(['audio', 'file', 'image', 'text']);
  });

  it('sets an error and clears models when the request fails', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [rawModel()] }));
    const store = useAiModelsStore();
    await store.fetchAiModels();
    expect(store.aiModels).toHaveLength(1);

    fetchMock.mockRejectedValueOnce(new Error('Both primary and fallback requests failed.'));
    await store.fetchAiModels();

    expect(store.error).toBe('Both primary and fallback requests failed.');
    expect(store.aiModels).toEqual([]);
    expect(store.isLoading).toBe(false);
  });

  it('sets an error when the payload is malformed', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ unexpected: true }));
    const store = useAiModelsStore();

    await store.fetchAiModels();

    expect(store.error).toEqual(expect.any(String));
    expect(store.aiModels).toEqual([]);
  });

  it('clears a previous error on a new fetch', async () => {
    fetchMock.mockRejectedValueOnce(new Error('boom'));
    const store = useAiModelsStore();
    await store.fetchAiModels();
    expect(store.error).toBe('boom');

    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [] }));
    await store.fetchAiModels();

    expect(store.error).toBeNull();
  });
});
