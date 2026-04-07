/// <reference types="vitest/config" />

import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{vue,ts,js}'],
        exclude: ['**/*.d.ts'],
        /*thresholds: {
          statements: 99,
          branches: 100,
          functions: 100,
          lines: 100,
        },*/
      },
    },
  }),
);
