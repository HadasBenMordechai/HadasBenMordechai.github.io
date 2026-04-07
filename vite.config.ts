/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import svgLoader from 'vite-svg-loader';
import { analyzer } from 'vite-bundle-analyzer';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  plugins: [
    svgLoader({ svgo: false }),
    analyzer(),
    tailwindcss(),
    vue({ template: { compilerOptions: { isCustomElement: tag => tag.startsWith('swiper-') } } }),
  ],
});
