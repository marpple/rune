/** @type {import('stylelint').Config} */
module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-scss',
    'stylelint-config-property-sort-order-smacss',
    'stylelint-config-prettier-scss',
  ],
  plugins: ['stylelint-scss', 'stylelint-prettier'],
  rules: {
    'prettier/prettier': true,
    'block-no-empty': true,
    'at-rule-no-unknown': null,
    'selector-class-pattern': [
      '^([a-z][a-zA-Z0-9]*)(__[a-z][a-zA-Z0-9]*)*(--[a-z][a-zA-Z0-9]*)?$',
      {
        message: 'BEM 네이밍 규칙을 따르고 camelCase를 사용하세요.',
        resolveNestedSelectors: true,
      },
    ],
    'max-nesting-depth': 3, // 최대 nesting은 3depth 까지
    'no-descending-specificity': null,
    'scss/at-rule-conditional-no-parentheses': null,
    // 조건부 @ 규칙(if, elsif, while)(자동 수정 가능)에서 괄호를 허용합니다.
    'import-notation': null,
  },
};
