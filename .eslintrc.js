module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:jest/recommended',
    'standard',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    indent: ['error', 2, {
      SwitchCase: 1,
      ignoredNodes: ['PropertyDefinition'],
    }],
    'no-useless-constructor': 'off',
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }],
    camelcase: 'off',
    'no-warning-comments': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'off', {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
      },
    ],
  },
}
