import { html, View } from 'rune-ts';

import style from './ButtonOutline.module.scss';
import { typo } from '../../../../common/typo';

export interface ButtonOutlineProps {
  label: string;
  is_selected: boolean;
}

export class ButtonOutline extends View<ButtonOutlineProps> {
  getSelectedStatus(): boolean {
    return this.data.is_selected;
  }

  override template() {
    return html`
      <button
        class="${typo('14_medium')} ${style.button_outline} ${this.data.is_selected
          ? style.is_selected
          : ''}"
        type="button"
      >
        <span>${this.data.label}</span>
      </button>
    `;
  }
}
