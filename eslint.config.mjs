import { fileURLToPath } from 'node:url'

import globals from 'globals'

import { includeIgnoreFile } from '@eslint/compat'

import js from '@eslint/js'
import ts from 'typescript-eslint'
import astro from 'eslint-plugin-astro'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default [
  // Translates `.gitignore` into `ignores` glob patterns.
  includeIgnoreFile(gitignorePath),

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      globals: {
        ...globals.node, // to use `process`, `console` etc.
      },
    },
  },

  js.configs.recommended,

  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylistic,
  {
    rules: {
      // Not included in any config group.
      '@typescript-eslint/consistent-type-imports': 'error',
      // Copied from https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/strict-type-checked.ts
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowBoolean: false,
          allowAny: false,
          allowNullish: false,
          allowRegExp: false,
        },
      ],
    },
  },

  ...astro.configs.recommended,

  // Type definitions
  {
    files: ['packages/pf/src/index.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },

  // `.d.ts` files use `import()` syntax.
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { disallowTypeAnnotations: false },
      ],
    },
  },

  // Tool configs in root are not covered by `tsconfig.json`.
  {
    files: [
      'eslint.config.mjs',
      'prettier.config.mjs',
      'lint-staged.config.mjs',
    ],
    ...ts.configs.disableTypeChecked,
  },

  // Astro files do not support type-checked linting.
  // https://github.com/ota-meshi/eslint-plugin-astro/issues/447
  {
    files: ['**/*.astro'],
    ...ts.configs.disableTypeChecked,
  },
]
