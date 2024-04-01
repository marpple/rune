import { View } from './View';
import { Base } from './Base';

export abstract class Enable<T extends object = object> extends Base {
  constructor(public view: View<T>) {
    super();
    if (this.view.isRendered()) {
      this._onMount();
    } else {
      this.view.addEventListener('view:mountend', () => this._onMount());
    }
  }

  get data() {
    return this.view.data;
  }

  set data(data: T) {
    throw TypeError("'data' property is readonly.");
  }

  override _onMount() {
    this._setElement(this.view.element()).element();
    return super._onMount();
  }
}
