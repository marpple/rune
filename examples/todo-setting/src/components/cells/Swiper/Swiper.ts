import { View, html } from 'rune-ts';
import Swiper from 'swiper';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import { isUndefined } from '@fxts/core';
import type { SwiperOptions } from 'swiper/types/swiper-options';

export class SwiperChangeEvent extends CustomEvent<{
  swiper: Swiper;
  current_index: number;
  previous_index: number;
}> {}

export interface SwiperStyleType {
  swiper: string;
  wrapper: string;
}

export class SwiperView<T extends object, S extends typeof View<T>> extends View<T[]> {
  swiper?: Swiper;

  constructor(
    public options: SwiperOptions,
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
      resizeObserver: true,
      observer: true,
      autoplay: !isUndefined(this.options.autoplay)
        ? this.options.autoplay
        : {
            delay: 5000,
            pauseOnMouseEnter: true,
            waitForTransition: true,
          },
      ...this.options,
    });

    let previous_index = swiper.realIndex;

    swiper.on('realIndexChange', (swiper) => {
      if (previous_index === swiper.realIndex) return;
      this.dispatchEvent(SwiperChangeEvent, {
        bubbles: true,
        detail: { swiper, current_index: swiper.realIndex, previous_index },
      });
      previous_index = swiper.realIndex;
    });

    this.swiper = swiper;
  }

  next() {
    if (this.swiper) {
      this.swiper.slideNext();
    }
  }

  prev() {
    if (this.swiper) {
      this.swiper.slidePrev();
    }
  }
}
