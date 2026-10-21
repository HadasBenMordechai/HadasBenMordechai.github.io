import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h, type Ref } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import App from '@/App.vue';
import AppNav from '@/components/AppNav.vue';
import StorySlide from '@/components/StorySlide.vue';
import { scrollToId } from '@/helpers';

const { register } = vi.hoisted(() => ({ register: vi.fn() }));

vi.mock('swiper/element/bundle', () => ({ register }));
vi.mock('@/helpers', () => ({ scrollToId: vi.fn() }));
vi.mock('@/components/DataIntegration.vue', () => ({
  __esModule: true,
  default: defineComponent({
    name: 'DataIntegration',
    render: () => h('div', { id: 'data-integration' }),
  }),
}));

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
vi.mock('@vueuse/core', async importOriginal => ({
  ...(await importOriginal<typeof import('@vueuse/core')>()),
  useIntersectionObserver: vi.fn(),
}));

const observers: { target: Ref<Element | null>; callback: ObserverCallback }[] = [];

/** Simulate the IntersectionObserver reporting the given element's visibility */
const setVisible = async (el: Element, isIntersecting = true) => {
  const observer = observers.find(o => o.target.value === el);
  if (!observer) throw new Error('Element is not observed');
  observer.callback([{ isIntersecting }]);
  await flushPromises();
};

let wrapper: VueWrapper;

describe('App', () => {
  beforeEach(() => {
    observers.length = 0;
    vi.mocked(useIntersectionObserver).mockImplementation((target, callback) => {
      observers.push({ target: target as Ref<Element | null>, callback: callback as never });
      return { stop: vi.fn() } as never;
    });
    wrapper = mount(App, { attachTo: document.body });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  it('renders the navigation and all page sections', () => {
    expect(wrapper.findComponent(AppNav).exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('Hadas Ben Mordechai');

    for (const id of ['about', 'stack', 'hobbies', 'integration', 'contact']) {
      expect(wrapper.find(`#${id}`).exists(), `#${id} should exist`).toBe(true);
    }
  });

  it('has an anchor target for every nav link', () => {
    const hrefs = wrapper
      .findComponent(AppNav)
      .findAll('a')
      .map(a => a.attributes('href')!);

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(document.querySelector(href), `${href} should exist`).not.toBeNull();
    }
  });

  it('renders the intro links as accessible external links with icons', () => {
    const links = wrapper.findAll('#about a[target="_blank"]');

    expect(links.map(a => [a.attributes('aria-label'), a.attributes('href')])).toEqual([
      ['Vite', 'https://vite.dev'],
      ['Vue.js', 'https://vuejs.org'],
      ['Tailwind CSS', 'https://tailwindcss.com'],
    ]);
    for (const link of links) {
      expect(link.find('svg').exists()).toBe(true);
    }
  });

  it('animates the intro links one after another once visible', async () => {
    const links = wrapper.findAll('#about a[target="_blank"]');
    expect(links[0]!.classes()).not.toContain('animate__fadeIn');

    await setVisible(links[0]!.element.parentElement!);

    expect(links.map(a => a.classes().find(c => c.startsWith('animate__delay')))).toEqual([
      'animate__delay-1s',
      'animate__delay-2s',
      'animate__delay-3s',
    ]);
  });

  it('scrolls smoothly to the contact section from the header button', async () => {
    const contactBtn = wrapper.findAll('header a').find(a => a.text() === 'Contact Me')!;

    await contactBtn.trigger('click');

    expect(scrollToId).toHaveBeenCalledExactlyOnceWith('contact');
  });

  it('animates the header only once it becomes visible', async () => {
    const h1 = wrapper.find('h1');
    expect(h1.classes()).not.toContain('animate__fadeIn');

    await setVisible(h1.element.parentElement!);

    expect(h1.classes()).toContain('animate__fadeIn');
  });

  it('shows the current year in the footer', () => {
    expect(wrapper.find('footer').text()).toContain(`© ${new Date().getFullYear()}`);
  });

  describe('tabs', () => {
    const tab = (label: string) => wrapper.findAll('[role="tab"]').find(t => t.text() === label)!;
    // Unselected panels are rendered by Headless UI as hidden <span> placeholders
    const selectedPanel = () => wrapper.find('div[role="tabpanel"]');

    it('shows the tech stack by default', () => {
      expect(tab('Tech Stack').attributes('aria-selected')).toBe('true');
      expect(selectedPanel().findAll('h5')).toHaveLength(12);
      expect(wrapper.text()).toContain('Vue 3 (Options & Composition API)');
    });

    it('switches to the story and lazy-loads swiper when it becomes visible', async () => {
      await tab('The Story').trigger('click');

      expect(tab('The Story').attributes('aria-selected')).toBe('true');
      const panel = selectedPanel();
      expect(panel.findAll('h5')).toHaveLength(0);
      expect(panel.find('swiper-container').exists()).toBe(false);

      await setVisible(panel.element.firstElementChild!);

      expect(register).toHaveBeenCalledOnce();
      expect(panel.find('swiper-container').exists()).toBe(true);
      expect(panel.findAllComponents(StorySlide)).toHaveLength(7);
    });

    it('does not load swiper while the story is not visible', async () => {
      await tab('The Story').trigger('click');
      const panel = selectedPanel();

      await setVisible(panel.element.firstElementChild!, false);

      expect(register).not.toHaveBeenCalled();
      expect(panel.find('swiper-container').exists()).toBe(false);
    });
  });

  it('lazy-loads the data integration when it becomes visible', async () => {
    const section = wrapper.find('#integration');
    expect(section.find('#data-integration').exists()).toBe(false);

    await setVisible(section.element.lastElementChild!);

    expect(section.find('#data-integration').exists()).toBe(true);
  });
});
