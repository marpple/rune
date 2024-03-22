/* eslint-env node */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  env: {
    es6: true,
    node: true,
  },
  root: true,
  rules: {
    'no-var': 'warn', // var 금지
    eqeqeq: 'warn', // 일치 연산자 사용 필수
    'no-multiple-empty-lines': 'warn', // 여러 줄 공백 금지
    '@typescript-eslint/restrict-template-expressions': ['off'],
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-explicit-any': ['warn'],
    '@typescript-eslint/no-unsafe-assignment': ['off'],
    '@typescript-eslint/no-unsafe-member-access': ['off'],
    '@typescript-eslint/no-unsafe-call': ['off'],
    '@typescript-eslint/no-unsafe-argument': ['off'],
    '@typescript-eslint/no-useless-template-literals': 'error',
    '@typescript-eslint/no-unsafe-return': ['warn'],
    '@typescript-eslint/await-thenable': ['warn'],
    '@typescript-eslint/no-misused-promises': ['warn'],
    '@typescript-eslint/no-var-requires': ['off'],
    '@typescript-eslint/no-empty-function': ['off'],
    '@typescript-eslint/prefer-nullish-coalescing': ['warn'],
    '@typescript-eslint/prefer-for-of': ['warn'],
    '@typescript-eslint/unbound-method': ['warn'],
    semi: 'error',
  },
};
