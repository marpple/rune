import { rune } from './rune';
import { VirtualView } from './VirtualView';
import { each, pipe, zip } from '@fxts/core';
import { $ } from './$Element';
import { type Enable } from './Enable';
import { ViewMounted, ViewRendered, ViewUnmounted } from './ViewEvent';

export class View<T extends object = object> extends VirtualView<T> {
  protected override _base_name = 'View';
  override subViewsFromTemplate: View<T>[] = [];
  ignoreRefreshOnlySubViewFromParent = false;

  render(): HTMLElement {
    return this._render(this.toHtml());
  }

  private _render(html: string): HTMLElement {
    return this._setElement($.fromHtml(html).element()).hydrate().element();
  }

  hydrateFromSSR(element: HTMLElement): this {
    return this._setElement(element)._makeHtml().hydrate();
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

  protected override _onUnmount(ev?: InstanceType<typeof ViewUnmounted>): this {
    if (ev?.isPermanent) {
      this.removeEventListener(ViewMounted, this._onMount);
      this.removeEventListener(ViewUnmounted, this._onUnmount);
    }
    return super._onUnmount();
  }

  protected override _onRender() {
    rune.set(this.element(), this, View);
    this.addEventListener(ViewMounted, this._onMount);
    this.addEventListener(ViewUnmounted, this._onUnmount);

    this._reservedEnables = (this.constructor as HasReservedEnables)._ReservedEnables.map(
      (ReservedEnable) => new ReservedEnable(this),
    );
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

  private _subViewSelector(subViewName?: string) {
    return `[data-rune-parent="${this}"]${subViewName && subViewName !== 'View' ? `.${subViewName}` : ''}`;
  }

  private _firstDepthSubViews(parentEl: HTMLElement, subViewName?: string) {
    return $(parentEl)
      .findAll(this._subViewSelector(subViewName))
      .map(($el) => $el.element())
      .filter((el) => this.element() === el.parentElement?.closest(`[data-rune="${this}"]`));
  }

  private _subViewElements(subViewName?: string): HTMLElement[] {
    return this._firstDepthSubViews(this.element(), subViewName);
  }

  private _subViewElementsIn(selector: string, subViewName: string): HTMLElement[] {
    return $(this.element())
      .findAll(selector)
      .map(($el) => $el.element())
      .flatMap((el) => this._firstDepthSubViews(el, subViewName));
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

  private _firstDepthSubView(parentEl: HTMLElement | undefined, subViewName?: string) {
    return parentEl
      ? $(parentEl).find(this._subViewSelector(subViewName))?.element() ?? null
      : null;
  }

  private _subViewElement(subViewName?: string): HTMLElement | null {
    return this._firstDepthSubView(this.element(), subViewName);
  }

  private _subViewElementIn(selector: string, subViewName: string): HTMLElement | null {
    return this._firstDepthSubView($(this.element()).find(selector)?.element(), subViewName);
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
    const dataEl = $(element).next(`script.__RUNE_DATA__.${this.name}[data-rune-base-name="View"]`);
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
