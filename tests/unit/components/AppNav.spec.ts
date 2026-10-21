import { describe, it, expect, afterEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import AppNav from '@/components/AppNav.vue';
import NavList from '@/components/NavList.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

describe('AppNav', () => {
  let wrapper: VueWrapper;

  const mountNav = () => {
    wrapper = mount(AppNav, { attachTo: document.body });
    return wrapper;
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the desktop nav list and a closed mobile menu', () => {
    mountNav();

    expect(wrapper.findAllComponents(NavList)).toHaveLength(1);
    expect(wrapper.findAll('[aria-label="Open navbar"]')).toHaveLength(3);
    expect(wrapper.find('[aria-label="Close navbar"]').exists()).toBe(false);
  });

  it('renders the theme toggle', () => {
    mountNav();

    expect(wrapper.findComponent(ThemeToggle).exists()).toBe(true);
  });

  it('opens the mobile menu when the toggle is clicked', async () => {
    mountNav();

    await wrapper.find('button').trigger('click');

    expect(wrapper.find('[aria-label="Close navbar"]').exists()).toBe(true);
    expect(wrapper.findAllComponents(NavList)).toHaveLength(2);
  });

  it('closes the mobile menu when a link is clicked', async () => {
    mountNav();
    await wrapper.find('button').trigger('click');

    const mobileList = wrapper.findAllComponents(NavList)[0]!;
    await mobileList.find('a').trigger('click');
    await flushPromises();

    expect(wrapper.find('[aria-label="Close navbar"]').exists()).toBe(false);
    expect(wrapper.findAllComponents(NavList)).toHaveLength(1);
  });
});
