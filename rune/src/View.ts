import { rune } from './rune';
import { VirtualView } from './VirtualView';
import { each, flatMap, pipe, toArray, zip } from '@fxts/core';
import { $ } from './$Element';
import { type Enable } from './Enable';
import { ViewMounted, ViewRendered, ViewUnmounted } from './ViewEvent';

export class View<T extends object = object> extends VirtualView<T> {
  override subViewsFromTemplate: View<T>[] = [];
  ignoreRefreshOnlySubViewFromParent = false;

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
    this.hydrateSubViews()._onRender();
    if (document.body.contains(this.element())) {
      this._onMount();
    }
    return this;
  }

  private hydrateSubViews(): this {
    if (this.subViewsFromTemplate.length > 0) {
      pipe(
        zip(this._subViewElements(), this.subViewsFromTemplate),
        each(([element, view]) => {
          view._setElement(element).hydrate();
        }),
      );
    }
    return this;
  }

  protected override _onRender() {
    this.addEventListener(ViewMounted, this._onMount);
    this.addEventListener(ViewUnmounted, this._onUnmount);

    this._reservedEnables = (this.constructor as HasReservedEnables)._ReservedEnables.map(
      (ReservedEnable) => new ReservedEnable(this),
    );
    rune.set(this.element(), this, View);
    super._onRender();
    this.dispatchEvent(ViewRendered, { detail: this });
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
    return this._makeHtml().safely(() =>
      this._redrawAttributes()._setInnerHtmlFromCurrentInnerHtml().hydrateSubViews(),
    );
  }

  async redrawAsync(): Promise<this> {
    return (await this._makeHtmlAsync()).safely(() =>
      this._redrawAttributes()._setInnerHtmlFromCurrentInnerHtml().hydrateSubViews(),
    );
  }

  private _subViewSelector(subViewName?: string) {
    return `[data-rune-parent="${this}"]:not(#${this._getElId()} [data-rune-parent="${this}"] [data-rune-parent="${this}"])${
      subViewName && subViewName !== 'View' ? `.${subViewName}` : ''
    }`;
  }

  private _subViewElements(subViewName?: string): HTMLElement[] {
    const elements = [
      ...this.element().querySelectorAll(this._subViewSelector(subViewName)),
    ] as HTMLElement[];
    this._removeTempElId();
    return elements;
  }

  private _subViewElementsIn(selector: string, subViewName: string): HTMLElement[] {
    const elements = pipe(
      $(this.element()).findAll(selector),
      flatMap(($el) => $el.element().querySelectorAll(this._subViewSelector(subViewName))),
      toArray,
    ) as HTMLElement[];
    this._removeTempElId();
    return elements;
  }

  private _subViews<T extends ViewConstructor>(elements: HTMLElement[], SubView: T) {
    return elements.map((element) => rune.getView(element, SubView)!);
  }

  protected subViews<T extends ViewConstructor>(SubView: T, selector?: string) {
    return selector !== undefined
      ? this.subViewsIn(selector, SubView)
      : this._subViews(this._subViewElements(SubView.name), SubView);
  }

  protected subViewsIn<T extends ViewConstructor>(selector: string, SubView: T) {
    return this._subViews(this._subViewElementsIn(selector, SubView.name), SubView);
  }

  private _subViewElement(subViewName?: string): HTMLElement | null {
    const element = this.element().querySelector(this._subViewSelector(subViewName));
    this._removeTempElId();
    return element as HTMLElement | null;
  }

  private _subViewElementIn(selector: string, subViewName: string): HTMLElement | null {
    const element =
      $(this.element())
        .find(selector)
        ?.element()
        .querySelector(this._subViewSelector(subViewName)) ?? null;
    this._removeTempElId();
    return element as HTMLElement | null;
  }

  private _subView<T extends ViewConstructor>(element: HTMLElement | null, SubView: T) {
    return element ? rune.getView(element, SubView) ?? null : null;
  }

  protected subView<T extends ViewConstructor>(SubView: T, selector?: string) {
    return selector !== undefined
      ? this.subViewIn(selector, SubView)
      : this._subView(this._subViewElement(SubView.name), SubView);
  }

  protected subViewIn<T extends ViewConstructor>(selector: string, SubView: T) {
    return this._subView(this._subViewElementIn(selector, SubView.name), SubView);
  }

  protected redrawOnlySubViews(): this {
    this.subViews(View)
      .filter((view) => !view.ignoreRefreshOnlySubViewFromParent)
      .forEach((view) => view.redraw());
    return this;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  protected _reservedEnables: Enable<object>[] = [];
  static _ReservedEnables: (new (...args: any[]) => Enable<object>)[] = [];

  static createAndHydrate(element: HTMLElement) {
    const dataEl = $(element).next(`script.__RUNE_DATA__.${this.name}`);
    if (dataEl === null) {
      throw new Error('No __RUNE_DATA__ script found');
    } else {
      const hydration_data = JSON.parse(dataEl.getTextContent() ?? '{}');
      dataEl.remove();
      return new this(hydration_data.data, ...hydration_data.args).hydrateFromSSR(element);
    }
  }
}

type ViewConstructor = new (...args: any[]) => View<object>;

export interface HasReservedEnables extends ViewConstructor {
  _ReservedEnables: (new (...args: any[]) => Enable<object>)[];
}
/* eslint-enable @typescript-eslint/no-explicit-any */
