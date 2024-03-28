import { View } from './View';
import { Base } from './Base';

type ExtendExtraInterface<T, E> = E extends null ? T : T & E;

export abstract class BaseEnable<T extends object = object, E = null> extends Base {
  view: ExtendExtraInterface<View<T>, E>;
  data: T;

  protected constructor(view: ExtendExtraInterface<View<T>, E>) {
    super();
    this.view = view;
    this.data = view.data;
  }

  protected init(): this {
    if (this.view.isRendered()) {
      this._onMount();
    } else {
      this.view.addEventListener('view:mountend', () => this._onMount());
    }
    return this;
  }

  override _onMount() {
    const element = this._setElement(this.view.element()).element();
    element.classList.add(this.constructor.name);
    element.dataset.runeEnables = `${
      element.dataset.runeEnables ? `${element.dataset.runeEnables}, ` : ''
    } ${this.constructor.name}`;
    super._onMount();
    this.dispatchEvent(new CustomEvent('enable:mountend'));
    return this;
  }
}

export abstract class Enable<T extends object = object, E = null> extends BaseEnable<T, E> {
  constructor(view: ExtendExtraInterface<View<T>, E>) {
    super(view);
    this.init();
  }
}

export abstract class EnableWithOptions<
  T extends object = object,
  O = object,
  E = null,
> extends BaseEnable<T, E> {
  options: O;

  constructor(view: ExtendExtraInterface<View<T>, E>, options: O) {
    super(view);
    this.options = options;
    this.init();
  }
}
