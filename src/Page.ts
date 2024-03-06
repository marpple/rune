import { View } from './View';
import { Layout } from './Layout';

export class Page<T> extends View<T> {
  layout: Layout<unknown> | null = null;

  override hydrateFromSSR(): this {
    return super.hydrateFromSSR(
      document.querySelector(
        `body [data-rune-view="${this.constructor.name}"]`,
      )!,
    );
  }
}
