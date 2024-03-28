import { View, type Html, html } from 'rune-ts';
import { ColorView } from './ColorView';

export interface CheckboxData<T> {
  checked?: boolean;
  value: T;
}

export class CheckboxView<T> extends View<CheckboxData<T>> {
  tagName = 'li';
  override template(data: CheckboxData<T>) {
    return html`
      <${this.tagName} class="${data.checked ? 'checked' : ''}">
        ${this.subViewHtml()}
      </${this.tagName}>
    `;
  }

  subViewHtml(): Html {
    return html`${this.data.value}`;
  }

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

export class CheckboxListView<T> extends View<CheckboxData<T>[]> {
  tagName = 'ul';
  override template(checkBoxDatas: CheckboxData<T>[]) {
    return html`
      <${this.tagName}>
        ${checkBoxDatas.map((checkBoxData) => this.checkBoxViewHtml(checkBoxData))}
      </${this.tagName}>
    `;
  }

  checkBoxViewHtml(data: CheckboxData<T>): Html {
    return html`${new CheckboxView(data)}`;
  }

  override onMount() {
    return this.delegate('change', '> *', this.onChange);
  }

  onChange() {
    this.element().dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  checkedDatas() {
    return this.data.filter(({ checked }) => checked);
  }

  checkedValues() {
    return this.checkedDatas().map(({ value }) => value);
  }
}

export interface Color {
  colorCode: string;
}

export class ColorCheckboxView extends CheckboxView<Color> {
  override subViewHtml() {
    return html`${new ColorView({ colorCode: this.data.value.colorCode })}`;
  }
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  override checkBoxViewHtml(data: CheckboxData<Color>): Html {
    return html`${new ColorCheckboxView(data)}`;
  }
}
