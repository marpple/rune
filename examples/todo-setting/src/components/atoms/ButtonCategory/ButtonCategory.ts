import { html, View, type Html } from 'rune-ts';

import style from './ButtonCategory.module.scss';
import { typo } from '../../../../common/typo';

export interface ButtonCategoryProps {
  label: string | Html;
  isActive?: boolean;
}

export class ButtonCategory extends View<ButtonCategoryProps> {
  isActive() {
    return this.data.isActive ? style.active : style.default;
  }

  override template() {
    return html`
      <button class="${style.category_button} ${this.isActive()}" type="button">
        <span class="${style.text} ${typo('14_medium')}"> ${this.data.label} </span>
        <span class="${style.bold} ${typo('14_bold')}"> ${this.data.label} </span>
      </button>
    `;
  }
}
