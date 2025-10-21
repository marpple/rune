import { html, View } from 'rune-ts';

import style from './ButtonArrow.module.scss';
import { arrowIcon } from '../Icon/icons';

const typeOptions = Object.freeze({
  bright: style.type_bright,
  dim: style.type_dim,
});

export interface ButtonArrowProps {
  type?: keyof typeof typeOptions;
  direction?: 'left' | 'right';
}

export class ButtonArrow extends View<ButtonArrowProps> {
  static typeOptions = typeOptions;

  getTypeOption(): string {
    return (
      (this.data.type && ButtonArrow.typeOptions[this.data.type]) || ButtonArrow.typeOptions.bright
    );
  }

  override template() {
    return html`
      <button
        class="${style.button_arrow} ${this.getTypeOption()} ${this.data.direction} ${this.data
          .direction === 'left'
          ? style.left
          : ''}"
        type="button"
      >
        <span class="${style.arrow}">${arrowIcon}</span>
      </button>
    `;
  }
}
