import { html, View } from 'rune-ts';

import { minusIcon, plusIcon } from '../Icon/icons';

import style from './ButtonAmount.module.scss';

export interface ButtonAmountProps {
  isPlus: boolean;
}

export class ButtonAmount extends View<ButtonAmountProps> {
  constructor(
    data: ButtonAmountProps = {
      isPlus: true,
    },
  ) {
    super(data);
  }

  override template() {
    return html`
      <button class="${style.amount_button}" type="button">
        ${this.data.isPlus ? plusIcon : minusIcon}
      </button>
    `;
  }
}
