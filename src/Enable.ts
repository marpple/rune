import { $, type DelegateEventHandler } from './$Element/$Element';
import { View } from './View';

export abstract class BaseEnable {
  element(): HTMLElement {
    throw TypeError('');
  }

  private static _listeners = new WeakMap<any, any>();

  _makeListener<K extends keyof HTMLElementEventMap, S>(
    listener: (this: S, ev: HTMLElementEventMap[K], enable: S) => any,
  ): EventListenerOrEventListenerObject {
    if (BaseEnable._listeners.get(listener)) {
      return BaseEnable._listeners.get(listener);
    } else {
      const Constructor = this.constructor;
      const listenerForBaseEnable: (
        this: HTMLElement,
        ev: HTMLElementEventMap[K],
      ) => any = function (e) {
        const enable = BaseEnable.fromElement(this, Constructor) as S;
        listener.call(enable, e, enable);
      };
      BaseEnable._listeners.set(listener, listenerForBaseEnable);
      return listenerForBaseEnable as EventListenerOrEventListenerObject;
    }
  }

  addEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: (this: this, ev: HTMLElementEventMap[K], enable?: this) => any,
    options?: boolean | AddEventListenerOptions,
  );

  addEventListener(
    type: string,
    listener: (this: this, ev: Event, enable?: this) => any,
    options?: boolean | AddEventListenerOptions,
  );

  addEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K | string,
    listener:
      | ((this: this, ev: HTMLElementEventMap[K], enable?: this) => any)
      | ((this: this, ev: Event, enable?: this) => any),
    options?: boolean | AddEventListenerOptions,
  ): this {
    this.element().addEventListener(
      eventType,
      this._makeListener<K, this>(listener),
      options,
    );
    return this;
  }

  removeEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: (this: this, ev: HTMLElementEventMap[K], enable?: this) => any,
    options?: boolean | EventListenerOptions,
  ): this {
    this.element().removeEventListener(
      eventType,
      this._makeListener(listener),
      options,
    );
    return this;
  }

  _makeDelegateListener<K extends keyof HTMLElementEventMap, S>(
    listener: (this: S, ev: HTMLElementEventMap[K], enable?: S) => void,
  ): DelegateEventHandler<K> {
    if (BaseEnable._listeners.get(listener)) {
      return BaseEnable._listeners.get(listener);
    } else {
      const Constructor = this.constructor;
      const listenerForBaseEnable: DelegateEventHandler<K> = function (e) {
        const enable = BaseEnable.fromElement(this, Constructor) as S;
        listener.call(enable, e, enable);
      };
      BaseEnable._listeners.set(listener, listenerForBaseEnable);
      return listenerForBaseEnable;
    }
  }

  delegate<K extends keyof HTMLElementEventMap>(
    event: K | string,
    selector: string,
    listener: (this: this, e: HTMLElementEventMap[K], enable?: this) => void,
  ): this {
    $(this.element()).delegate(
      event,
      selector,
      this._makeDelegateListener<K, this>(listener),
    );
    return this;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  dispatchEvent(event: Event): this {
    this.element().dispatchEvent(event);
    return this;
  }

  toString() {
    return this.constructor.name;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  private static _paired = new WeakMap<
    HTMLElement | EventTarget,
    Map<any, BaseEnable>
  >();

  protected _pairing() {
    const map = (BaseEnable._paired.get(this.element()) ??
      BaseEnable._paired.set(this.element(), new Map()).get(this.element()))!;
    map.set(this.constructor, this);
  }

  static fromElement(
    element: HTMLElement | EventTarget,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    Constructor: any,
  ): BaseEnable | undefined {
    return BaseEnable._paired.get(element)?.get(Constructor);
  }

  static toString() {
    return this.name;
  }
}

type ViewExtraInterface<T, E> = E extends null ? T : T & E;

export abstract class Enable<T, E = null> extends BaseEnable {
  view: ViewExtraInterface<View<T>, E>;
  data: T;

  constructor(view: ViewExtraInterface<View<T>, E>) {
    super();
    this.view = view;
    this.data = view.data;
    this.view.addEventListener('view:mountend', () => this._onMount());
  }

  private _onMount() {
    const element = this.view.element();
    element.classList.add(this.constructor.name);
    element.dataset.runeEnables = `${
      element.dataset.runeEnables ? `${element.dataset.runeEnables}, ` : ''
    } ${this.constructor.name}`;
    this._pairing();
    this.onMount();
    return this;
  }

  onMount() {}

  override element(): HTMLElement {
    return this.view.element();
  }
}

export class ListEnable<T> extends Enable<T[]> {}
