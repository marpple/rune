import { View } from './View';
import { every, map, pipe, reject, reverse, toArray, zip } from '@fxts/core';
import { html } from './VirtualView';

export class ListView<
  T extends object,
  IV extends View<T> = View<T>,
> extends View<T[]> {
  tagName = 'ul';
  classNameForItemViewsContainer = 'item-views-container';
  ItemView: (new (data: T) => IV) | null = null;
  readonly _itemViews: IV[] = [];

  get length() {
    return this._itemViews.length;
  }

  get itemViews() {
    return this._itemViews;
  }

  set itemViews(_: IV[]) {
    throw TypeError("'itemViews' property is readonly.");
  }

  itemViewsContainer() {
    return (
      this.element().querySelector(`.${this.classNameForItemViewsContainer}`) ??
      this.element()
    );
  }

  override template() {
    return html`
      <${this.tagName} class="${this.classNameForItemViewsContainer}">
        ${this.itemViews}
      </${this.tagName}>
    `;
  }

  protected override ready() {
    this._sync();
  }

  override redraw(): this {
    if (!this.isRendered()) {
      return this._sync();
    }
    if (
      this.data.length &&
      this.data.length === this.itemViews.length &&
      every(
        ([a, b]) => a === b,
        zip(
          this.data,
          this.itemViews.map((view) => view.data),
        ),
      )
    ) {
      this.itemViews.forEach((view) => view.redraw());
    } else {
      this._sync();
      super.redraw();
    }
    return this;
  }

  createItemView(item: T): IV {
    if (this.ItemView === null) {
      throw TypeError('Override ItemView please.');
    } else {
      return new this.ItemView(item);
    }
  }

  createItemViews(items: T[]): IV[] {
    return items.map((item) => this.createItemView(item));
  }

  add(items: T[], at?: number): this {
    if (at === undefined || at >= this.length) {
      this.appendAll(items);
    } else if (at <= 0) {
      this.prependAll(items);
    } else {
      const itemViews = this.createItemViews(items);
      this.data.splice(at, 0, ...items);
      if (this.isRendered()) {
        this._itemViews[at]
          .element()
          .before(...itemViews.map((view) => view.render()));
      }
      this._itemViews.splice(at, 0, ...itemViews);
    }
    return this;
  }

  private _append(
    push: 'push' | 'unshift',
    append: 'append' | 'prepend',
    items: T[],
  ): this {
    const itemViews = this.createItemViews(items);
    this.data[push](...items);
    this._itemViews[push](...itemViews);
    if (this.isRendered()) {
      this.itemViewsContainer()[append](
        ...itemViews.map((view) => view.render()),
      );
    }
    return this;
  }

  append(item: T): this {
    return this.appendAll([item]);
  }

  appendAll(items: T[]): this {
    return this._append('push', 'append', items);
  }

  prepend(item: T): this {
    return this.prependAll([item]);
  }

  prependAll(items: T[]): this {
    return this._append('unshift', 'prepend', items);
  }

  private _removeAll<T>(items: T[], list: T[]) {
    return pipe(
      items.map((item) => list.indexOf(item)),
      reverse,
      reject((idx) => idx === -1),
      map((idx) => this.removeByIndex(idx)!),
      toArray,
    ).reverse();
  }

  remove(item: T): IV | undefined {
    return this._removeAll([item], this.data)[0];
  }

  removeAll(items: T[]): IV[] {
    return this._removeAll(items, this.data);
  }

  removeByItemView(itemView: IV): IV | undefined {
    return this._removeAll([itemView], this._itemViews)[0];
  }

  removeAllByItemViews(itemViews: IV[]): IV[] {
    return this._removeAll(itemViews, this._itemViews);
  }

  removeByIndex(idx: number): IV | undefined {
    if (-1 < idx && idx < this.data.length) {
      this.data.splice(idx, 1);
      const itemView = this._itemViews.splice(idx, 1)[0];
      if (this.isRendered()) {
        itemView.element().remove();
      }
      return itemView;
    }
  }

  removeBy(f: (itemView: IV) => boolean): IV | undefined {
    return this.removeByIndex(
      this._itemViews.findIndex((itemView) => f(itemView)),
    );
  }

  removeAllBy(f: (itemView: IV) => boolean): IV[] {
    return this.removeAllByItemViews(
      this._itemViews.filter((itemView) => f(itemView)),
    );
  }

  reset(): this {
    this.data.length = 0;
    this._itemViews.length = 0;
    if (this.isRendered()) {
      this.itemViewsContainer().innerHTML = '';
    }
    return this;
  }

  set(items: T[]): this {
    this.reset();
    this.data.push(...items);
    this._sync();
    return super.redraw();
  }

  private _sync(): this {
    this._itemViews.length = 0;
    this._itemViews.push(...this.createItemViews(this.data));
    return this;
  }

  move(at: number, to: number): this {
    if (
      at !== to &&
      -1 < at &&
      -1 < to &&
      at < this.data.length &&
      to < this.data.length
    ) {
      const targetIdx = at < to ? to - 1 : to;
      const item = this.data.splice(at, 1)[0];
      const itemView = this._itemViews.splice(at, 1)[0];
      this.data.splice(targetIdx, 0, item);
      this._itemViews.splice(targetIdx, 0, itemView);
      if (this.isRendered()) {
        const targetElement = this._itemViews[to].element();
        targetElement[at < to ? 'after' : 'before'](itemView.element());
      }
    }
    return this;
  }
}

export class ListViewWithOptions<
  T extends object,
  O = object,
> extends ListView<T> {
  options?: O;

  constructor(data: T[], options?: O) {
    super(data);
    this.options = options;
  }
}
