import { useBaseline } from './rules/use-baseline';

const plugin = {
  rules: {
    'use-baseline': useBaseline
  },
  configs: {
    recommended: {
      plugins: ['@angular-baseline-devkit/eslint-plugin'],
      rules: {
        '@angular-baseline-devkit/eslint-plugin/use-baseline': 'error'
      }
    },
    strict: {
      plugins: ['@angular-baseline-devkit/eslint-plugin'],
      rules: {
        '@angular-baseline-devkit/eslint-plugin/use-baseline': ['error', { strict: true }]
      }
    }
  }
};

export = plugin;