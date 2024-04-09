import { html, View, type Html, $Element } from 'rune-ts';

import c from './Footer.module.scss';
import { Dropdown, DropdownChangeEvent, type DropdownOption } from '../Dropdown/Dropdown';
import {
  BlogIcon,
  country_icon_urls,
  DropdownDownIcon,
  InstagramIcon,
  MarppleLogo,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
} from '../../atoms/Icon/icons';
import { changeUrlLang, htmlIf } from '../../../../shared/utls';
import { MPS_ADDRESS } from '../../../../shared/constants';
import { getTypoRaw, type Lang } from '../../../../common/typography';
import { typo } from '../../../../common/typo';

const T = (a) => a;
T.lang = 'kr';

export interface FooterData {
  out_links: {
    marpple_corporation: string;
    customer_center: string;
    report_center: string;
    creator: string;
    plus: string;
    popup_store: string;
    marppleshop_x_youtube: string;
    terms: string;
    privacy: string;
  };
  sns: {
    youtube: string;
    instagram: string;
    twitter: string;
    naver_blog: string;
    tiktok: string;
  };
  lang: Lang;
  is_mobile: boolean;
}
export interface FooterState {
  is_info_btn_opened: boolean;
  lang_options: DropdownOption<Lang>[];
}

interface Texts {
  company_name: string;
  ceo: string;
  ceo_name: string;
  company_registration_info: string;
  company_registration_number: string;
  address_info: string;
  privacy_charge: string;
  privacy_charge_name: string;
  customer_center: string;
  customer_center_number: string;
  customer_center_info: string;
  email: string;
  email_address: string;
  inicis_info: string;
  inicis_button: string;
  notice: string;
  business_info: string;
}

type makeLayoutHtml = (texts: Texts, data: FooterData & FooterState) => Html;

const makeLangArray = (out_links: FooterData['out_links']) => {
  return [
    { name: T('마플코퍼레이션'), link: out_links.marpple_corporation },
    { name: T('고객센터'), link: out_links.marpple_corporation },
    { name: T('신고센터'), link: out_links.marpple_corporation },
    { name: T('마플샵 크리에이터'), link: out_links.marpple_corporation },
    { name: T('마플샵 플러스'), link: out_links.marpple_corporation },
    { name: T('마플샵 팝업스토어'), link: out_links.marpple_corporation },
    { name: T('마플샵 X 유튜브 쇼핑'), link: out_links.marpple_corporation },
    { name: T('이용약관'), link: out_links.marpple_corporation },
    { name: html`<b>${T('개인정보처리방침')}</b>`, link: out_links.marpple_corporation },
  ];
};

