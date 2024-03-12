import { eventHelper } from './EventHelper';
import { rune } from './rune';

export abstract class Base {
  protected onMount() {}

  protected _onMount() {
    rune.set(this.element(), this);
    eventHelper.addDecoratedListeners(this, this.element());
    this.onMount();
    eventHelper.addReservedListener(this, this.element());
    return this;
  }

  element(): HTMLElement {
    throw TypeError('override required');
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  addEventListener<K extends keyof HTMLElementEventMap, M extends keyof this>(
    eventType: K,
    listener: M,
    options?: boolean | AddEventListenerOptions,
  ): this;
  addEventListener<M extends keyof this>(
    type: string,
    listener: M,
    options?: boolean | AddEventListenerOptions,
  ): this;
  addEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: (this: this, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): this;
  addEventListener(
    type: string,
    listener: (this: this, ev: Event) => any,
    options?: boolean | AddEventListenerOptions,
  ): this;
  addEventListener<K extends keyof HTMLElementEventMap, M extends keyof this>(
    eventType: K | string,
    listener:
      | ((this: this, ev: HTMLElementEventMap[K]) => any)
      | ((this: this, ev: Event) => any)
      | M,
    options?: boolean | AddEventListenerOptions,
  ): this {
    eventHelper.addEventListener(
      this,
      this.element(),
      eventType,
      listener,
      options,
    );
    return this;
  }

  removeEventListener<
    K extends keyof HTMLElementEventMap,
    M extends keyof this,
  >(eventType: K, listener: M, options?: boolean | EventListenerOptions): this;
  removeEventListener<M extends keyof this>(
    eventType: string,
    listener: M,
    options?: boolean | EventListenerOptions,
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
  removeEventListener<
    K extends keyof HTMLElementEventMap,
    M extends keyof this,
  >(
    eventType: K | string,
    listener:
      | ((this: this, ev: HTMLElementEventMap[K]) => any)
      | ((this: this, ev: Event) => any)
      | M,
    options?: boolean | EventListenerOptions,
  ): this {
    eventHelper.removeEventListener(
      this,
      this.element(),
      eventType,
      listener,
      options,
    );
    return this;
  }

  delegate<K extends keyof HTMLElementEventMap, M extends keyof this>(
    eventType: K,
    selector: string,
    listener: M,
  ): this;
  delegate<M extends keyof this>(
    eventType: string,
    selector: string,
    listener: M,
  ): this;
  delegate<K extends keyof HTMLElementEventMap>(
    eventType: K,
    selector: string,
    listener: (this: this, e: HTMLElementEventMap[K]) => void,
  ): this;
  delegate(
    eventType: string,
    selector: string,
    listener: (this: this, ev: Event) => any,
  ): this;
  delegate<K extends keyof HTMLElementEventMap, M extends keyof this>(
    eventType: K | string,
    selector: string,
    listener:
      | M
      | ((this: this, e: HTMLElementEventMap[K]) => void)
      | ((this: this, ev: Event) => any),
  ): this {
    eventHelper.delegate(this, this.element(), eventType, selector, listener);
    return this;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  dispatchEvent(event: Event): this {
    this.element().dispatchEvent(event);
    return this;
  }

  chain(f: (this: this, view: this) => void): this {
    f.call(this, this);
    return this;
  }

  async chainAsync(
    f: (this: this, view: this) => Promise<void>,
  ): Promise<this> {
    await f.call(this, this);
    return this;
  }

  toString() {
    return this.constructor.name;
  }

  static toString() {
    return this.name;
  }
}
