import { View, type Html, html } from 'rune-ts';
import { ColorView } from './ColorView';

interface CheckboxData {
  checked?: boolean;
}

class CheckboxView<T extends CheckboxData> extends View<T> {
  tagName = 'li';
  override template(data: T) {
    return html`
      <${this.tagName} class="${data.checked ? 'checked' : ''}">
        ${this.createSubView()}
      </${this.tagName}>
    `;
  }

  createSubView(): View<unknown> {
    return {} as View<unknown>; /*new MyInnerView({})*/
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

export class CheckboxListView<T extends CheckboxData> extends View<T[]> {
  tagName = 'ul';
  override template(checkBoxDatas: T[]) {
    return html`
      <${this.tagName}>
        ${checkBoxDatas.map((checkBoxData) => this.createCheckboxView(checkBoxData))}
      </${this.tagName}>
    `;
  }

  createCheckboxView(data: T): View<T> {
    return new CheckboxView(data);
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
}

interface Color {
  checked?: boolean;
  colorCode: string;
}

export class ColorCheckboxView extends CheckboxView<Color> {
  override createSubView() {
    return new ColorView(this.data.colorCode);
  }
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  override createCheckboxView(data: Color) {
    return new ColorCheckboxView(data);
  }
}
