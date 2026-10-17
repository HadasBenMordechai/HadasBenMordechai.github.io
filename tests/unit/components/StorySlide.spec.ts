import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StorySlide from '@/components/StorySlide.vue';

describe('StorySlide', () => {
  it('renders a swiper slide with the title and content slots', () => {
    const wrapper = mount(StorySlide, {
      slots: { title: 'The Title', content: '<p class="content">Some content</p>' },
    });

    expect(wrapper.element.tagName).toBe('SWIPER-SLIDE');
    expect(wrapper.find('div').text()).toBe('The Title');
    expect(wrapper.find('p.content').text()).toBe('Some content');
  });
});
