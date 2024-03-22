import { View } from './View';

export class Page<T extends object> extends View<T> {
  override hydrateFromSSR(): this {
    return super.hydrateFromSSR(
      document.querySelector(`body [data-rune="${this}"]`)!,
    );
  }
}
