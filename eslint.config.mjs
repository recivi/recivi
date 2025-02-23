import { resolve } from 'node:path'

import globals from 'globals'

import { includeIgnoreFile } from '@eslint/compat'

import js from '@eslint/js'
import ts from 'typescript-eslint'
import astro from 'eslint-plugin-astro'

const gitignorePath = resolve(import.meta.filename, '../.gitignore')

export default [
  includeIgnoreFile(gitignorePath),

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },

    rules: {
      'import/prefer-default-export': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  js.configs.recommended,
  ...ts.configs.strict,
  ...ts.configs.stylistic,
  ...astro.configs.recommended,

  // Type definitions
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
]
