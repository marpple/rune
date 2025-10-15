import { eventHelper } from './EventHelper';
import { rune } from './rune';
import type { CustomEventInitFromClass } from './CustomEventWithDetail';
import { _camelToColonSeparated } from './lib/_camelToColonSeparated';

export abstract class Base {
  protected _element: HTMLElement | null = null;
  private _runeElNumber = 0;
  private _isTempElId = false;

  protected onRender() {}

  protected _onRender(): this {
    rune.set(this.element(), this);
    eventHelper.addDecoratedListeners(this, this.element());
    this.onRender();
    eventHelper.addReservedListener(this, this.element());
    return this;
  }

  protected onMount() {}

  protected _onMount(): this {
    this.onMount();
    return this;
  }

  protected onUnmount() {}

  protected _onUnmount() {
    this.onUnmount();
    return this;
  }

  element(): HTMLElement {
    if (this._element === null) {
      throw new TypeError("element is not created. call 'view.render' or 'view.hydrateFromSSR'.");
    }
    return this._element;
  }

  isRendered(): boolean {
    return this._element !== null;
  }

  chain(f: (this: this, view: this) => void): this {
    f.call(this, this);
    return this;
  }

  async chainAsync(f: (this: this, view: this) => Promise<void>): Promise<this> {
    await f.call(this, this);
    return this;
  }

  safely(f: (this: this, view: this) => void): this {
    return this.isRendered() ? this.chain(f) : this;
  }

  async safelyAsync(f: (this: this, view: this) => Promise<void>): Promise<this> {
    return this.isRendered() ? this.chainAsync(f) : this;
  }

  protected _getElId() {
    if (this.element().id) {
      return this.element().id;
    } else {
      this._isTempElId = true;
      return (this.element().id = `rune-temp-id-${++this._runeElNumber}`);
    }
  }

  protected _removeTempElId(): this {
    if (this._isTempElId) {
      this.element().removeAttribute('id');
      this._isTempElId = false;
    }
    return this;
  }

  protected _setElement(element: HTMLElement): this {
    this._element = element;
    return this;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  addEventListener<T extends new (...args: any[]) => Event>(
    eventType: T,
    listener: (this: this, ev: InstanceType<T>) => any,
    options?: boolean | AddEventListenerOptions,
  ): this;
  addEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: (this: this, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): this;
  addEventListener(
    eventType: string,
    listener: (this: this, ev: Event) => any,
    options?: boolean | AddEventListenerOptions,
  ): this;
  addEventListener(eventType: any, listener: any, options?: any): this {
    eventHelper.addEventListener(this, this._element, eventType, listener, options);
    return this;
  }

  removeEventListener<T extends new (...args: any[]) => Event>(
    eventType: T,
    listener: (this: this, ev: InstanceType<T>) => any,
    options?: boolean | AddEventListenerOptions,
  ): this;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: (this: this, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): this;
  removeEventListener(
    eventType: string,
    listener: (this: this, ev: Event) => any,
    options?: boolean | EventListenerOptions,
  ): this;
  removeEventListener(eventType: any, listener: any, options?: any): this {
    eventHelper.removeEventListener(this, this._element, eventType, listener, options);
    return this;
  }

  delegate<K extends new (...args: any[]) => Event, T extends new (...args: any[]) => Base>(
    eventClass: K,
    View: T,
    listener: (
      this: this,
      e: InstanceType<K> & { originalEvent: InstanceType<K> },
      targetView: InstanceType<T>,
    ) => void,
  ): this;
  delegate<K extends new (...args: any[]) => Event>(
    eventClass: K,
    selector: string,
    listener: (this: this, e: InstanceType<K> & { originalEvent: InstanceType<K> }) => void,
  ): this;
  delegate<K extends keyof HTMLElementEventMap, T extends new (...args: any[]) => Base>(
    eventType: K,
    View: T,
    listener: (
      this: this,
      e: HTMLElementEventMap[K] & { originalEvent: HTMLElementEventMap[K] },
      targetView: InstanceType<T>,
    ) => void,
  ): this;
  delegate<K extends keyof HTMLElementEventMap>(
    eventType: K,
    selector: string,
    listener: (
      this: this,
      e: HTMLElementEventMap[K] & { originalEvent: HTMLElementEventMap[K] },
    ) => void,
  ): this;
  delegate<T extends new (...args: any[]) => Base>(
    eventType: string,
    View: T,
    listener: (
      this: this,
      e: Event & { originalEvent: Event },
      targetView: InstanceType<T>,
    ) => void,
  ): this;
  delegate(
    eventType: string,
    selector: string,
    listener: (this: this, e: Event & { originalEvent: Event }) => any,
  ): this;
  delegate(eventType: any, selector: any, listener: any): this {
    eventHelper.delegate(this, this._element, eventType, selector, listener);
    return this;
  }

  /* eslint-enable @typescript-eslint/no-explicit-any */

  private _createEvent<
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
  dispatchEvent<T extends new (...args: any[]) => Event, U extends CustomEventInitFromClass<T>>(
    event: Event | T,
    eventInitDict?: U,
  ): this {
    if (event instanceof Event) {
      this.element().dispatchEvent(event);
    } else {
      this.element().dispatchEvent(this._createEvent(event, eventInitDict!));
    }
    return this;
  }

  toString() {
    return this.constructor.name;
  }

  static toString() {
    return this.name;
  }
}
