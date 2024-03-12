import { rune } from './rune';
import { VirtualView } from './VirtualView';
import { each, pipe, zip } from '@fxts/core';
import { $ } from './$Element';

export class View<T> extends VirtualView<T> {
  override subViewsFromTemplate: View<T>[] = [];
  private _element: HTMLElement | null = null;
  ignoreRefreshOnlySubViewFromParent = false;

  isRendered(): boolean {
    return this._element !== null;
  }

  override element(): HTMLElement {
    if (this._element === null) {
      throw new TypeError(
        "element is not created. call 'render' or 'hydrateFromSSR'.",
      );
    }
    return this._element;
  }

  private _setElement(element: HTMLElement): this {
    this._element = element;
    rune.set(this._element, this);

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
}

export class ListView<T> extends View<T[]> {}

if (typeof window !== 'undefined') {
  window.__rune_View__ = View;
}
