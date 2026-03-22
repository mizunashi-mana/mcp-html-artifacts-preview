import { buildConfig } from '@mizunashi_mana/eslint-config-refined';

export default [
  {
    ignores: ['dist/**'],
  },
  ...buildConfig({
    entrypointFiles: [
      'src/index.ts',
      'src/cli.ts',
    ],
  }),
  {
    files: ['scripts/**'],
    rules: {
      'n/hashbang': 'off',
    },
  },
];
