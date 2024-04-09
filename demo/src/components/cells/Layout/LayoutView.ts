import { html, type Html, rune, View } from 'rune-ts';
import c from './layout.module.scss';
import { type FooterData, FooterView } from '../Footer/Footer';
import { html as fxHtml, isNil } from 'fxjs/es';
import { htmlIf } from '../../../../shared/utls';

export interface LayoutStates {
  is_mobile?: boolean;
  require_top_arrow_button: boolean;
  full_width: boolean;
}

interface BaseLayoutContent {
  body: Html | string;
}

type LayoutContentWithFooter = BaseLayoutContent & {
  footer: Html | string;
  footer_data?: never; // Ensuring footer_data is not present
};

type LayoutContentWithFooterData = BaseLayoutContent & {
  footer?: never; // Ensuring footer is not present
  footer_data: FooterData;
};

export type LayoutContent = LayoutContentWithFooter | LayoutContentWithFooterData;

/*
 * @dev 기존 페이지 수정 시에는 이 함수 직접 사용, 그 외 Rune 내에서 사용 시에는 Layout rune 사용하기
 */
export const makeLayoutHtml = (
  { body, footer, footer_data }: LayoutContent,
  { is_mobile, full_width, require_top_arrow_button }: LayoutStates,
  htmlFn: Html | typeof fxHtml,
) => {
  const is_rune = htmlFn === html;
  footer =
    footer ??
    htmlFn`<div class="${c.footer}">${
      is_rune ? new FooterView(footer_data) : new FooterView(footer_data).toHtmlSRR()
    }</div>`;
  const is_mobile_tmp = is_mobile; // 추후에 필요한 일 대비해서 넣고 있음

  return htmlFn`
    <div class="${c.layout} ${htmlIf(c.full_width, full_width)}">
      <div class="${c.body}">${body}</div>
      ${footer}
    </div>
  `;
};

const makeHtml = (a: LayoutContent, b: LayoutStates) => {
  return new LayoutView(a, b).toHtml();
};

// const makeTopArrowButtonTmpl = () => {
//   const component = 'ness-layout-top-arrow';
//   return html`
//     <div class="${component}">
//       <div class="${component}__upper-trigger"></div>
//       <div class="${component}__trigger"></div>
//       <span class="${component}__btn">
//         <span class="${component}__btn-icon"> </span>
//       </span>
//     </div>
//   `;
// };

export class LayoutView extends View<LayoutContent> {
  state: LayoutStates;

  constructor(data: LayoutContent, options: Partial<LayoutStates>) {
    super(data);

    this.state = {
      ...options,
      require_top_arrow_button: options.require_top_arrow_button ?? false,
      full_width: options.full_width ?? false,
    };
  }

  getIsMobile(): boolean {
    const is_mobile = rune.getSharedData(this)?.is_mobile || this.state.is_mobile;
    if (isNil(is_mobile)) throw new Error('is_mobile is not set');
    return is_mobile;
  }

  override template() {
    const is_mobile = this.getIsMobile();

    return makeLayoutHtml(this.data, { ...this.state, is_mobile }, html);
  }
}
