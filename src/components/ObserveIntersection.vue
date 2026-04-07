<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core';
import { shallowRef, useTemplateRef } from 'vue';

type Props = { is?: string; rootMargin?: string; threshold?: number | number[]; once?: boolean };

const props = withDefaults(defineProps<Props>(), {
  is: 'div',
  rootMargin: '0px',
  threshold: 0,
  once: false,
});

const emit = defineEmits(['change']);

const target = useTemplateRef<HTMLDivElement>('target');
const targetIsVisible = shallowRef(false);

const { stop } = useIntersectionObserver(
  target,
  ([entry]) => {
    targetIsVisible.value = entry?.isIntersecting || false;
    emit('change', targetIsVisible.value);
    if (props.once && targetIsVisible.value) {
      stop();
    }
  },
  { rootMargin: props.rootMargin, threshold: props.threshold },
);
</script>

<template>
  <component :is="is" ref="target">
    <slot :visible="targetIsVisible" />
  </component>
</template>
