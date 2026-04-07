<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useClipboard } from '@vueuse/core';

import { default as PVDataTable } from 'primevue/datatable';
import { default as PVIconField } from 'primevue/iconfield';
import { default as PVInputIcon } from 'primevue/inputicon';
import { default as PVInputText } from 'primevue/inputtext';
import { default as PVMultiSelect } from 'primevue/multiselect';
import { default as PVButton } from 'primevue/button';
import { default as PVColumn } from 'primevue/column';
import { default as PVDialog } from 'primevue/dialog';
import { default as PVPanel } from 'primevue/panel';

import { default as vTooltip } from 'primevue/tooltip';

import { useAiModelsStore } from '@/stores/ai-models';
import type { AiModel } from '@/interfaces/AiModel';

const aiModelsStore = useAiModelsStore();

onMounted(() => {
  aiModelsStore.fetchAiModels();
});

const isMobile = ref(window.innerWidth < 768);

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768;
});

const search = ref('');
const inputModalities = ref([] as string[]);
const inputPriceCategories = ref([] as string[]);
const outputPriceCategories = ref([] as string[]);

const getPriceCategory = (pricePerM: number) => {
  if (pricePerM === 0) {
    return { label: 'Free', value: 'free', class: 'text-amber-700' };
  }
  if (pricePerM < 1) {
    return { label: 'Cheap (0$ - 1$)', value: 'cheap', class: 'text-green-700' };
  }
  if (pricePerM < 5) {
    return { label: 'Economic (1$ - 5$)', value: 'economic', class: 'text-orange-700' };
  }

  return { label: 'Expensive (5$+)', value: 'expensive', class: 'text-red-700' };
};

const priceCategoryOptions = [
  getPriceCategory(0),
  getPriceCategory(0.5),
  getPriceCategory(2),
  getPriceCategory(10),
];

const tableData = computed(() => {
  let res = aiModelsStore.aiModels;

  if (search.value) {
    res = res.filter(model => model.name.toLowerCase().includes(search.value.toLowerCase()));
  }

  if (inputModalities.value.length > 0) {
    res = res.filter(model =>
      inputModalities.value.some(modality =>
        model.architecture.input_modalities.includes(modality),
      ),
    );
  }

  if (inputPriceCategories.value.length > 0) {
    res = res.filter(model =>
      inputPriceCategories.value.includes(getPriceCategory(model.pricing.prompt * 1_000_000).value),
    );
  }

  if (outputPriceCategories.value.length > 0) {
    res = res.filter(model =>
      outputPriceCategories.value.includes(
        getPriceCategory(model.pricing.completion * 1_000_000).value,
      ),
    );
  }

  return res;
});

const clearSearch = () => {
  inputModalities.value = [];
  inputPriceCategories.value = [];
  outputPriceCategories.value = [];
  search.value = '';
};

const { copy, copied, text, isSupported: isClipboardSupported } = useClipboard();

const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatRelative = (timestamp: number) => {
  const diff = Date.now() - timestamp * 1000;
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30.4)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

const formatPrice = (pricePerToken: number): { text: string; class: string } => {
  const price = pricePerToken * 1_000_000;
  return {
    text: `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)} / 1M`,
    class: getPriceCategory(price).class,
  };
};

type AiModelDescription = Pick<AiModel, 'name' | 'description'>;

const currentModel = ref<AiModelDescription | null>(null);

const openDescription = (model: AiModelDescription) => {
  currentModel.value = model;
};
</script>

