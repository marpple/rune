import { rune } from './rune';
import { VirtualView } from './VirtualView';
import { each, pipe, zip } from '@fxts/core';
import { $, type DelegateEventHandler } from './$Element/$Element';

export class View<T> extends VirtualView<T> {
  override subViewsFromTemplate: View<T>[] = [];
  private _element: HTMLElement | null = null;
  ignoreRefreshOnlySubViewFromParent = false;

  element(): HTMLElement {
    if (this._element === null) {
      throw new TypeError(
        "element is not created. call 'render' or 'hydrateFromSSR'.",
      );
    }
    return this._element;
  }

  private _setElement(element: HTMLElement): this {
    this._element = element;
    rune.setView(this._element, this);
    return this;
  }

  render(): HTMLElement {
    return this._render(this.toHtml());
  }

  async renderAsync(): Promise<HTMLElement> {
    return this._render(await this.toHtmlAsync());
  }

  private _render(html: string): HTMLElement {
    return this._setElement($.fromHtml(html).element()).hydrate().element();
  }

  hydrateFromSSR(element: HTMLElement): this {
    return this._setElement(element)._makeHtml().hydrate();
  }

  async hydrateFromSSRAsync(element: HTMLElement): Promise<this> {
    return this._setElement(element)
      ._makeHtmlAsync()
      .then(() => this.hydrate());
  }

  protected hydrate(): this {
    return this.hydrateSubViews()._addListenerForAppended()._onMount();
  }

  private hydrateSubViews(): this {
    if (this.subViewsFromTemplate.length > 0) {
      pipe(
        zip(this.findSubViewElements(), this.subViewsFromTemplate),
        each(([element, view]) => {
          view._setElement(element).hydrate();
        }),
      );
    }
    return this;
  }

  private _addListenerForAppended(): this {
    const observer = new MutationObserver((mutationsList, observer) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          $(this.element())
            .parentNode()
            ?.closest('[data-rune-view]')
            ?.apply((parentViewElement) => {
              this.parentView = rune.getView(
                parentViewElement,
              ) as View<unknown>;
              this.element().dataset.runeViewParent =
                this.parentView.constructor.name;
              observer.disconnect();
            });
        }
      }
    });
    observer.observe(this.element(), { childList: true });
    return this;
  }

  private _onMount() {
    this.onMount();
    this._pendingListeners.forEach(({ eventType, listener, options }) =>
      this.element().addEventListener(eventType, listener, options),
    );
    this.dispatchEvent(new CustomEvent('view:mountend'));
    return this;
  }

  protected onMount() {}

  /* eslint-disable @typescript-eslint/no-explicit-any */
  private static _listeners = new WeakMap<any, any>();

  _makeListener<K extends keyof HTMLElementEventMap, S>(
    listener: (this: S, ev: HTMLElementEventMap[K], view: S) => any,
  ): EventListenerOrEventListenerObject {
    if (View._listeners.get(listener)) {
      return View._listeners.get(listener);
    } else {
      const listenerForView: (
        this: HTMLElement,
        ev: HTMLElementEventMap[K],
      ) => any = function (e) {
        const view = rune.getView(this) as S;
        listener.call(view, e, view);
      };
      View._listeners.set(listener, listenerForView);
      return listenerForView as EventListenerOrEventListenerObject;
    }
  }

  private _pendingListeners: {
    eventType: string;
    listener: EventListenerOrEventListenerObject;
    options?: boolean | AddEventListenerOptions;
  }[] = [];

  addEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: (this: this, ev: HTMLElementEventMap[K], view?: this) => any,
    options?: boolean | AddEventListenerOptions,
  );
  addEventListener(
    type: string,
    listener: (this: this, ev: Event, view?: this) => any,
    options?: boolean | AddEventListenerOptions,
  );
  addEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K | string,
    listener:
      | ((this: this, ev: HTMLElementEventMap[K], view?: this) => any)
      | ((this: this, ev: Event, view?: this) => any),
    options?: boolean | AddEventListenerOptions,
  ): this {
    if (this._element) {
      this.element().addEventListener(
        eventType,
        this._makeListener<K, this>(listener),
        options,
      );
    } else {
      this._pendingListeners.push({
        eventType: eventType,
        listener: this._makeListener<K, this>(listener),
        options,
      });
    }
    return this;
  }

  removeEventListener<K extends keyof HTMLElementEventMap>(
    eventType: K,
    listener: (this: this, ev: HTMLElementEventMap[K], view?: this) => any,
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
    listener: (this: S, ev: HTMLElementEventMap[K], view?: S) => void,
  ): DelegateEventHandler<K> {
    if (View._listeners.get(listener)) {
      return View._listeners.get(listener);
    } else {
      const listenerForView: DelegateEventHandler<K> = function (e) {
        const view = rune.getView(this) as S;
        listener.call(view, e, view);
      };
      View._listeners.set(listener, listenerForView);
      return listenerForView;
    }
  }

  delegate<K extends keyof HTMLElementEventMap>(
    event: K | string,
    selector: string,
    listener: (this: this, e: HTMLElementEventMap[K], view?: this) => void,
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

  private _redrawAttributes(): this {
    const { startTag, startTagName } = this._matchStartTag(this._currentHtml!);
    const element2 = $.fromHtml(`${startTag}</${startTagName}>`).element();
    const element = this.element();
    let length = element.attributes.length;
    while (--length) {
      const { name } = element.attributes[length];
      if (!element2.attributes[name]) {
        element.removeAttribute(name);
      }
    }
    for (const { name, value } of element2.attributes) {
      const attr = element.attributes[name];
      if (!attr || attr.value !== value) {
        element.setAttribute(name, value);
      }
    }
    return this;
  }

  private _setInnerHtmlFromCurrentInnerHtml(): this {
    $(this.element()).setInnerHtml(this._currentInnerHtml());
    this.hydrateSubViews();
    return this;
  }

  redraw(): this {
    return this._makeHtml()
      ._redrawAttributes()
      ._setInnerHtmlFromCurrentInnerHtml();
  }

  async redrawAsync(): Promise<this> {
    return (await this._makeHtmlAsync())
      ._redrawAttributes()
      ._setInnerHtmlFromCurrentInnerHtml();
  }

  findSubViewElements(): HTMLElement[] {
    return $(this.element())
      .findAll(`[data-rune-view-parent="${this.constructor.name}"]`)
      .map(($element) => $element.element());
  }

  findSubViews(): View<unknown>[] {
    return this.findSubViewElements().map(
      (element: HTMLElement) => rune.getView(element) as View<unknown>,
    );
  }

  redrawOnlySubViews(): this {
    this.findSubViews()
      .filter((view) => !view.ignoreRefreshOnlySubViewFromParent)
      .forEach((view) => view.redraw());
    return this;
  }

  rootView(): View<unknown> | null {
    return View.rootView();
  }

  static rootView(): View<unknown> | null {
    const rootElement = document.querySelector('body [data-rune-view]')!;
    return rootElement
      ? (rune.getView(rootElement) as View<unknown>) || null
      : null;
  }
}

export class ListView<T> extends View<T[]> {}

if (typeof window !== 'undefined') {
  window.__rune_View__ = View;
}
