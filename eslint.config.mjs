import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.git/**', '**/*.js', '**/*.mjs', '**/*.cjs'],
  },
  {
    files: ['backend/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'error',
      'prefer-const': 'warn',
      'no-useless-escape': 'warn',
      'no-control-regex': 'off',
      'no-empty': 'warn',
      '@typescript-eslint/no-namespace': 'warn',
      'no-useless-catch': 'off',
    },
  },
  {
    files: ['frontend/src/**/*.ts', 'frontend/src/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'prefer-const': 'warn',
      'no-useless-escape': 'warn',
      'no-control-regex': 'off',
      'no-empty': 'warn',
      'no-useless-catch': 'off',
    },
  }
);