<template>
  <div class="border border-gray-200 rounded-lg">
    <PVPanel :toggleable="isMobile" :collapsed="isMobile" header="Find Models" class="border-none!">
      <template #toggleicon>
        <i class="pi pi-filter" />
      </template>

      <div class="grid grid-cols-1 sm:flex flex-wrap items-center gap-3">
        <div class="relative">
          <PVIconField>
            <PVInputIcon class="pi pi-search" />
            <PVInputText
              v-model="search"
              placeholder="Search model by name"
              class="w-full sm:w-72 pe-10!" />
          </PVIconField>
          <PVButton
            v-if="search"
            icon="pi pi-times"
            text
            @click.prevent="search = ''"
            title="Delete search"
            class="absolute! top-1/2 end-0.5 py-1.5! -translate-y-1/2" />
        </div>
        <PVMultiSelect
          v-model="inputPriceCategories"
          :options="priceCategoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Input price categories"
          class="sm:w-61" />
        <PVMultiSelect
          v-model="outputPriceCategories"
          :options="priceCategoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Output price categories"
          class="sm:w-64" />
        <PVMultiSelect
          v-model="inputModalities"
          :options="aiModelsStore.inputModalityOptions"
          placeholder="Input modalities"
          class="sm:w-49" />
        <div class="flex justify-center">
          <PVButton
            class="inline-block"
            label="Reset"
            title="Reset search"
            severity="secondary"
            @click.prevent="clearSearch" />
        </div>
      </div>
    </PVPanel>

    <PVDataTable
      :value="tableData"
      :loading="aiModelsStore.isLoading"
      paginator
      stripedRows
      :rows="10"
      paginatorTemplate="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
      currentPageReportTemplate="{first} to {last} of {totalRecords}"
      :pt="{ pcPaginator: { paginatorContainer: { class: 'border-b-0!' } } }"
      class="text-xs lg:text-base px-2 sm:px-5 border-t border-gray-200 pt-2">
      <PVColumn field="name" header="Name" class="w-[25%]" sortable>
        <template #body="{ data }">
          {{ data.name }}
          <template v-if="isClipboardSupported">
            <div class="relative inline-block">
              <PVButton
                class="inline"
                :icon="'pi ' + (copied && text === data.name ? 'pi-check' : 'pi-clipboard')"
                rounded
                text
                @click="copy(data.name)"
                title="Copy to clipboard" />
              <div
                v-if="copied && text === data.name"
                class="absolute bottom-full -start-1/4 rounded-lg text-xs bg-gray-100 text-gray-700 px-2 py-0.5 mb-1">
                Copied!
              </div>
            </div>
          </template>
        </template>
      </PVColumn>
      <PVColumn field="created" header="Created" class="w-[14%]" sortable>
        <template #body="{ data }">
          <span v-tooltip.right="formatDate(data.created)">
            {{ formatRelative(data.created) }}
          </span>
        </template>
      </PVColumn>
      <PVColumn header="Pricing" class="w-[17%]">
        <template #body="{ data }">
          <template v-if="data.pricing.prompt + data.pricing.completion > 0">
            <template v-for="k in ['prompt', 'completion']" :key="k">
              <div v-for="p in [formatPrice(data.pricing[k])]" :key="k">
                <span>{{ { prompt: 'Input', completion: 'Output' }[k] }}:&nbsp;</span>
                <span :class="p.class">{{ p.text }}</span>
              </div>
            </template>
          </template>
          <span
            v-else
            :class="getPriceCategory(0).class"
            class="bg-amber-50 rounded-lg px-2 py-0.4">
            Free
            <i class="pi pi-star" />
          </span>
        </template>
      </PVColumn>
      <PVColumn field="context_length" header="Context Length" class="w-[16%]" sortable>
        <template #body="{ data }"
          >{{ parseInt((data.context_length / 1000) as unknown as string) }}K Tokens</template
        >
      </PVColumn>
      <PVColumn field="architecture.input_modalities" header="Input Modalities" class="w-[19%]">
        <template #body="{ data }">
          {{ data.architecture.input_modalities.join(', ') }}
        </template>
      </PVColumn>
      <PVColumn field="architecture.tokenizer" header="Tokenizer" class="w-[11%] text-gray-600" />
      <PVColumn header="Description" class="w-[8%]">
        <template #body="{ data }">
          <PVButton
            icon="pi pi-book"
            text
            rounded
            @click="openDescription(data)"
            title="Read model description" />
        </template>
      </PVColumn>

      <template #empty>No models found.</template>
    </PVDataTable>

    <PVDialog
      :visible="!!currentModel"
      @update:visible="currentModel = null"
      :header="currentModel?.name || 'Model Description'"
      modal
      class="w-150 max-w-[85vw]">
      <p>{{ currentModel?.description }}</p>
    </PVDialog>
  </div>
</template>
