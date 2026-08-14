const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['android/**', 'ios/**', 'node_modules/**', 'dist/**', '.expo/**', 'functions/**'],
  },
  {
    rules: {
      'no-console': 'warn',
    },
  },
];
