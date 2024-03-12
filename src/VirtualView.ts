import { _escape } from './escape';
import { Base } from './Base';
import { join, pipe, toAsync } from '@fxts/core';

export type TemplateReturnType<T> = Html | UnsafeHtml | string | T;

export class VirtualView<T> extends Base {
  root = false;
  data: T;

  parentView: VirtualView<unknown> | null = null;
  subViewsFromTemplate: VirtualView<unknown>[] = [];

  renderCount = 0;
  protected _currentHtml: string | null = null;

  constructor(data: T) {
    super();
    this.data = data;
  }

  setData(data: T): this {
    this.data = data;
    return this;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  template(data: T): TemplateReturnType<this> {
    return html``;
  }

  async templateAsync(data: T): Promise<TemplateReturnType<this>> {
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

  private _addRuneAttrs(html: string): string {
    if (this.root) return html;
    const { startTag, startTagName } = this._matchStartTag(html);
    const runeDataset = `data-rune-view="${this.constructor.name}" data-rune-view-parent="${this.parentView?.constructor.name}"`;
    html = startTag.includes('class="')
      ? html.replace(
          'class="',
          `${runeDataset} class="${this.constructor.name} `,
        )
      : startTag.includes("class='")
        ? html.replace(
            "class='",
            `${runeDataset} class='${this.constructor.name} `,
          )
        : html.replace(
            `<${startTagName}`,
            `<${startTagName} ${runeDataset} class="${this.constructor.name}"`,
          );
    return html;
  }

  protected _currentInnerHtml(): string {
    const html = this._currentHtml!;
    const { startTag, startTagName } = this._matchStartTag(html);
    return html.replace(startTag, '').slice(0, -(startTagName.length + 3));
  }

  private _resetCurrentHtml(currentHtml: string): this {
    this.renderCount++;
    this._currentHtml = this._addRuneAttrs(currentHtml.trim());
    return this;
  }

  protected _makeHtml(): this {
    if (this.data === null) throw new TypeError("'this.data' is not assigned.");
    const html = this.template(this.data);
    return this._resetCurrentHtml(
      html === this ? '' : html instanceof Html ? html.make(this) : `${html}`,
    );
  }

  protected async _makeHtmlAsync(): Promise<this> {
    if (this.data === null) throw new TypeError("'this.data' is not assigned.");
    const html = await this.templateAsync(this.data);
    return this._resetCurrentHtml(
      html === this
        ? ''
        : html instanceof Html
          ? await html.makeAsync(this)
          : `${html}`,
    );
  }

  toHtml(): string {
    return this._makeHtml()._currentHtml!;
  }

  async toHtmlAsync(): Promise<string> {
    return (await this._makeHtmlAsync())._currentHtml!;
  }
}

export function html(
  templateStrs: TemplateStringsArray,
  ...templateVals: unknown[]
): Html {
  return new Html(templateStrs, templateVals);
}

html.preventEscape = (htmlStr: string): UnsafeHtml => new UnsafeHtml(htmlStr);

export class Html {
  private _templateStrs: TemplateStringsArray;
  private _templateVals: unknown[];

  constructor(templateStrs: TemplateStringsArray, templateVals: unknown[]) {
    this._templateStrs = templateStrs;
    this._templateVals = templateVals;
    this._templateVals.push('');
  }

  private _wrapArray(templateVals: unknown): unknown[] {
    return Array.isArray(templateVals) ? templateVals : [templateVals];
  }

  private _isSubView(
    templateVal: unknown,
    virtualView: VirtualView<unknown>,
  ): templateVal is VirtualView<unknown> {
    return (
      virtualView !== templateVal &&
      virtualView.parentView !== templateVal &&
      templateVal instanceof VirtualView
    );
  }

  private _addSubViewsFromTemplate(
    subView: VirtualView<unknown>,
    virtualView: VirtualView<unknown>,
  ): VirtualView<unknown> {
    subView.parentView = virtualView;
    virtualView.subViewsFromTemplate.push(subView);
    return subView;
  }

  private _fromTemplateVal(templateVal: unknown): string {
    return templateVal instanceof UnsafeHtml
      ? templateVal.toString()
      : _escape(templateVal as string);
  }

  private *_make(
    virtualView: VirtualView<unknown>,
    toHtml: (virtualView: VirtualView<unknown>) => string | Promise<string>,
    make: (
      html: Html,
      virtualView: VirtualView<unknown>,
    ) => string | Promise<string>,
  ): Generator<string | Promise<string>> {
    virtualView.subViewsFromTemplate = [];
    for (let i = 0; i < this._templateStrs.length; i++) {
      yield this._templateStrs[i];
      const templateVals: unknown[] = [this._templateVals[i]].flat();
      for (const templateVal of templateVals) {
        yield this._isSubView(templateVal, virtualView)
          ? toHtml(this._addSubViewsFromTemplate(templateVal, virtualView))
          : templateVal instanceof Html
            ? make(templateVal, virtualView)
            : this._fromTemplateVal(templateVal);
      }
    }
  }

  make(virtualView: VirtualView<unknown>): string {
    return pipe(
      this._make(
        virtualView,
        (view) => view.toHtml(),
        (html, view) => html.make(view),
      ),
      join(''),
    );
  }

  async makeAsync(virtualView: VirtualView<unknown>): Promise<string> {
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
