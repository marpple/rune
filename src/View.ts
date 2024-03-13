import { rune } from './rune';
import { VirtualView } from './VirtualView';
import { each, pipe, zip } from '@fxts/core';
import { $ } from './$Element';
import { type Enable } from './Enable';

export class View<T> extends VirtualView<T> {
  override subViewsFromTemplate: View<T>[] = [];
  ignoreRefreshOnlySubViewFromParent = false;

  isRendered(): boolean {
    return this._element !== null;
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
            ?.chain((parentViewElement) => {
              this.parentView = rune.getView(parentViewElement, View)!;
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

  override _onMount() {
    this._reservedEnables = (
      this.constructor as HasReservedEnables
    )._ReservedEnables.map((ReservedEnable) => new ReservedEnable(this).init());
    rune.set(this.element(), this, View);
    super._onMount();
    this.dispatchEvent(new CustomEvent('view:mountend'));
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    return this.findSubViewElements().map((element: HTMLElement) => {
      return rune.getView(element, View)!;
    });
  }

  redrawOnlySubViews(): this {
    this.findSubViews()
      .filter((view) => !view.ignoreRefreshOnlySubViewFromParent)
      .forEach((view) => view.redraw());
    return this;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  protected _reservedEnables: Enable<unknown>[] = [];
  static _ReservedEnables: (new (...args: any[]) => Enable<unknown>)[] = [];
}

type Constructor = new (...args: any[]) => View<unknown>;

export interface HasReservedEnables extends Constructor {
  _ReservedEnables: (new (...args: any[]) => Enable<unknown>)[];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export class ViewWithOptions<T, O> extends View<T> {
  options?: O;

  constructor(data: T, options?: O) {
    super(data);
    this.options = options;
  }
}

export class ListView<T> extends View<T[]> {}

export class ListViewWithOptions<T, O> extends ViewWithOptions<T[], O> {}

if (typeof window !== 'undefined') {
  window.__rune_View__ = View;
}
