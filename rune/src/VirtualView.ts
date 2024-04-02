import { _escape } from './lib/_escape';
import { Base } from './Base';
import { join, pipe, toAsync } from '@fxts/core';
import { _htmlEscapeJsonString } from './lib/_htmlEscapeJsonString';

export class VirtualView<T extends object> extends Base {
  key = '';
  private readonly _data: T;

  parentView: VirtualView<object> | null = null;
  subViewsFromTemplate: VirtualView<object>[] = [];

  readonly isLayout: boolean = false;
  renderCount = 0;
  protected _currentHtml: string | null = null;

  get data(): T {
    return this._data;
  }

  set data(data: T) {
    throw TypeError("'data' property is readonly.");
  }

  constructor(data: T) {
    super();
    this._data = data;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  protected template(data: T): Html {
    return html``;
  }

  async templateAsync(data: T): Promise<Html> {
    return Promise.resolve(this.template(data));
  }

  protected _matchStartTag(html: string): {
    startTag: string;
    startTagName: string;
  } {
    const matched = html.match(/^\s*<(\w+|!)[^>]*>/)!;
    return {
      startTag: matched[0],
      startTagName: matched[1],
    };
  }

  private _addRuneAttrs(html: string, isSSR?: boolean): string {
    if (this.isLayout) return html;
    const { startTag, startTagName } = this._matchStartTag(html);
    const runeDataset = `data-rune="${this}" data-rune-parent="${this.parentView}"`;
    html = startTag.includes('class="')
      ? html.replace('class="', `${runeDataset} class="${this} `)
      : startTag.includes("class='")
        ? html.replace("class='", `${runeDataset} class='${this} `)
        : html.replace(`<${startTagName}`, `<${startTagName} ${runeDataset} class="${this}"`);

    return isSSR
      ? html.replace(
          html,
          `${html}<script class="__RUNE_DATA__ ${this}" type="application/json">${_htmlEscapeJsonString(
            JSON.stringify({
              data: this.data,
              key: this.key,
            }),
          )}</script>`,
        )
      : html;
  }

  protected _currentInnerHtml(): string {
    const html = this._currentHtml!;
    const { startTag, startTagName } = this._matchStartTag(html);
    return html.replace(startTag, '').slice(0, -(startTagName.length + 3));
  }

  private _resetCurrentHtml(currentHtml: string, isSSR?: boolean): this {
    this.renderCount++;
    this._currentHtml = this._addRuneAttrs(currentHtml.trim(), isSSR);
    return this;
  }

  protected _makeHtml(isSSR?: boolean): this {
    if (this.data === null) throw new TypeError("'this.data' is not assigned.");
    this.subViewsFromTemplate = [];
    return this._resetCurrentHtml(html`${this.template(this.data)}`.make(this), isSSR);
  }

  protected async _makeHtmlAsync(isSSR?: boolean): Promise<this> {
    if (this.data === null) throw new TypeError("'this.data' is not assigned.");
    this.subViewsFromTemplate = [];
    return this._resetCurrentHtml(
      await html`${await this.templateAsync(this.data)}`.makeAsync(this),
      isSSR,
    );
  }

  protected ready() {}

  toHtml(isSSR?: boolean): string {
    if (this.renderCount === 0) this.ready();
    return this._makeHtml(isSSR)._currentHtml!;
  }

  async toHtmlAsync(isSSR?: boolean): Promise<string> {
    if (this.renderCount === 0) this.ready();
    return (await this._makeHtmlAsync(isSSR))._currentHtml!;
  }

  toHtmlSRR(): UnsafeHtml {
    return html.preventEscape(this.toHtml(true));
  }

  async toHtmlSRRAsync(): Promise<UnsafeHtml> {
    return html.preventEscape(await this.toHtmlAsync(true));
  }
}

export function html(templateStrs: TemplateStringsArray, ...templateVals: unknown[]): Html {
  return new Html(templateStrs, templateVals);
}

html.preventEscape = (htmlStr: string): UnsafeHtml => new UnsafeHtml(htmlStr);

export class Html {
  private _templateStrs: TemplateStringsArray;
  private _templateVals: unknown[];

  constructor(templateStrs: TemplateStringsArray, templateVals: unknown[]) {
    this._templateStrs = templateStrs;
    this._templateVals = templateVals;
  }

  make(virtualView: VirtualView<object>): string {
    return pipe(
      this._make(
        virtualView,
        (view) => view.toHtml(),
        (html, view) => html.make(view),
      ),
      join(''),
    );
  }

  async makeAsync(virtualView: VirtualView<object>): Promise<string> {
    return pipe(
      this._make(
        virtualView,
        (view) => view.toHtmlAsync(),
        (html, view) => html.makeAsync(view),
      ),
      toAsync,
      join(''),
    );
  }

  private *_make(
    virtualView: VirtualView<object>,
    toHtml: (virtualView: VirtualView<object>) => string | Promise<string>,
    make: (html: Html, virtualView: VirtualView<object>) => string | Promise<string>,
  ): Generator<string | Promise<string>> {
    const end = this._templateStrs.length - 1;
    for (let i = 0; i < end; i++) {
      yield this._templateStrs[i];
      for (const templateVal of this._wrapArray(this._templateVals[i])) {
        yield this._isSubView(templateVal, virtualView)
          ? toHtml(this._addSubViewsFromTemplate(templateVal, virtualView))
          : templateVal instanceof Html
            ? make(templateVal, virtualView)
            : templateVal instanceof UnsafeHtml
              ? templateVal.toString()
              : _escape(templateVal as string);
      }
    }
    yield this._templateStrs[end];
  }

  private _wrapArray(templateVals: unknown): unknown[] {
    return Array.isArray(templateVals) ? templateVals : [templateVals];
  }

  private _isSubView(
    templateVal: unknown,
    virtualView: VirtualView<object>,
  ): templateVal is VirtualView<object> {
    return (
      virtualView !== templateVal &&
      virtualView.parentView !== templateVal &&
      templateVal instanceof VirtualView
    );
  }

  private _addSubViewsFromTemplate(
    subView: VirtualView<object>,
    virtualView: VirtualView<object>,
  ): VirtualView<object> {
    subView.parentView = virtualView;
    virtualView.subViewsFromTemplate.push(subView);
    return subView;
  }
}

export class UnsafeHtml {
  private _htmlStr: string;

  constructor(_htmlStr: string) {
    this._htmlStr = _htmlStr;
  }

  toString() {
    return this._htmlStr;
  }
}
