import { html, View } from 'rune-ts';

import style from './ButtonSizeFixed.module.scss';
import { typo } from '../../../../common/typo';

const typeOptions = Object.freeze({
  white: style.type_white,
  lightBlue: style.type_lightblue,
  blue: style.type_blue,
});

export interface ButtonSizeFixedProps {
  label: string;
  type?: keyof typeof typeOptions;
}

export class ButtonSizeFixed extends View<ButtonSizeFixedProps> {
  static typeOptions = typeOptions;

  getTypeOption(): string {
    return (
      (this.data.type && ButtonSizeFixed.typeOptions[this.data.type]) ||
      ButtonSizeFixed.typeOptions.white
    );
  }

  override template() {
    return html`
      <button
        class="${typo('16_medium')} ${style.fixed_size_button} ${this.getTypeOption()}"
        type="button"
      >
        <span>${this.data.label}</span>
      </button>
    `;
  }
}
