import { View } from './View';
import { $ } from './$Element';

export class Page<T extends object> extends View<T> {
  constructor(
    data: T,
    public sharedData?: Record<string, any>,
  ) {
    super(data);
  }

  static override createAndHydrate(element: HTMLElement) {
    const dataEl = $(element).next(`script.__RUNE_DATA__.${this.name}`);
    if (dataEl === null) {
      throw new Error('No __RUNE_DATA__ script found');
    } else {
      const hydration_data = JSON.parse(dataEl.getTextContent() ?? '{}');
      dataEl.remove();
      return new this(hydration_data.data, hydration_data.sharedData).hydrateFromSSR(element);
    }
  }
}
