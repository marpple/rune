import { _escape } from './lib/_escape';
import { Base } from './Base';
import { join, pipe } from '@fxts/core';
import { _htmlEscapeJsonString } from './lib/_htmlEscapeJsonString';
import { rune } from './rune';

let _viewIdCounter = 0;

export class VirtualView<T extends object> extends Base {
  key = '';
  protected _base_name = 'VirtualView';
  private readonly _data: T;
  readonly _args: any[];
  private readonly _viewId: string;

  parentView: VirtualView<object> | null = null;
  subViewsFromTemplate: VirtualView<object>[] = [];

  readonly isLayout: boolean = false;
  renderCount = 0;
  protected _currentHtml: string | null = null;
  className = '';

  get data(): T {
    return this._data;
  }

  set data(_data: T) {
    throw TypeError("'data' property is readonly.");
  }

  get viewId(): string {
    return this._viewId;
  }

  constructor(data: T, ...args: any[]) {
    super();
    this._data = data;
    this._args = args;
    this._viewId = `v${++_viewIdCounter}`;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  protected template(data: T): Html {
    return html``;
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
    const className = this.className ? `${this} ${this.className}` : `${this}`;

    html = startTag.includes('class="')
      ? html.replace('class="', `${runeDataset} class="${className} `)
      : startTag.includes("class='")
        ? html.replace("class='", `${runeDataset} class='${className} `)
        : html.replace(`<${startTagName}`, `<${startTagName} ${runeDataset} class="${className}"`);

    return isSSR
      ? `${html}<script class="__RUNE_DATA__ ${this}" type="application/json" data-rune-base-name="${
          this._base_name
        }">${_htmlEscapeJsonString(
          JSON.stringify({
            data: this.data,
            args: this._args,
            sharedData: rune.getSharedData(this),
            key: this.key,
            name: this.constructor.name,
          }),
        )}</script>`
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

  protected ready() {}

  toHtml(isSSR?: boolean): string {
    if (this.renderCount === 0) this.ready();
    return this._makeHtml(isSSR)._currentHtml!;
  }

  toHtmlSSR(): UnsafeHtml {
    return html.preventEscape(this.toHtml(true));
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
