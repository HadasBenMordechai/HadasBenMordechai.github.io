import { describe, it, expect, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

const STORAGE_KEY = 'vueuse-color-scheme';
const html = document.documentElement;

describe('ThemeToggle', () => {
  let wrapper: VueWrapper;

  // The button renders only once mounted (client-only)
  const mountToggle = async () => {
    wrapper = mount(ThemeToggle);
    await nextTick();
  };

  afterEach(() => {
    wrapper?.unmount();
    localStorage.clear();
    html.classList.remove('dark');
  });

  it('renders nothing before being mounted', () => {
    wrapper = mount(ThemeToggle);

    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('defaults to light mode and offers to switch to dark', async () => {
    await mountToggle();
    const button = wrapper.find('button');

    expect(button.attributes('aria-label')).toBe('Switch to dark mode');
    expect(button.find('i').classes()).toContain('pi-moon');
    expect(html.classList.contains('dark')).toBe(false);
  });

  it('switches to dark mode and saves the choice', async () => {
    await mountToggle();

    await wrapper.find('button').trigger('click');

    expect(html.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(wrapper.find('button').attributes('aria-label')).toBe('Switch to light mode');
    expect(wrapper.find('i').classes()).toContain('pi-sun');
  });

  it('switches back to light mode', async () => {
    await mountToggle();

    await wrapper.find('button').trigger('click');
    await wrapper.find('button').trigger('click');

    expect(html.classList.contains('dark')).toBe(false);
    expect(wrapper.find('i').classes()).toContain('pi-moon');
  });

  it('restores a saved dark choice', async () => {
    localStorage.setItem(STORAGE_KEY, 'dark');

    await mountToggle();

    expect(html.classList.contains('dark')).toBe(true);
    expect(wrapper.find('button').attributes('aria-label')).toBe('Switch to light mode');
  });
});
