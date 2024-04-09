import { View, html } from 'rune-ts';
import Swiper from 'swiper';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { SwiperEvents } from 'swiper/types/swiper-events';
import type { AutoplayOptions } from 'swiper/types/modules/autoplay';
import type { NavigationOptions } from 'swiper/types/modules/navigation';
import type { PaginationOptions } from 'swiper/types/modules/pagination';
import { isUndefined } from '@fxts/core';

export class SwiperEvent extends CustomEvent<{ swiper: Swiper; eventType: keyof SwiperEvents }> {}

export interface SwiperStyleType {
  swiper: string;
  wrapper: string;
}

export interface SwiperOptionType {
  observe?: boolean;
  loop?: boolean;
  autoplay?: AutoplayOptions | boolean;
  navigation?: NavigationOptions;
  pagination?: PaginationOptions;
}

export class SwiperView<T extends object, S extends typeof View<T>> extends View<T[]> {
  constructor(
    public options: SwiperOptionType,
    public styles: SwiperStyleType,
    public SlideView: S,
    data: T[],
  ) {
    super(data);
  }

  override template() {
    const { swiper, wrapper } = this.styles;
    const slide_views = this.data.map((data) => new this.SlideView(data));

    return html`
      <div class="${swiper}">
        <div class="${this + 'Wrapper'} ${wrapper}">${slide_views}</div>
      </div>
    `;
  }

  protected override onMount() {
    const { observe, loop, autoplay } = this.options;

    const swiper = new Swiper(this.element(), {
      modules: [Pagination, Navigation, Autoplay],
      speed: 1000,
      wrapperClass: this + 'Wrapper',
      slideClass: this.SlideView.toString(),
      slideActiveClass: this.SlideView + 'Active',
      slideVisibleClass: this.SlideView + 'Visible',
      slideFullyVisibleClass: this.SlideView + 'FullyVisible',
      slideBlankClass: this.SlideView + 'Blank',
      slideNextClass: this.SlideView + 'Next',
      slidePrevClass: this.SlideView + 'Prev',
      resizeObserver: observe,
      observer: observe,
      loop,
      autoplay: !isUndefined(autoplay)
        ? autoplay
        : {
            delay: 5000,
            pauseOnMouseEnter: true,
            waitForTransition: true,
          },
    });

    swiper.on('slideChange', () => {
      this.dispatchEvent(SwiperEvent, {
        bubbles: true,
        detail: { swiper, eventType: 'slideChange' },
      });
    });

    swiper.on('beforeTransitionStart', () => {
      this.dispatchEvent(SwiperEvent, {
        bubbles: true,
        detail: { swiper, eventType: 'beforeTransitionStart' },
      });
    });
  }
}