const makeLangOptionInner = (lang: Lang, name: string) => {
  return html`
    <span class="${c.dropdown_option}">
      <img class="${c.lang_icon}" src="${country_icon_urls[lang]}" />
      <span class="${typo('14_medium')}">${name}</span>
    </span>
  `;
};
const makePcHtml: makeLayoutHtml = (texts, data) => {
  const { sns } = data;
  const info_row_html = html`
    <span>${texts.company_name}</span>
    <span class="${c.info_splitter}"></span>
    <span>${texts.ceo} ${texts.ceo_name}</span>
    <span class="${c.info_splitter}"></span>
    <span>${texts.company_registration_info} ${texts.company_registration_number}</span>
    <span class="${c.info_splitter}"></span>
    ${T.lang === 'kr'
      ? html`<span>통신판매업신고번호 2021-서울금천-1710</span>
          <span class="${c.info_splitter}"></span>`
      : ''}
    <span>${texts.address_info}</span>
    <span class="${c.info_splitter}"></span>
    <span>${texts.privacy_charge} ${texts.privacy_charge_name}</span>
  `;

  return html`
    <div class="${c.footer} ${typo('12_medium')}">
      <div class="${c.section1}">
        <div class="${c.left}">
          <span class="${c.marpple_logo}">${MarppleLogo}</span>
          <nav class="${c.nav} ${typo('14_medium')}">
            ${makeLangArray(data.out_links).map(
              ({ link, name }) => html`<a href="${link}">${name}</a>`,
            )}
          </nav>
          <div class="${c.info_container}">
            <p class="${c.info_first_row}">${info_row_html}</p>
            <p>
              ${texts.inicis_info}
              <a
                href="https://mark.inicis.com/mark/escrow_popup_v3.php?mid=MOImarpple"
                class="${c.inicis_button}"
              >
                ${texts.inicis_button}</a
              >
            </p>
            <p>${texts.notice}</p>
          </div>
        </div>
        <div class="${c.right}">
          <p class="${c.customer_center_phone_row} ${typo('16_bold')}">
            <span>${texts.customer_center}</span>
            <span>${texts.customer_center_number}</span>
          </p>
          <p class="${c.customer_center_info}">
            <span>${texts.customer_center_info}</span>
            <span>${texts.email} ${texts.email_address}</span>
          </p>
          <div class="${c.sns_container}">
            ${htmlIf(
              html`<a href="${sns.youtube}" class="${c.sns_icon}">${YoutubeIcon}</a>`,
              !!sns.youtube,
            )}
            ${htmlIf(
              html`<a href="${sns.instagram}" class="${c.sns_icon}">${InstagramIcon}</a>`,
              !!sns.instagram,
            )}
            ${htmlIf(
              html`<a href="${sns.twitter}" class="${c.sns_icon}">${XIcon}</a>`,
              !!sns.twitter,
            )}
            ${htmlIf(
              html`<a href="${sns.naver_blog}" class="${c.sns_icon}">${BlogIcon}</a>`,
              !!sns.naver_blog,
            )}
            ${htmlIf(
              html`<a href="${sns.tiktok}" class="${c.sns_icon}">${TiktokIcon}</a>`,
              !!sns.tiktok,
            )}
          </div>
        </div>
      </div>
      <div class="${c.section2}">
        <span class="${getTypoRaw('unica_12_regular')}">© 2024 Marpple Corporation.</span>
        ${new Dropdown(
          { selected_option_key: data.lang, options: data.lang_options },
          {
            horizontal: 'right',
            vertical: 'top',
            klass: c.lang_dropdown,
            button_klass: c.lang_dropdown_button,
            has_arrow: true,
          },
        )}
      </div>
    </div>
  `;
};
const makeMobileHtml: makeLayoutHtml = (texts, data) => {
  const { sns } = data;
  const info_row_html = html`
    <span>${texts.company_name}</span>
    <span class="${c.info_splitter}"></span>
    <span>${texts.ceo} ${texts.ceo_name}</span>
    <span class="${c.info_splitter}"></span>
    <span>${texts.company_registration_info} ${texts.company_registration_number}</span>
    <span class="${c.info_splitter}"></span>
    ${T.lang === 'kr'
      ? html`<span>통신판매업신고번호 2021-서울금천-1710</span>
          <span class="${c.info_splitter}"></span>`
      : ''}
    <span>${texts.address_info}</span>
    <span class="${c.info_splitter}"></span>
    <span>${texts.privacy_charge} ${texts.privacy_charge_name}</span>
  `;

  return html`
    <div class="${c.footer} ${typo('14_medium')}">
      <div class="${c.section1}">
        <div class="${c.left}">
          <span class="${c.marpple_logo}">${MarppleLogo}</span>
          <nav class="${c.nav} ${typo('14_medium')}">
            ${makeLangArray(data.out_links).map(
              ({ link, name }) => html`<a href="${link}">${name}</a>`,
            )}
          </nav>
          <div
            class="${c.info_container} ${typo('12_medium')} ${htmlIf(
              c.is_opened,
              data.is_info_btn_opened,
            )}"
          >
            <button class="${c.info_open_btn} ${typo('12_bold')}">
              ${texts.company_name} ${texts.business_info}
              <span class="${c.info_open_icon}">${DropdownDownIcon}</span>
            </button>
            <p class="${c.info_first_row} ${c.info_row}">${info_row_html}</p>
            <p class="${c.info_row}">
              ${texts.inicis_info}
              <a
                href="https://mark.inicis.com/mark/escrow_popup_v3.php?mid=MOImarpple"
                class="${c.inicis_button}"
              >
                ${texts.inicis_button}</a
              >
            </p>
            <p class="${c.info_row}">${texts.notice}</p>
          </div>
        </div>
        <div class="${c.right}">
          <p class="${c.customer_center_phone_row} ${typo('16_bold')}">
            <span>${texts.customer_center}</span>
            <span>${texts.customer_center_number}</span>
          </p>
          <p class="${c.customer_center_info} ${typo('12_medium')}">
            <span>${texts.customer_center_info}</span>
            <span>${texts.email} ${texts.email_address}</span>
          </p>
          <div class="${c.sns_container}">
            ${htmlIf(
              html`<a href="${sns.youtube}" class="${c.sns_icon}">${YoutubeIcon}</a>`,
              !!sns.youtube,
            )}
            ${htmlIf(
              html`<a href="${sns.instagram}" class="${c.sns_icon}">${InstagramIcon}</a>`,
              !!sns.instagram,
            )}
            ${htmlIf(
              html`<a href="${sns.twitter}" class="${c.sns_icon}">${XIcon}</a>`,
              !!sns.twitter,
            )}
            ${htmlIf(
              html`<a href="${sns.naver_blog}" class="${c.sns_icon}">${BlogIcon}</a>`,
              !!sns.naver_blog,
            )}
            ${htmlIf(
              html`<a href="${sns.tiktok}" class="${c.sns_icon}">${TiktokIcon}</a>`,
              !!sns.tiktok,
            )}
          </div>
        </div>
      </div>
      <div class="${c.section2}">
        <span class="${getTypoRaw('unica_12_regular')}">© 2024 Marpple Corporation.</span>
        ${new Dropdown(
          { selected_option_key: data.lang, options: data.lang_options },
          {
            horizontal: 'right',
            vertical: 'top',
            klass: c.lang_dropdown,
            button_klass: c.lang_dropdown_button,
            has_arrow: true,
          },
        )}
      </div>
    </div>
  `;
};

