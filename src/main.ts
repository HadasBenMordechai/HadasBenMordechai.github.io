import '@/style.css';

import { ViteSSG } from 'vite-ssg/single-page';

import App from '@/App.vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia';
import { definePreset } from '@primeuix/themes';

const pinia = createPinia();

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
  },
});

export const createApp = ViteSSG(App, ({ app }) => {
  app.use(pinia);
  app.use(PrimeVue, { theme: { preset: MyPreset, options: {darkMode: false || 'none'} } });
});
