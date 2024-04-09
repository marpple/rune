import { html, type Html, View } from 'rune-ts';

import style from './ButtonAction.module.scss';
import { typo } from '../../../../common/typo';

const typeOptions = Object.freeze({
  lightBlue: style.type_lightblue,
  blue: style.type_blue,
  disabled: style.type_disabled,
  line: style.type_line,
});

const sizeOptions = Object.freeze({
  regular: `${style.size_regular} ${typo('14_bold')}`,
  medium: `${style.size_medium} ${typo('14_bold')}`,
  large: `${style.size_large} ${typo('16_bold')}`,
});

export interface ButtonActionProps {
  label: string | Html;
  type?: keyof typeof typeOptions;
  size?: keyof typeof sizeOptions;
}

export class ButtonAction extends View<ButtonActionProps> {
  static typeOptions = typeOptions;
  static sizeOptions = sizeOptions;

  getTypeOption() {
    return (
      (this.data.type && ButtonAction.typeOptions[this.data.type]) ||
      ButtonAction.typeOptions.lightBlue
    );
  }

  getSizeOption() {
    return (
      (this.data.size && ButtonAction.sizeOptions[this.data.size]) ||
      ButtonAction.sizeOptions.regular
    );
  }

  override template() {
    return html`
      <button
        class="${style.action_button} ${this.getTypeOption()} ${this.getSizeOption()}"
        type="button"
      >
        ${this.data.label}
      </button>
    `;
  }
}