export class FooterView extends View<FooterData> {
  state: FooterState = {
    is_info_btn_opened: false,
    lang_options: [
      {
        key: 'kr',
        value: 'kr',
        name: makeLangOptionInner('kr', '한국어'),
      },
      { key: 'en', value: 'en', name: makeLangOptionInner('en', 'English') },
      { key: 'jp', value: 'jp', name: makeLangOptionInner('jp', '日本語') },
    ],
  };

  override onMount() {
    this.delegate(DropdownChangeEvent<Lang>, Dropdown, (e, b) => {
      if (!e.detail.option) return;
      location.href = changeUrlLang(location.href, e.detail.option.value);
    });

    new $Element(this.element()).delegate('click', `.${c.info_open_btn}`, (e) => {
      this.state.is_info_btn_opened = !this.state.is_info_btn_opened;
      const container_el = (e.currentTarget as HTMLElement)?.closest(`.${c.info_container}`);
      if (!container_el) return;

      container_el.classList.toggle(c.is_opened);
    });
  }

  override template() {
    const texts = {
      company_name: T('(주)마플코퍼레이션'),
      ceo: T('대표'),
      ceo_name: T('박혜윤'),
      company_registration_info: T('사업자등록번호'),
      company_registration_number: T('105-88-13322'),
      address_info: MPS_ADDRESS,
      privacy_charge: T('개인정보호책임자'),
      privacy_charge_name: T('유인동'),
      //
      customer_center: '고객센터',
      customer_center_number: '1566-5496',
      customer_center_info: '평일 10:00 ~ 18:00 (토・일・공휴일 휴무)',

      email: '이메일',
      email_address: 'cs@marppleshop.com',
      //
      inicis_info:
        'KG이니시스를 통해 현금 결제 시 당사에서 가입한 구매안전서비스를 이용할 수 있습니다.',
      inicis_button: 'KG이니시스 가입 확인',
      notice:
        '크리에이터 상품의 경우 (주)마플코퍼레이션은 통신판매중개자로서 통신판매의 당사자가 아니며 상품, 거래정보, 거래에 대하여 책임을 지지 않습니다.',
      business_info: T('사업자정보'),
    };

    console.log('footer', { is_mobile: this.data.is_mobile });

    return this.data.is_mobile
      ? makeMobileHtml(texts, { ...this.data, ...this.state })
      : makePcHtml(texts, { ...this.data, ...this.state });
  }
}
