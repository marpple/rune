import type { CustomEventInitFromClass } from './CustomEventWithDetail';
import { eventHelper } from './EventHelper';
import { _camelToColonSeparated } from './lib/_camelToColonSeparated';
import { rune } from './rune';

export abstract class Base {
  protected _element?: HTMLElement;
  private _tempElId?: string;

  protected onRender() {}
  protected onMount() {}
  protected onUnmount() {}

  protected _onRender(): this {
    const el = this.element();
    rune.set(el, this);
    eventHelper.addDecoratedListeners(this, el);
    this.onRender();
    eventHelper.addReservedListener(this, el);
    return this;
  }

  protected _onMount(): this {
    this.onMount();
    return this;
  }

  protected _onUnmount(): this {
    this.onUnmount();
    return this;
  }

  protected _setElement(element: HTMLElement): this {
    this._element = element;
    return this;
  }

  element(): HTMLElement {
    if (!this._element) {
      throw new TypeError("element is not created. call 'view.render' or 'view.hydrateFromSSR'.");
    }
    return this._element;
  }

  isRendered(): boolean {
    return !!this._element;
  }

  chain(f: (view: this) => void): this {
    f(this);
    return this;
  }

  async chainAsync(f: (view: this) => Promise<void>): Promise<this> {
    await f(this);
    return this;
  }

  safely(f: (view: this) => void): this {
    return this.isRendered() ? this.chain(f) : this;
  }

  async safelyAsync(f: (view: this) => Promise<void>): Promise<this> {
    return this.isRendered() ? this.chainAsync(f) : this;
  }

  protected _getElId(): string {
    const el = this.element();
    if (el.id) return el.id;

    if (!this._tempElId) {
      this._tempElId = `rune-temp-id-${crypto.randomUUID()}`;
      el.id = this._tempElId;
    }
    return el.id;
  }

  protected _removeTempElId(): this {
    if (this._tempElId && this._element?.id === this._tempElId) {
      this._element.removeAttribute('id');
    }
    this._tempElId = undefined;
    return this;
  }

  addEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: (this: this, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): this {
    eventHelper.addEventListener(this, this.element(), eventType, listener, options);
    return this;
  }

  removeEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: (this: this, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): this {
    eventHelper.removeEventListener(this, this.element(), eventType, listener, options);
    return this;
  }

  delegate<K extends keyof HTMLElementEventMap>(
    eventType: K,
    selector: string,
    listener: (
      this: this,
      e: HTMLElementEventMap[K] & { originalEvent: HTMLElementEventMap[K] },
    ) => void,
  ): this {
    eventHelper.delegate(this, this.element(), eventType, selector, listener);
    return this;
  }

  private _createCustomEvent<
    T extends new (...args: any[]) => Event,
    U extends CustomEventInitFromClass<T>,
  >(EventClass: T, options: U): InstanceType<T> {
    return new EventClass(_camelToColonSeparated(EventClass.name), options) as InstanceType<T>;
  }

  dispatchEvent(event: Event): this;
  dispatchEvent<T extends new (...args: any[]) => Event, U extends CustomEventInitFromClass<T>>(
    event: T,
    eventInitDict: U,
  ): this;
  dispatchEvent(event: any, eventInitDict?: any): this {
    const el = this.element();
    el.dispatchEvent(
      event instanceof Event ? event : this._createCustomEvent(event, eventInitDict),
    );
    return this;
  }

  toString() {
    return this.constructor.name;
  }

  static toString() {
    return this.name;
  }
}
