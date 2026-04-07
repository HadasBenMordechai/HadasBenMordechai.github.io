import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  { files: ['**/*.{js,mjs,cjs,ts,mts,vue}'], languageOptions: { globals: globals.browser } },
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser, sourceType: 'module' } },
  },
  eslintConfigPrettier,
  { rules: { 'vue/multi-word-component-names': 'warn' } },
);
