import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { useIntersectionObserver } from '@vueuse/core';
import ObserveIntersection from '@/components/ObserveIntersection.vue';

vi.mock('@vueuse/core', () => ({ useIntersectionObserver: vi.fn() }));

const observerMock = vi.mocked(useIntersectionObserver);
const stop = vi.fn();
let triggerIntersection: (isIntersecting: boolean | undefined) => void;

const mountComponent = (props = {}) =>
  mount(ObserveIntersection, {
    props,
    slots: { default: `<template #default="{ visible }"><span>{{ visible }}</span></template>` },
  });

describe('ObserveIntersection', () => {
  beforeEach(() => {
    stop.mockReset();
    observerMock.mockReset().mockImplementation((_target, callback) => {
      triggerIntersection = isIntersecting =>
        callback(
          isIntersecting === undefined ? [] : [{ isIntersecting } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      return {
        stop,
        pause: vi.fn(),
        resume: vi.fn(),
        isActive: { value: true },
        isSupported: { value: true },
      } as never;
    });
  });

  it('renders a div by default', () => {
    const wrapper = mountComponent();

    expect(wrapper.element.tagName).toBe('DIV');
  });

  it('renders the element given in the "is" prop', () => {
    const wrapper = mountComponent({ is: 'ul' });

    expect(wrapper.element.tagName).toBe('UL');
  });

  it('passes the default observer options', () => {
    mountComponent();

    expect(observerMock).toHaveBeenCalledWith(expect.anything(), expect.any(Function), {
      rootMargin: '0px',
      threshold: 0,
    });
  });

  it('passes custom observer options', () => {
    mountComponent({ rootMargin: '100px', threshold: [0, 0.5] });

    expect(observerMock).toHaveBeenCalledWith(expect.anything(), expect.any(Function), {
      rootMargin: '100px',
      threshold: [0, 0.5],
    });
  });

  it('observes the root element', () => {
    const wrapper = mountComponent();
    const target = observerMock.mock.calls[0]![0] as { value: Element | null };

    expect(target.value).toBe(wrapper.element);
  });

  it('exposes visibility via the slot and emits "change"', async () => {
    const wrapper = mountComponent();
    expect(wrapper.text()).toBe('false');

    triggerIntersection(true);
    await nextTick();
    expect(wrapper.text()).toBe('true');

    triggerIntersection(false);
    await nextTick();
    expect(wrapper.text()).toBe('false');

    expect(wrapper.emitted('change')).toEqual([[true], [false]]);
  });

  it('treats a missing entry as not visible', async () => {
    const wrapper = mountComponent();

    triggerIntersection(undefined);
    await nextTick();

    expect(wrapper.text()).toBe('false');
    expect(wrapper.emitted('change')).toEqual([[false]]);
  });

  it('keeps observing when "once" is not set', () => {
    mountComponent();

    triggerIntersection(true);

    expect(stop).not.toHaveBeenCalled();
  });

  it('stops observing after first becoming visible when "once" is set', () => {
    mountComponent({ once: true });

    triggerIntersection(false);
    expect(stop).not.toHaveBeenCalled();

    triggerIntersection(true);
    expect(stop).toHaveBeenCalledOnce();
  });
});
