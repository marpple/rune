import { html, View } from 'rune-ts';
import klass from './Header.module.scss';
import { HeaderSearchBar } from '../HeaderSearchBar/HeaderSearchBar';
import { htmlIf } from '../../../../shared/utls';
import { type AnchorTarget } from '../../../shared/type/global';
import { getTypoRaw } from '../../../../common/typography';
import { CartFillIcon, HeartFillIcon, MarppleTextLogo, UserFillIcon } from '../../atoms/Icon/icons';

export interface Menu {
  name: string;
  url: string;
  target?: AnchorTarget;
}

export interface HeaderData {
  menus: Menu[];
}

export interface HeaderState {
  transparent: boolean;
}

export class Header extends View<HeaderData> {
  state: HeaderState;

  constructor(data, options: HeaderState) {
    super(data);

    this.state = {
      ...options,
    };
  }

  override template() {
    const { menus } = this.data;

    const container_classes = `${klass.header} ${htmlIf(klass.transparent, this.state.transparent)}`;

    return html`<div class="${container_classes}">
      <div class="${klass.content}">
        <span class="${klass.logo_wrapper}">${MarppleTextLogo}</span>
        <div class="${klass.menu_container}">
          ${menus.map(
            (menu) =>
              html`<a
                href="${menu.url}"
                target="${menu.target || '_self'}"
                class="${getTypoRaw('unica_16_medium')}"
                >${menu.name}</a
              >`,
          )}
        </div>
        <div class="${klass.search_bar_container}">
          ${new HeaderSearchBar({
            placeholder: '올해도 여전히 자유로운 새소년 시즌 그리팅',
            transparent: this.state.transparent,
          })}
        </div>
        <div class="${klass.icons}">
          <span class="${klass.icon}">${HeartFillIcon}</span>
          <span class="${klass.icon}">${CartFillIcon}</span>
          <span class="${klass.icon}">${UserFillIcon}</span>
        </div>
      </div>
    </div> `;
  }
}
