<script setup lang="ts">
import { useDark, useMounted, useToggle } from '@vueuse/core';

// Defaults to the system preference; the user's choice is saved in localStorage
const isDark = useDark();
const toggleDark = useToggle(isDark);

// The page is pre-rendered without knowing the theme, so render only on the client
const mounted = useMounted();
</script>

<template>
  <button
    v-if="mounted"
    type="button"
    class="cursor-pointer text-muted hover:text-ink hover:bg-line transition-colors rounded-full w-9 aspect-square"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleDark()">
    <i class="pi text-lg!" :class="isDark ? 'pi-sun' : 'pi-moon'" aria-hidden="true" />
  </button>
</template>
