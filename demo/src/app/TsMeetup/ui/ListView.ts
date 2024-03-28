import { html, View } from 'rune-ts';

export abstract class ListView<T extends object, IV extends View<T>> extends View<T[]> {
  itemViews = this.data.map((item: T) => this.createItemView(item));

  abstract createItemView(item: T): IV;

  override template() {
    return html`<div>${this.itemViews}</div>`;
  }

  append(item: T) {
    this.data.push(item);
    const itemView = this.createItemView(item);
    this.itemViews.push(itemView);
    this.element().append(itemView.render());
  }
}
