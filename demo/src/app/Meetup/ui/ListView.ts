import { html, View } from 'rune-ts';
import { every, pipe, zip } from '@fxts/core';

export abstract class ListView<T extends object, IV extends View<T>> extends View<T[]> {
  itemViews = this.data.map((item: T) => this.createItemView(item));

  abstract createItemView(item: T): IV;

  override template() {
    return html` <div>${this.itemViews}</div> `;
  }

  append(item: T): this {
    this.data.push(item);
    const itemView = this.createItemView(item);
    this.itemViews.push(itemView);
    this.element().append(itemView.render());
    return this;
  }

  reset() {
    this.data.length = 0;
    this.itemViews.length = 0;
    this.element().innerHTML = '';
    return this;
  }

  set(items: T[]): this {
    if (items.length === 0) {
      return this.reset();
    } else if (
      this.data.length === items.length &&
      pipe(
        zip(this.data, items),
        every(([a, b]) => a === b),
      )
    ) {
      return this;
    } else {
      const itemViewMap = new Map(this.itemViews.map((itemView) => [itemView.data, itemView]));
      const newItemViews = items.map((item) => itemViewMap.get(item) ?? this.createItemView(item));
      this.reset();
      this.data.push(...items);
      this.itemViews.push(...newItemViews);
      this.element().append(...newItemViews.map((itemView) => itemView.render()));
    }
    return this;
  }
}
