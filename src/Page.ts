import { View } from './View';
import { Layout } from './Layout';

export class Page<T extends object> extends View<T> {
  layout: Layout<object> | null = null;

  override hydrateFromSSR(): this {
    return super.hydrateFromSSR(
      document.querySelector(`body [data-rune="${this}"]`)!,
    );
  }
}
