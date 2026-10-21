import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import PVMultiSelect from 'primevue/multiselect';
import PVPanel from 'primevue/panel';
import DataIntegration from '@/components/DataIntegration.vue';
import { fetchWithFallback } from '@/helpers';

vi.mock('@/helpers', () => ({ fetchWithFallback: vi.fn() }));

const NOW = new Date('2026-06-15T12:00:00Z');
const DAY = 86400;
const nowSec = NOW.getTime() / 1000;

// Prices are per token, as returned by the API (as strings)
const models = [
  {
    id: 'a/free',
    name: 'Alpha Free',
    created: nowSec - 10,
    description: 'A free model',
    context_length: 32000,
    architecture: { tokenizer: 'Llama', input_modalities: ['text'] },
    pricing: { prompt: '0', completion: '0' },
  },
  {
    id: 'b/cheap',
    name: 'Beta Cheap',
    created: nowSec - DAY,
    description: 'A cheap model',
    context_length: 128000,
    architecture: { tokenizer: 'GPT', input_modalities: ['text', 'image'] },
    pricing: { prompt: '0.0000005', completion: '0.000002' },
  },
  {
    id: 'c/economic',
    name: 'Gamma Economic',
    created: nowSec - 10 * DAY,
    description: 'An economic model',
    context_length: 200000,
    architecture: { tokenizer: 'Claude', input_modalities: ['text', 'file'] },
    pricing: { prompt: '0.000003', completion: '0.000015' },
  },
  {
    id: 'd/expensive',
    name: 'Delta Expensive',
    created: nowSec - 100 * DAY,
    description: 'An expensive model',
    context_length: 1000000,
    architecture: { tokenizer: 'Gemini', input_modalities: ['audio', 'text'] },
    pricing: { prompt: '0.00001', completion: '0.00004' },
  },
  {
    id: 'e/old',
    name: 'Epsilon Old',
    created: nowSec - 800 * DAY,
    description: 'An old model',
    context_length: 4096,
    architecture: { tokenizer: 'Other', input_modalities: ['text'] },
    pricing: { prompt: '0.0000001', completion: '0' },
  },
];

let wrapper: VueWrapper;

const mountComponent = async () => {
  wrapper = mount(DataIntegration, {
    global: { plugins: [[PrimeVue, { theme: 'none' }]] },
    attachTo: document.body,
  });
  await flushPromises();
  return wrapper;
};

const rows = () => wrapper.findAll('tbody tr');
const names = () => rows().map(r => r.find('td').text().split('\n')[0]!.trim());
const cellText = (rowIdx: number, colIdx: number) =>
  rows()[rowIdx]!.findAll('td')[colIdx]!.text().replace(/\s+/g, ' ').trim();

const multiSelect = (placeholder: string) =>
  wrapper.findAllComponents(PVMultiSelect).find(c => c.props('placeholder') === placeholder)!;

const setInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
};

