import { $, html, on, View } from 'rune-ts';
import bannerClass from './MainBanner.module.scss';
import { staticTypo, typo } from '../../../../common/typo';
import { ButtonAction, type ButtonActionProps } from '../../atoms/ButtonAction/ButtonAction';
import { arrowIcon } from '../../atoms/Icon/icons';
import { dataStr } from '../../../shared/lib/dataStr';
import { SwiperChangeEvent, SwiperView } from '../Swiper/Swiper';
import { ButtonArrow } from '../../atoms/ButtonArrow/ButtonArrow';
import anime from 'animejs';

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
  href: string;
  target: '_self' | '_blank';
  button: ButtonActionProps;
}

export interface BannerData extends BannerImageData {
  information: BannerInformationData;
}

interface BannerPaginationData {
  current_index: number;
  max_index: number;
}

interface BannerNavigationData {
  prev_enable: boolean;
  next_enable: boolean;
}

class MainBannerInformationView extends View<{
  information: BannerInformationData;
  active: boolean;
}> {
  deactivateAnime?: anime.AnimeInstance;
  activateAnime?: anime.AnimeInstance;

  override template() {
    const { category, content_number, title, description, navigate, target, href, button } =
      this.data.information;

    return html`
      <div
        class="${this.data.active
          ? bannerClass.active
          : bannerClass.deactivate} ${bannerClass.information}"
      >
        <div class="${bannerClass.contents}">
          <span class="${staticTypo('unica_16_medium')}">${category} #${content_number}</span>
          <h3 class="${typo('48_bold')}">${html.preventEscape(title)}</h3>
          <span class="${typo('16_medium')}">${html.preventEscape(description)}</span>
        </div>
        <a
          class="${bannerClass.button}"
          data-post-message="${dataStr(navigate)}"
          target="${target}"
          href="${html.preventEscape(href)}"
        >
          ${new ButtonAction({
            ...button,
            label: html`${button.label} <span class="${bannerClass.arrow}">${arrowIcon}</span>`,
          })}
        </a>
      </div>
    `;
  }

  activate() {
    if (this.deactivateAnime && !this.deactivateAnime?.paused) {
      this.deactivateAnime?.pause();
    }

    const el = this.element();
    $(el).removeClass(bannerClass.deactivate);

    if (this.activateAnime) {
      this.activateAnime.restart();
      return;
    }

    this.activateAnime = anime({
      targets: el,
      opacity: 1,
      duration: 1000,
      easing: 'easeInOutQuad',
      complete: () => {
        $(el).addClass(bannerClass.active);
        el.style.opacity = '';
      },
    });
  }

  deactivate() {
    if (this.activateAnime && !this.activateAnime?.paused) {
      this.activateAnime?.pause();
    }

    if (this.deactivateAnime) {
      this.deactivateAnime.restart();
      return;
    }

    const el = this.element();

    this.deactivateAnime = anime({
      targets: el,
      opacity: 0,
      duration: 1000,
      easing: 'easeInOutQuad',
      complete: () => {
        $(el).addClass(bannerClass.deactivate).removeClass(bannerClass.active);
      },
    });
  }
}

class MainBannerImageView extends View<BannerData> {
  protected override template() {
    const {
      url,
      information: { navigate, href, target },
    } = this.data;

    return html`
      <a
        class="${bannerClass.image_wrapper}"
        data-post-message="${dataStr(navigate)}"
        href="${html.preventEscape(href)}"
        target="${target}"
      >
        <img class="${bannerClass.image}" src="${url}" alt="" />
      </a>
    `;
  }
}

class MainBannerNavigationView extends View<BannerNavigationData> {
  override template() {
    const navigation = this.data;
    return html`<div class="navigation ${bannerClass.navigation}">
      ${navigation.prev_enable ? new ButtonArrow({ direction: 'left', type: 'bright' }) : ''}
      ${navigation.next_enable ? new ButtonArrow({ direction: 'right', type: 'bright' }) : ''}
    </div>`;
  }

  protected override onMount() {
    this.delegate('click', ButtonArrow, (e, targetView) => {
      this.dispatchEvent(NavigateHandleEvent, {
        bubbles: true,
        detail: {
          direction: targetView.data.direction === 'left' ? 'prev' : 'next',
        },
      });
    });
  }
}

class NavigateHandleEvent extends CustomEvent<{
  direction: 'prev' | 'next';
}> {}

class MainBannerPaginationView extends View<BannerPaginationData> {
  protected override template() {
    const pagination = this.data;

    return html`<div class="pagination ${bannerClass.pagination} ${staticTypo('bebas_16_bold')}">
      <span class="current_index"> ${this.calcIndex(pagination.current_index)} </span>
      <div class="${bannerClass.pages}">
        <div class="progress ${bannerClass.page}" style="width: ${this.calcProgress()}%;"></div>
      </div>
      <span> ${this.calcIndex(pagination.max_index)} </span>
    </div>`;
  }

  calcIndex(index: number) {
    return `${index + 1 < 10 ? '0' : ''}${index + 1}`;
  }

  calcProgress() {
    const pagination = this.data;

    return ((pagination.current_index + 1) / (pagination.max_index + 1)) * 100;
  }

  setCurrentIndex(index: number) {
    this.data.current_index = index;
  }

  override redraw(): this {
    const pagination = this.data;
    $(this.element())
      .find('.current_index')
      ?.setInnerHtml(this.calcIndex(pagination.current_index));
    const progress = $(this.element()).find('.progress')?.element();
    if (progress) {
      progress.style.width = `${this.calcProgress()}%`;
    }

    return this;
  }
}

export class MainBannerView extends View<BannerData[]> {
  informationViews: MainBannerInformationView[];
  paginationView: MainBannerPaginationView;
  navigationView: MainBannerNavigationView;
  swiperView: SwiperView<BannerData, typeof MainBannerImageView>;

  constructor(data: BannerData[]) {
    super(data);

    const current_index = 0;

    this.informationViews = data.map(
      (banner, index) =>
        new MainBannerInformationView({ ...banner, active: index === current_index }),
    );
    this.paginationView = new MainBannerPaginationView({
      current_index,
      max_index: data.length - 1,
    });
    this.navigationView = new MainBannerNavigationView({
      prev_enable: data.length > 1,
      next_enable: data.length > 1,
    });
    this.swiperView = new SwiperView(
      {
        loop: data.length > 1,
        speed: 800,
        autoplay: {
          delay: 6000,
          pauseOnMouseEnter: true,
          waitForTransition: true,
        },
      },
      {
        swiper: bannerClass.swiper,
        wrapper: bannerClass.wrapper,
      },
      MainBannerImageView,
      [...data],
    );
  }

  protected override template() {
    return html` <div class="${bannerClass.banner}">
      ${this.informationViews}
      <div class="${bannerClass.controller}">
        ${this.data.length > 1 ? this.paginationView : ''} ${this.navigationView}
      </div>
      ${this.swiperView}
    </div>`;
  }

  @on(SwiperChangeEvent)
  swiperHandler(e: SwiperChangeEvent) {
    const { current_index, previous_index } = e.detail;
    this.paginationView.setCurrentIndex(current_index);
    this.paginationView.redraw();
    this.informationViews[previous_index].deactivate();
    this.informationViews[current_index].activate();
  }

  @on(NavigateHandleEvent)
  navigationHandler(e: NavigateHandleEvent) {
    this.swiperView[e.detail.direction]();
  }
}
