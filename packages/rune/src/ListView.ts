import { View } from './View';
import { map, pipe, reject, reverse, toArray } from '@fxts/core';
import { html } from './VirtualView';

export abstract class ListView<IV extends View<object>> extends View<IV['data'][]> {
  tagName = 'div';
  abstract ItemView: new (data: IV['data'], ...args: any[]) => IV; // eslint-disable-line @typescript-eslint/no-explicit-any
  readonly _itemViews: IV[] = [];
  private _initialized = false;

  createItemView(item: IV['data']): IV {
    return new this.ItemView(item);
  }

  createItemViews(items: IV['data'][]): IV[] {
    return items.map((item) => this.createItemView(item));
  }

  get length() {
    return this._itemViews.length;
  }

  get itemViews() {
    if (!this._initialized) {
      this.createItemViews(this.data).forEach((view) => this._itemViews.push(view));
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
    const newItems = [...this.data];
    this.data.length = 0;
    this.itemViews.forEach(({ data }) => this.data.push(data));
    this.set(newItems);
    this.itemViews.forEach((view) => view.redraw());
    return this;
  }

  add(items: IV['data'][], at?: number): this {
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

  private _append(
    push: 'push' | 'unshift',
    append: 'append' | 'prepend',
    items: IV['data'][],
  ): this {
    const itemViews = this.createItemViews(items);
    this.data[push](...items);
    this._itemViews[push](...itemViews);
    if (this.isRendered()) {
      this.element()[append](...itemViews.map((view) => view.render()));
    }
    return this;
  }

  append(item: IV['data']): this {
    return this.appendAll([item]);
  }

  appendAll(items: IV['data'][]): this {
    return this._append('push', 'append', items);
  }

  prepend(item: IV['data']): this {
    return this.prependAll([item]);
  }

  prependAll(items: IV['data'][]): this {
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

  remove(item: IV['data']): IV | undefined {
    return this._removeAll([item], this.data)[0];
  }

  removeAll(items: IV['data'][]): IV[] {
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

  set(items: IV['data'][]): this {
    let i = 0,
      j = 0;

    const oldItemsMap = new Map(this.data.map((item) => [item, true]));

    while (i < this.data.length && j < items.length) {
      const oldItem = this.data[i];
      const newItem = items[j];

      if (oldItem === newItem) {
        i++;
        j++;
        continue;
      }

      if (oldItemsMap.has(newItem)) {
        this.itemViews[i].element().remove();
        this.itemViews.splice(i, 1);
        this.data.splice(i, 1);
      } else {
        const oldItemView = this.itemViews[i];
        const newItemView = new this.ItemView(newItem);
        oldItemView.element().before(newItemView.render());
        this.itemViews.splice(i, 0, newItemView);
        this.data.splice(i, 0, newItem);
        i++;
        j++;
      }
    }

    while (i < this.data.length) {
      const oldItemView = this.itemViews[i];
      oldItemView.element().remove();
      this.itemViews.splice(i, 1);
      this.data.splice(i, 1);
    }

    while (j < items.length) {
      const newItem = items[j];
      const newItemView = new this.ItemView(newItem);
      this.itemViews.push(newItemView);
      this.element().append(newItemView.render());
      this.data.push(newItem);
      j++;
    }

    return this;
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