describe('DataIntegration', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    setInnerWidth(1024);
    setActivePinia(createPinia());
    vi.mocked(fetchWithFallback).mockResolvedValue(new Response(JSON.stringify({ data: models })));
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  describe('data loading', () => {
    it('fetches the models on mount and renders them', async () => {
      await mountComponent();

      expect(fetchWithFallback).toHaveBeenCalledOnce();
      expect(names()).toEqual([
        'Alpha Free',
        'Beta Cheap',
        'Gamma Economic',
        'Delta Expensive',
        'Epsilon Old',
      ]);
    });

    it('shows the empty message when there are no models', async () => {
      vi.mocked(fetchWithFallback).mockResolvedValue(new Response(JSON.stringify({ data: [] })));
      await mountComponent();

      expect(wrapper.find('tbody').text()).toContain('No models found.');
    });

    it('paginates 10 rows per page', async () => {
      const many = Array.from({ length: 23 }, (_, i) => ({
        ...models[0],
        id: `m${i}`,
        name: `M${i}`,
      }));
      vi.mocked(fetchWithFallback).mockResolvedValue(new Response(JSON.stringify({ data: many })));
      await mountComponent();

      expect(rows()).toHaveLength(10);
      expect(wrapper.text()).toContain('1 to 10 of 23');
    });
  });

  describe('cell formatting', () => {
    it.each([
      [0, 'Today'],
      [1, 'Yesterday'],
      [2, '10 days ago'],
      [3, '3 months ago'],
      [4, '2 years ago'],
    ])('row %i shows relative creation date "%s"', async (row, expected) => {
      await mountComponent();

      expect(cellText(row, 1)).toBe(expected);
    });

    it('shows the full creation date in a tooltip', async () => {
      await mountComponent();

      await rows()[4]!.findAll('td')[1]!.find('span').trigger('mouseenter');
      // The tooltip is shown after a setTimeout(0)
      await new Promise(r => setTimeout(r));

      const tooltip = document.body.querySelector('[role="tooltip"]');
      expect(tooltip?.textContent).toBe(
        new Date((nowSec - 800 * DAY) * 1000).toLocaleDateString('en-IL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      );
    });

    it('shows a "Free" badge when both prices are 0', async () => {
      await mountComponent();
      const badge = rows()[0]!.findAll('td')[2]!.find('span');

      expect(badge.text()).toBe('Free');
      expect(badge.classes()).toContain('text-amber-700');
    });

    it('shows input/output prices per 1M tokens, colored by category', async () => {
      await mountComponent();

      const prices = (row: number) =>
        rows()
          [row]!.findAll('td')[2]!
          .findAll('div')
          .map(d => d.text().replace(/\s+/g, ' '));
      expect(prices(1)).toEqual(['Input: $0.50 / 1M', 'Output: $2.00 / 1M']);
      expect(prices(3)).toEqual(['Input: $10.00 / 1M', 'Output: $40.00 / 1M']);

      const priceSpans = (row: number) =>
        rows()
          [row]!.findAll('td')[2]!
          .findAll('span:nth-child(2)')
          .map(s => s.classes());
      expect(priceSpans(1)).toEqual([
        ['text-green-700', 'dark:text-green-400'],
        ['text-orange-700', 'dark:text-orange-400'],
      ]);
      expect(priceSpans(2)).toEqual([
        ['text-orange-700', 'dark:text-orange-400'],
        ['text-red-700', 'dark:text-red-400'],
      ]);
      expect(priceSpans(4)).toEqual([
        ['text-green-700', 'dark:text-green-400'],
        ['text-amber-700', 'dark:text-amber-400'],
      ]);
    });

    it('shows the context length in thousands of tokens (rounded down)', async () => {
      await mountComponent();

      expect(cellText(0, 3)).toBe('32K Tokens');
      expect(cellText(3, 3)).toBe('1000K Tokens');
      expect(cellText(4, 3)).toBe('4K Tokens');
    });

    it('shows the input modalities and tokenizer', async () => {
      await mountComponent();

      expect(cellText(1, 4)).toBe('text, image');
      expect(cellText(1, 5)).toBe('GPT');
    });
  });

  describe('filters', () => {
    it('filters by name, case-insensitively', async () => {
      await mountComponent();

      await wrapper.find('input[placeholder="Search model by name"]').setValue('ECONOMIC');

      expect(names()).toEqual(['Gamma Economic']);
    });

    it('clears the search with the inline button', async () => {
      await mountComponent();
      const input = wrapper.find('input[placeholder="Search model by name"]');
      expect(wrapper.find('button[title="Delete search"]').exists()).toBe(false);

      await input.setValue('beta');
      await wrapper.find('button[title="Delete search"]').trigger('click');

      expect((input.element as HTMLInputElement).value).toBe('');
      expect(rows()).toHaveLength(models.length);
      expect(wrapper.find('button[title="Delete search"]').exists()).toBe(false);
    });

    it('offers the input modalities from the store as options', async () => {
      await mountComponent();

      expect(multiSelect('Input modalities').props('options')).toEqual([
        'audio',
        'file',
        'image',
        'text',
      ]);
    });

    it('filters by input modality (any of the selected)', async () => {
      await mountComponent();

      await multiSelect('Input modalities').vm.$emit('update:modelValue', ['image', 'audio']);

      expect(names()).toEqual(['Beta Cheap', 'Delta Expensive']);
    });

    it('offers the four price categories', async () => {
      await mountComponent();

      const options = multiSelect('Input price categories').props('options') as { value: string }[];

      expect(options.map(o => o.value)).toEqual(['free', 'cheap', 'economic', 'expensive']);
    });

    it('filters by input price category', async () => {
      await mountComponent();

      await multiSelect('Input price categories').vm.$emit('update:modelValue', ['cheap']);

      expect(names()).toEqual(['Beta Cheap', 'Epsilon Old']);
    });

    it('filters by output price category', async () => {
      await mountComponent();

      await multiSelect('Output price categories').vm.$emit('update:modelValue', [
        'free',
        'expensive',
      ]);

      expect(names()).toEqual(['Alpha Free', 'Gamma Economic', 'Delta Expensive', 'Epsilon Old']);
    });

    it('combines all filters', async () => {
      await mountComponent();

      await wrapper.find('input[placeholder="Search model by name"]').setValue('e');
      await multiSelect('Input modalities').vm.$emit('update:modelValue', ['text']);
      await multiSelect('Input price categories').vm.$emit('update:modelValue', [
        'cheap',
        'economic',
      ]);
      await multiSelect('Output price categories').vm.$emit('update:modelValue', ['free']);

      expect(names()).toEqual(['Epsilon Old']);
    });

    it('shows the empty message when nothing matches', async () => {
      await mountComponent();

      await wrapper.find('input[placeholder="Search model by name"]').setValue('nope');

      expect(wrapper.find('tbody').text()).toContain('No models found.');
    });

    it('resets all filters', async () => {
      await mountComponent();
      await wrapper.find('input[placeholder="Search model by name"]').setValue('a');
      await multiSelect('Input modalities').vm.$emit('update:modelValue', ['image']);
      await multiSelect('Input price categories').vm.$emit('update:modelValue', ['cheap']);
      await multiSelect('Output price categories').vm.$emit('update:modelValue', ['economic']);
      expect(rows()).toHaveLength(1);

      await wrapper.find('button[title="Reset search"]').trigger('click');

      expect(rows()).toHaveLength(models.length);
      expect(multiSelect('Input modalities').props('modelValue')).toEqual([]);
      expect(multiSelect('Input price categories').props('modelValue')).toEqual([]);
      expect(multiSelect('Output price categories').props('modelValue')).toEqual([]);
      expect(
        (wrapper.find('input[placeholder="Search model by name"]').element as HTMLInputElement)
          .value,
      ).toBe('');
    });
  });

  describe('description dialog', () => {
    it('opens with the model name and description, and closes', async () => {
      await mountComponent();
      expect(document.body.querySelector('[role="dialog"]')).toBeNull();

      await rows()[2]!.find('button[title="Read model description"]').trigger('click');

      const dialog = document.body.querySelector('[role="dialog"]')!;
      expect(dialog.textContent).toContain('Gamma Economic');
      expect(dialog.textContent).toContain('An economic model');

      (dialog.querySelector('button[aria-label="Close"]') as HTMLButtonElement).click();
      await flushPromises();

      expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    });
  });

  describe('copy to clipboard', () => {
    afterEach(() => {
      Reflect.deleteProperty(navigator, 'clipboard');
      Reflect.deleteProperty(navigator, 'permissions');
    });

    it('hides the copy button when the clipboard is not supported', async () => {
      await mountComponent();

      expect(wrapper.find('button[title="Copy to clipboard"]').exists()).toBe(false);
    });

    it('copies the model name and shows feedback', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
      // useClipboard only uses the Clipboard API when the write permission is granted
      const permissionStatus = Object.assign(new EventTarget(), { state: 'granted' });
      Object.defineProperty(navigator, 'permissions', {
        value: { query: vi.fn().mockResolvedValue(permissionStatus) },
        configurable: true,
      });
      await mountComponent();

      const copyButtons = () => wrapper.findAll('button[title="Copy to clipboard"]');
      expect(copyButtons()).toHaveLength(models.length);

      await copyButtons()[1]!.trigger('click');
      await flushPromises();

      expect(writeText).toHaveBeenCalledWith('Beta Cheap');
      expect(rows()[1]!.text()).toContain('Copied!');
      expect(copyButtons()[1]!.find('.pi-check').exists()).toBe(true);
      // Only the copied row shows the feedback
      expect(rows()[0]!.text()).not.toContain('Copied!');
      expect(copyButtons()[0]!.find('.pi-clipboard').exists()).toBe(true);
    });
  });

  describe('responsive filters panel', () => {
    const panel = () => wrapper.findComponent(PVPanel);

    it('is expanded and not toggleable on desktop', async () => {
      await mountComponent();

      expect(panel().props('toggleable')).toBe(false);
      expect(panel().props('collapsed')).toBe(false);
    });

    it('is collapsed and toggleable on mobile', async () => {
      setInnerWidth(500);
      await mountComponent();

      expect(panel().props('toggleable')).toBe(true);
      expect(panel().props('collapsed')).toBe(true);
    });

    it('updates when the window is resized', async () => {
      await mountComponent();

      setInnerWidth(500);
      window.dispatchEvent(new Event('resize'));
      await flushPromises();

      expect(panel().props('toggleable')).toBe(true);
    });

    it('stops listening to resize once unmounted', async () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      await mountComponent();

      wrapper.unmount();

      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function), undefined);
      removeSpy.mockRestore();
    });
  });
});
