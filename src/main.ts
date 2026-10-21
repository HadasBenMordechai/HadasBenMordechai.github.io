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
    colorScheme: {
      // Indigo-tinted surfaces matching the app's dark palette (style.css)
      dark: {
        surface: {
          0: '#ffffff',
          50: '#f1f2f9',
          100: '#e4e6f3',
          200: '#d6d8e8',
          300: '#c3c6dd',
          400: '#a3a7c7',
          500: '#6b70a0',
          600: '#4a5085',
          700: '#2b3060',
          800: '#1d2142',
          900: '#13162c',
          950: '#0f1122',
        },
      },
    },
  },
});

export const createApp = ViteSSG(App, ({ app }) => {
  app.use(pinia);
  app.use(PrimeVue, { theme: { preset: MyPreset, options: { darkModeSelector: '.dark' } } });
});
