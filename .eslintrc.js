module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        destructuredArrayIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      }
    ],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error']
      }
    ],
    'no-debugger': 'error',
  },
  root: true,
  ignorePatterns: [
    '**/.eslintrc.js',
    '**/dist*/',
    'rollup.config.js',
    'cypress.config.ts',
    'cypress/**/*',
    'examples/**/*',
  ],
};
