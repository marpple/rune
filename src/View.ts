import { rune } from './rune';
import { VirtualView } from './VirtualView';
import { each, flatMap, pipe, toArray, zip } from '@fxts/core';
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
        zip(this.subViewElements(), this.subViewsFromTemplate),
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
            ?.closest('[data-rune]')
            ?.chain((parentViewElement) => {
              this.parentView = rune.getView(parentViewElement, View)!;
              this.element().dataset.runeParent = this.parentView.toString();
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
    return this;
  }

  redraw(): this {
    return this._makeHtml()
      ._redrawAttributes()
      ._setInnerHtmlFromCurrentInnerHtml()
      .hydrateSubViews();
  }

  async redrawAsync(): Promise<this> {
    return (await this._makeHtmlAsync())
      ._redrawAttributes()
      ._setInnerHtmlFromCurrentInnerHtml()
      .hydrateSubViews();
  }

  private _subViewSelector(subViewName?: string) {
    return `[data-rune-parent="${this}"]:not(#${this._getElId()} [data-rune-parent="${this}"] [data-rune-parent="${this}"])${subViewName && subViewName != 'View' ? `.${subViewName}` : ''}`;
  }

  protected subViewElements(subViewName?: string): HTMLElement[] {
    const elements = [
      ...this.element().querySelectorAll(this._subViewSelector(subViewName)),
    ] as HTMLElement[];
    this._removeTempElId();
    return elements;
  }

  protected subViewElementsIn(
    selector: string,
    subViewName: string,
  ): HTMLElement[] {
    const elements = pipe(
      $(this.element()).findAll(selector),
      flatMap(($el) =>
        $el.element().querySelectorAll(this._subViewSelector(subViewName)),
      ),
      toArray,
    ) as HTMLElement[];
    this._removeTempElId();
    return elements;
  }

  private _subViews<T extends ViewConstructor>(
    elements: HTMLElement[],
    SubView: T,
  ) {
    return elements.map((element) => rune.getView(element, SubView)!);
  }

  protected subViews<T extends ViewConstructor>(SubView: T, selector?: string) {
    return selector !== undefined
      ? this.subViewsIn(selector, SubView)
      : this._subViews(this.subViewElements(SubView.name), SubView);
  }

  protected subViewsIn<T extends ViewConstructor>(
    selector: string,
    SubView: T,
  ) {
    return this._subViews(
      this.subViewElementsIn(selector, SubView.name),
      SubView,
    );
  }

  protected subViewElement(subViewName?: string): HTMLElement | null {
    const element = this.element().querySelector(
      this._subViewSelector(subViewName),
    );
    this._removeTempElId();
    return element as HTMLElement | null;
  }

  protected subViewElementIn(
    selector: string,
    subViewName: string,
  ): HTMLElement | null {
    const element =
      $(this.element())
        .find(selector)
        ?.element()
        .querySelector(this._subViewSelector(subViewName)) ?? null;
    this._removeTempElId();
    return element as HTMLElement | null;
  }

  private _subView<T extends ViewConstructor>(
    element: HTMLElement | null,
    SubView: T,
  ) {
    return element ? rune.getView(element, SubView) ?? null : null;
  }

  protected subView<T extends ViewConstructor>(SubView: T, selector?: string) {
    return selector !== undefined
      ? this.subViewIn(selector, SubView)
      : this._subView(this.subViewElement(SubView.name), SubView);
  }

  protected subViewIn<T extends ViewConstructor>(selector: string, SubView: T) {
    return this._subView(
      this.subViewElementIn(selector, SubView.name),
      SubView,
    );
  }

  redrawOnlySubViews(): this {
    this.subViews(View)
      .filter((view) => !view.ignoreRefreshOnlySubViewFromParent)
      .forEach((view) => view.redraw());
    return this;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  protected _reservedEnables: Enable<unknown>[] = [];
  static _ReservedEnables: (new (...args: any[]) => Enable<unknown>)[] = [];
}

type ViewConstructor = new (...args: any[]) => View<unknown>;

export interface HasReservedEnables extends ViewConstructor {
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
