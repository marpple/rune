import { html, on, View } from 'rune-ts';
import bannerClass from './MainBanner.module.scss';
import { staticTypo, typo } from '../../../../common/typo';
import { ButtonAction, type ButtonActionProps } from '../../atoms/ButtonAction/ButtonAction';
import { arrowIcon } from '../../atoms/Icon/icons';
import { dataStr } from '../../../shared/lib/dataStr';
import { SwiperEvent, SwiperView } from '../Swiper/Swiper';
import { ButtonArrow } from '../../atoms/ButtonArrow/ButtonArrow';

interface BannerImageData {
  url: string;
  banner_background: string;
}

interface BannerInformationData {
  category: string;
  content_number: number;
  title: string;
  description: string;
  navigate: object;
  target: '_self' | '_blank';
  button: ButtonActionProps;
}

interface BannerData extends BannerImageData {
  information: BannerInformationData;
}

interface BannerControllerData {
  pagination: {
    current_index: number;
    max_index: number;
  };

  navigation: {
    prev_enable: boolean;
    next_enable: boolean;
  };
}

class MainBannerInformationView extends View<BannerData['information']> {
  override template() {
    const { category, content_number, title, description, navigate, target, button } = this.data;

    return html`
      <div class="${bannerClass.information}">
        <div class="${bannerClass.contents}">
          <span class="${staticTypo('unica_16_medium')}">${category} #${content_number}</span>
          <h3 class="${typo('48_bold')}">${html.preventEscape(title)}</h3>
          <span class="${typo('16_medium')}">${html.preventEscape(description)}</span>
        </div>
        <a
          class="${bannerClass.button}"
          data-post-message="${dataStr(navigate)}"
          target="${target}"
        >
          ${new ButtonAction({
            ...button,
            label: html`${button.label} <span class="${bannerClass.arrow}">${arrowIcon}</span>`,
          })}
        </a>
      </div>
    `;
  }
}

class MainBannerImageView extends View<BannerData> {
  protected override template() {
    const { url } = this.data;

    return html`<img class="${bannerClass.image}" src="${url}" alt="" />`;
  }
}

class MainBannerNavigationView extends View<BannerControllerData['navigation']> {
  override template() {
    const navigation = this.data;
    return html`<div class="navigation ${bannerClass.navigation}">
      ${navigation.prev_enable ? new ButtonArrow({ direction: 'left', type: 'bright' }) : ''}
      ${navigation.next_enable ? new ButtonArrow({ direction: 'right', type: 'bright' }) : ''}
    </div>`;
  }

  protected override onMount() {
    this.delegate('click', ButtonArrow, (e, targetView) => {
      console.log(targetView);
    });
  }
}

export class NavigateNextEvent extends CustomEvent<{
  navigation: MainBannerNavigationView;
  direction: 'next';
}> {}
export class NavigatePrevEvent extends CustomEvent<{
  navigation: MainBannerNavigationView;
  direction: 'prev';
}> {}

class MainBannerControllerView extends View<BannerControllerData> {
  navigation?: MainBannerNavigationView;

  protected override template() {
    const { pagination, navigation } = this.data;

    this.navigation = new MainBannerNavigationView(navigation);

    return html`<div class="${bannerClass.controller}">
      ${pagination.max_index ? this.makePaginationTemplate() : ''} ${this.navigation}
    </div>`;
  }

  makePaginationTemplate() {
    const pagination = this.data.pagination;
    return html`<div class="pagination ${bannerClass.pagination} ${staticTypo('bebas_16_bold')}">
      <span class="current_index">
        ${pagination.current_index + 1 < 10 ? '0' : ''} ${pagination.current_index + 1}
      </span>
      <div class="${bannerClass.pages}">
        <div
          class="progress ${bannerClass.page}"
          style="width: ${((pagination.current_index + 1) / (pagination.max_index + 1)) * 100}%;"
        ></div>
      </div>
      <span> ${pagination.max_index + 1 < 10 ? '0' : ''} ${pagination.max_index + 1} </span>
    </div>`;
  }

  setNavigationData() {
    if (this.navigation) {
      this.navigation.data = {
        ...this.navigation.data,
        ...this.data.navigation,
      };
    }
  }

  override redraw(): this {
    if (this.navigation) {
      this.navigation.redraw();
    }
    return this;
  }
}

export class MainBannerView extends View<BannerData[]> {
  informationView: MainBannerInformationView;
  controllerView: MainBannerControllerView;

  constructor(data: BannerData[]) {
    super(data);

    const current_index = 0;

    const initial_banner = data[current_index];
    this.informationView = new MainBannerInformationView(initial_banner.information);
    this.controllerView = new MainBannerControllerView({
      pagination: {
        current_index,
        max_index: data.length - 1,
      },
      navigation: {
        prev_enable: true,
        next_enable: data.length > 1,
      },
    });
  }

  protected override template() {
    return html` <div class="${bannerClass.banner}">
      ${this.informationView} ${this.controllerView}
      ${new SwiperView(
        { observe: true, loop: true },
        {
          swiper: bannerClass.swiper,
          wrapper: bannerClass.wrapper,
        },
        MainBannerImageView,
        this.data,
      )}
    </div>`;
  }

  @on(SwiperEvent)
  swiperHandler(e: SwiperEvent) {
    console.log(e.detail.swiper);
  }

  @on(NavigateNextEvent)
  @on(NavigatePrevEvent)
  navigationHandler(e: NavigateNextEvent | NavigatePrevEvent) {
    console.log(e.detail.navigation);
  }
}
