import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AiModel } from '@/interfaces/AiModel';

import modelsUrl from '../../tests/fixtures/openrouter-models.json?url';
import { fetchWithFallback } from '@/helpers';

export const useAiModelsStore = defineStore('aiModels', () => {
  const aiModels = ref<AiModel[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchAiModels = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const res = await fetchWithFallback('https://openrouter.ai/api/v1/models', modelsUrl);

      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await res.json();
      // normalize data to match AiModel interface
      aiModels.value = data.data.map((i: AiModel) => ({
        ...i,
        pricing: {
          prompt: parseFloat(i.pricing.prompt as unknown as string),
          completion: parseFloat(i.pricing.completion as unknown as string),
        },
      }));
    } catch (err) {
      error.value = (err as Error).message;
      aiModels.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const inputModalityOptions = computed(() =>
    [...new Set(aiModels.value.flatMap(model => model.architecture.input_modalities))].sort(),
  );

  return { aiModels, isLoading, error, fetchAiModels, inputModalityOptions };
});
