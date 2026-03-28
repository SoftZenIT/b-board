import pluginVue from 'eslint-plugin-vue';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
  // TypeScript source files
  ...tsPlugin.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  // Vue SFC files — vue-eslint-parser wraps the TS parser
  ...pluginVue.configs['flat/recommended'].map((config) => ({
    ...config,
    files: ['**/*.vue'],
    languageOptions: {
      ...config.languageOptions,
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
  })),
  // Override rules for both .ts and .vue
  {
    files: ['**/*.ts', '**/*.vue'],
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/multi-word-component-names': 'off',
    },
  },
  // Test files — relax rules that are overly strict in test contexts
  {
    files: ['tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  // Module boundary enforcement
  {
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'public',      pattern: 'src/public/**' },
        { type: 'data',        pattern: 'src/data/**' },
        { type: 'core',        pattern: 'src/core/**' },
        { type: 'composition', pattern: 'src/composition/**' },
        { type: 'adapters',    pattern: 'src/adapters/**' },
        { type: 'ui',          pattern: 'src/ui/**' },
      ],
    },
    rules: {
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        rules: [
          { from: { type: 'data' },        allow: { to: { type: 'public' } } },
          { from: { type: 'core' },        allow: { to: { type: ['data', 'public'] } } },
          { from: { type: 'composition' }, allow: { to: { type: ['data', 'public'] } } },
          { from: { type: 'adapters' },    allow: { to: { type: ['core', 'public'] } } },
          { from: { type: 'ui' },          allow: { to: { type: ['core', 'public'] } } },
        ],
      }],
    },
  },
];
