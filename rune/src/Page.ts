import { View } from './View';

export class Page<T extends object> extends View<T> {
  constructor(
    data: T,
    public sharedData?: Record<string, any>,
  ) {
    super(data);
  }

  override hydrateFromSSR(): this {
    return super.hydrateFromSSR(document.querySelector(`body [data-rune="${this}"]`)!);
  }
}
