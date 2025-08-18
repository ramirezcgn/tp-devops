import { defineConfig, globalIgnores } from 'eslint/config';
import _import from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    '*/.js',
    '**/.DS_Store',
    '**/.AppleDouble',
    '**/.LSOverride',
    '**/Icon',
    '**/._*',
    '**/.DocumentRevisions-V100',
    '**/.fseventsd',
    '**/.Spotlight-V100',
    '**/.TemporaryItems',
    '**/.Trashes',
    '**/.VolumeIcon.icns',
    '**/.com.apple.timemachine.donotpresent',
    '**/.AppleDB',
    '**/.AppleDesktop',
    '**/Network Trash Folder',
    '**/Temporary Items',
    '**/.apdisk',
    '**/logs',
    '**/*.log',
    '**/npm-debug.log*',
    '**/yarn-debug.log*',
    '**/yarn-error.log*',
    '**/lerna-debug.log*',
    '**/report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json',
    '**/pids',
    '**/*.pid',
    '**/*.seed',
    '**/*.pid.lock',
    '**/lib-cov',
    '**/coverage',
    '**/*.lcov',
    '**/.nyc_output',
    '**/.grunt',
    '**/bower_components',
    '**/.lock-wscript',
    'build/Release',
    '**/node_modules/',
    '**/jspm_packages/',
    '**/web_modules/',
    '**/*.tsbuildinfo',
    '**/.npm',
    '**/.eslintcache',
    '**/.rpt2_cache/',
    '**/.rts2_cache_cjs/',
    '**/.rts2_cache_es/',
    '**/.rts2_cache_umd/',
    '**/.node_repl_history',
    '**/*.tgz',
    '**/.yarn-integrity',
    '**/.env',
    '**/.env.test',
    '**/.env.local',
    '**/.cache',
    '**/.parcel-cache',
    '**/.next',
    '**/out',
    '**/.nuxt',
    '**/dist',
    '**/packages',
    '**/.cache/',
    '.vuepress/dist',
    '**/.serverless/',
    '**/.fusebox/',
    '**/.dynamodb/',
    '**/.tern-port',
    '**/.vscode-test',
    '.yarn/cache',
    '.yarn/unplugged',
    '.yarn/build-state.yml',
    '.yarn/install-state.gz',
    '**/.pnp.*',
    '.vscode/*',
    '!.vscode/settings.json',
    '!.vscode/tasks.json',
    '!.vscode/launch.json',
    '!.vscode/extensions.json',
    '**/*.code-workspace',
    '**/.history/',
  ]),
  {
    extends: compat.extends(
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'plugin:@next/next/recommended',
      'prettier',
    ),
    plugins: {
      import: fixupPluginRules(_import),
      react,
      'react-hooks': fixupPluginRules(reactHooks),
      '@typescript-eslint': typescriptEslint,
      prettier,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },
      parser: tsParser,
      ecmaVersion: 11,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      'no-debugger': 'off',
      'linebreak-style': ['error', 'unix'],
      'no-prototype-builtins': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react/jsx-filename-extension': [
        1,
        {
          extensions: ['.tsx', '.jsx'],
        },
      ],
      'import/extensions': [
        2,
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
    },
  },
]);
