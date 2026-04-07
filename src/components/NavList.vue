<script lang="ts">
import { defineComponent } from 'vue';
import { scrollToId } from '@/helpers';

export default defineComponent({
  name: 'NavList',
  emits: ['clicked'],
  data() {
    return {
      links: [
        { id: 'about' },
        { id: 'stack', txt: 'tech stack' },
        { id: 'hobbies' },
        { id: 'integration', txt: 'data integration' },
        { id: 'contact' },
      ],
    };
  },
  methods: {
    linkClicked(id: string) {
      scrollToId(id);
      this.$emit('clicked');
    },
  },
});
</script>

<template>
  <ul class="capitalize font-light">
    <li v-for="l in links" :key="l.id" class="py-1 px-3">
      <a
        @click="linkClicked(l.id)"
        class="block hover:text-indigo-800 transition-colors p-2"
        :href="'#' + l.id">
        {{ l.txt || l.id }}
      </a>
    </li>
  </ul>
</template>
