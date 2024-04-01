import { View } from './View';
import { each, every, map, pipe, reject, reverse, toArray, zip } from '@fxts/core';
import { html } from './VirtualView';

export abstract class ListView<T extends object, IV extends View<T>> extends View<T[]> {
  tagName = 'div';
  abstract ItemView: new (data: T) => IV;
  readonly _itemViews: IV[] = [];
  private _initialized = false;

  createItemView(item: T): IV {
    return new this.ItemView(item);
  }

  createItemViews(items: T[]): IV[] {
    return items.map((item) => this.createItemView(item));
  }

  get length() {
    return this._itemViews.length;
  }

  get itemViews() {
    if (!this._initialized) {
      this._itemViews.push(...this.createItemViews(this.data));
      this._initialized = true;
    }
    return this._itemViews;
  }

  set itemViews(_: IV[]) {
    throw TypeError("'itemViews' property is readonly.");
  }

  override template() {
    return html`
      <${this.tagName}>
        ${this.itemViews}
      </${this.tagName}>
    `;
  }

  override redraw(): this {
    if (
      this.data.length &&
      this.data.length === this.itemViews.length &&
      every(
        ([a, b]) => a === b,
        zip(
          this.data,
          this.itemViews.map((itemView) => itemView.data),
        ),
      )
    ) {
      this.itemViews.forEach((itemView) => itemView.redraw());
    } else {
      const itemViewMap = new Map(this.itemViews.map((itemView) => [itemView.data, itemView]));
      const newItemViews = this.data.map(
        (item) => itemViewMap.get(item) ?? this.createItemView(item),
      );
      this.itemViews.length = 0;
      this.element().innerHTML = '';
      this.itemViews.push(...newItemViews);
      each((itemView) => itemView.render(), itemViewMap.values());
      this.element().append(...newItemViews.map((itemView) => itemView.render()));
    }
    return this;
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
        this._itemViews[at].element().before(...itemViews.map((view) => view.render()));
      }
      this._itemViews.splice(at, 0, ...itemViews);
    }
    return this;
  }

  private _append(push: 'push' | 'unshift', append: 'append' | 'prepend', items: T[]): this {
    const itemViews = this.createItemViews(items);
    this.data[push](...items);
    this._itemViews[push](...itemViews);
    if (this.isRendered()) {
      this.element()[append](...itemViews.map((view) => view.render()));
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
    return this.removeByIndex(this._itemViews.findIndex((itemView) => f(itemView)));
  }

  removeAllBy(f: (itemView: IV) => boolean): IV[] {
    return this.removeAllByItemViews(this._itemViews.filter((itemView) => f(itemView)));
  }

  reset(): this {
    this.data.length = 0;
    this._itemViews.length = 0;
    if (this.isRendered()) {
      this.element().innerHTML = '';
    }
    return this;
  }

  set(items: T[]): this {
    this.reset();
    this.data.push(...items);
    return this.redraw();
  }

  move(at: number, to: number): this {
    if (at !== to && -1 < at && -1 < to && at < this.data.length && to < this.data.length) {
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
