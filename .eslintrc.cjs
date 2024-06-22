/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  extends: ['eslint:recommended', '@remix-run/eslint-config', '@remix-run/eslint-config/node', 'prettier'],
  plugins: ['simple-import-sort', 'prettier'],
  rules: {
    'prettier/prettier': 'warn',
    'no-useless-constructor': 'off',
    'jsx-a11y/anchor-has-content': 'off',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn',
    'import/extensions': ['error', 'ignorePackages'],
  },
};
