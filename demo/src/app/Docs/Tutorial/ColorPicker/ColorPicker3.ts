import { View, type Html, html } from 'rune-ts';
import { ColorView } from './ColorView';

interface CheckboxData {
  checked?: boolean;
}

abstract class CheckboxView<T extends CheckboxData> extends View<T> {
  tagName = 'li';
  override template(data: T) {
    return html`
      <${this.tagName} class="${data.checked ? 'checked' : ''}">
        ${this.createSubView()}
      </${this.tagName}>
    `;
  }

  abstract createSubView(): View<object>;

  override onMount() {
    this.element().addEventListener('click', () => this.onClick());
    return this;
  }

  onClick() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
    this.element().dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }
}

abstract class CheckboxListView<T extends CheckboxData> extends View<T[]> {
  tagName = 'ul';
  override template(checkBoxDatas: T[]) {
    return html`
      <${this.tagName}>
        ${checkBoxDatas.map((checkBoxData) => this.createCheckboxView(checkBoxData))}
      </${this.tagName}>
    `;
  }

  abstract createCheckboxView(data: T): View<T>;

  override onMount() {
    return this.delegate('change', '> *', this.onChange);
  }

  onChange() {
    this.element().dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  checkedDatas() {
    return this.data.filter(({ checked }) => checked);
  }
}

interface Color {
  checked?: boolean;
  colorCode: string;
}
