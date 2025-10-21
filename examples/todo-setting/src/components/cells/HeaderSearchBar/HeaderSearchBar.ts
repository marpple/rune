import { html, View } from 'rune-ts';
import klass from './HeaderSearchBar.module.scss';
import { htmlIf } from '../../../../shared/utls';
import { typo } from '../../../../common/typo';
import { SearchIcon } from '../../atoms/Icon/icons';

export interface HeaderSearchBarProps {
  placeholder: string;
  transparent?: boolean;
}

export class HeaderSearchBar extends View<HeaderSearchBarProps> {
  override template() {
    return html`<div
      class="${klass.header_search_bar} ${typo('14_medium')} ${htmlIf(
        klass.transparent,
        !!this.data.transparent,
      )}"
    >
      <input class="${klass.input}" type="text" placeholder="${this.data.placeholder}" />
      <span class="${klass.search_icon}">${SearchIcon}</span>
    </div> `;
  }
}
