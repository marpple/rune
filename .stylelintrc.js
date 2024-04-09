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
    'selector-class-pattern': null,
    'max-nesting-depth': 4, // 최대 nesting은 4depth 까지
    'no-descending-specificity': null,
    'scss/at-rule-conditional-no-parentheses': null,
    // 조건부 @ 규칙(if, elsif, while)(자동 수정 가능)에서 괄호를 허용합니다.
    'import-notation': null,
    'no-empty-source': null,
  },
};
