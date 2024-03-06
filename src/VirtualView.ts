import { _escape } from './escape';

export const html = (
  templateStrs: TemplateStringsArray,
  ...templateVals: unknown[]
) => {
  return new Html(null, templateStrs, templateVals);
};

export class Html {
  _virtualView: VirtualView<unknown> | null;
  _templateStrs: TemplateStringsArray;
  _templateVals: unknown[];

  constructor(
    virtualView: VirtualView<unknown> | null,
    templateStrs: TemplateStringsArray,
    templateVals: unknown[],
  ) {
    this._virtualView = virtualView;
    this._templateStrs = templateStrs;
    this._templateVals = templateVals;
  }

  _wrapArray(templateVals: unknown): unknown[] {
    return Array.isArray(templateVals) ? templateVals : [templateVals];
  }

  _isSubView(templateVal: unknown): templateVal is VirtualView<unknown> {
    return (
      this._virtualView !== templateVal &&
      this._virtualView?.parentView !== templateVal &&
      templateVal instanceof VirtualView
    );
  }

  _addSubViewsFromTemplate(templateVal: unknown): unknown {
    if (this._isSubView(templateVal)) {
      templateVal.parentView = this._virtualView;
      this._virtualView?.subViewsFromTemplate.push(templateVal);
    }
    return templateVal;
  }

  _fromTemplateVal(templateVal: unknown): string {
    return templateVal instanceof Html
      ? templateVal.make()
      : templateVal instanceof UnsafeHtml
        ? templateVal.toString()
        : _escape(templateVal as string);
  }

  setVirtualView(virtualView: VirtualView<unknown>): this {
    this._virtualView = virtualView;
    return this;
  }

  make(): string {
    let html = this._templateStrs[0].replace(/ {2}|\n/g, ' ');
    for (let i = 0; i < this._templateVals.length; i++) {
      const templateVals: unknown[] = this._wrapArray(this._templateVals[i]);
      for (const item of templateVals) {
        const templateVal = this._addSubViewsFromTemplate(item);
        html += this._isSubView(templateVal)
          ? templateVal.toHtml()
          : this._fromTemplateVal(templateVal);
      }
      html += this._templateStrs[i + 1].replace(/ {2}|\n/g, ' ');
    }
    return html;
  }

  async makeAsync() {
    let html = this._templateStrs[0];
    for (let i = 0; i < this._templateVals.length; i++) {
      const templateVals: unknown[] = this._wrapArray(this._templateVals[i]);
      for (const item of templateVals) {
        const templateVal = this._addSubViewsFromTemplate(item);
        html += this._isSubView(templateVal)
          ? await templateVal.toHtmlAsync()
          : this._fromTemplateVal(templateVal);
      }
      html += this._templateStrs[i + 1];
    }
    return html;
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

export type TemplateReturnType<T> = Html | UnsafeHtml | string | T;

export class VirtualView<T> {
  root = false;
  data: T;

  parentView: VirtualView<unknown> | null = null;
  subViewsFromTemplate: VirtualView<unknown>[] = [];

  renderCount = 0;
  protected _currentHtml: string | null = null;

  constructor(data: T) {
    this.data = data;
  }

  setData(data: T): this {
    this.data = data;
    return this;
  }

  applyData(f: (data: T) => T): this {
    return this.setData(f(this.data));
  }

  async applyDataAsync(f: (data: T) => T): Promise<this> {
    return this.setData(await f(this.data));
  }

  apply(f: (view: this) => void): this {
    f(this);
    return this;
  }

  async applyAsync(f: (view: this) => Promise<void>): Promise<this> {
    await f(this);
    return this;
  }

  html(templateStrs: TemplateStringsArray, ...templateVals: unknown[]): Html {
    return new Html(this, templateStrs, templateVals);
  }

  preventEscape(htmlStr: string): UnsafeHtml {
    return new UnsafeHtml(htmlStr);
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  template(data: T): TemplateReturnType<this> {
    return this.html``;
  }

  async templateAsync(data: T): Promise<TemplateReturnType<this>> {
    return await this.template(data);
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
    this.subViewsFromTemplate = [];
    const html = this.template(this.data);

    if (html instanceof Html && !html._virtualView) {
      html.setVirtualView(this);
    }

    return this._resetCurrentHtml(
      html === this ? '' : html instanceof Html ? html.make() : `${html}`,
    );
  }

  protected async _makeHtmlAsync(): Promise<this> {
    if (this.data === null) throw new TypeError("'this.data' is not assigned.");
    this.subViewsFromTemplate = [];
    const html = await this.templateAsync(this.data);

    if (html instanceof Html && !html._virtualView) {
      html.setVirtualView(this);
    }

    return this._resetCurrentHtml(
      html === this
        ? ''
        : html instanceof Html
          ? await html.makeAsync()
          : `${html}`,
    );
  }

  toHtml(): string {
    return this._makeHtml()._currentHtml!;
  }

  async toHtmlAsync(): Promise<string> {
    return (await this._makeHtmlAsync())._currentHtml!;
  }

  toString() {
    return this.constructor.name;
  }

  static toString() {
    return this.name;
  }
}
