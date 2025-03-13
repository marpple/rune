import { type View } from './View';
import { Base } from './Base';
import { ViewMounted, ViewRendered, ViewUnmounted } from './ViewEvent';

/**
 * @deprecated
 * This class has been deprecated since v0.9.0 and will be removed in a future release.
 * It shouldn’t be used in new projects.
 */
export abstract class Enable<T extends object = object> extends Base {
  constructor(public view: View<T>) {
    super();
    if (this.view.isRendered()) {
      this._onRender();
      if (document.body.contains(this.view.element())) {
        this._onMount();
      }
    } else {
      this.view.addEventListener(ViewRendered, () => this._onRender());
    }
    this.view.addEventListener(ViewMounted, () => this._onMount());
    this.view.addEventListener(ViewUnmounted, () => this._onUnmount());

    console.warn(
      '[DEPRECATED] Enable class has been deprecated since v0.9.0 and will be removed in a future release. It shouldn’t be used in new projects.',
    );
  }

  get data() {
    return this.view.data;
  }

  set data(data: T) {
    throw TypeError("'data' property is readonly.");
  }

  protected override _onRender() {
    this._setElement(this.view.element()).element();
    return super._onRender();
  }
}
