import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NavList from '@/components/NavList.vue';
import { scrollToId } from '@/helpers';

vi.mock('@/helpers', () => ({ scrollToId: vi.fn() }));

describe('NavList', () => {
  beforeEach(() => {
    vi.mocked(scrollToId).mockReset();
  });

  it('renders a link for every section', () => {
    const wrapper = mount(NavList);
    const links = wrapper.findAll('a');

    expect(links.map(a => a.attributes('href'))).toEqual([
      '#about',
      '#stack',
      '#hobbies',
      '#integration',
      '#contact',
    ]);
  });

  it('uses the custom label when given, the id otherwise', () => {
    const wrapper = mount(NavList);

    expect(wrapper.findAll('a').map(a => a.text())).toEqual([
      'about',
      'tech stack',
      'hobbies',
      'data integration',
      'contact',
    ]);
  });

  it('scrolls to the section and emits "clicked" on click', async () => {
    const wrapper = mount(NavList);

    await wrapper.find('a[href="#integration"]').trigger('click');

    expect(scrollToId).toHaveBeenCalledExactlyOnceWith('integration');
    expect(wrapper.emitted('clicked')).toHaveLength(1);
  });
});
