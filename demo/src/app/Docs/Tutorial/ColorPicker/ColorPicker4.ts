import { View, html } from 'rune-ts';

export interface CheckboxData {
  checked?: boolean;
  value?: string;
}

export class CheckboxView<T extends CheckboxData> extends View<T> {
  tagName = 'li';
  SubView: (new (data: T) => View<T>) | null = null;

  override template({ checked }: T) {
    return html`
      <${this.tagName} class="${checked ? 'checked' : ''}">
        ${this.createSubView()}
      </${this.tagName}>
    `;
  }

  createSubView(): View<T> | string {
    return this.SubView ? new this.SubView(this.data) : this.data.value || '';
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
  CheckboxView: new (data: T) => CheckboxView<T> = CheckboxView;

  override template(checkBoxDatas: T[]) {
    return html`
      <${this.tagName}>
        ${checkBoxDatas.map((checkBoxData) => this.createCheckboxView(checkBoxData))}
      </${this.tagName}>
    `;
  }

  createCheckboxView(data: T): CheckboxView<T> {
    return new this.CheckboxView(data);
  }

  override onMount() {
    return this.delegate('checkbox:change', `> .${this.CheckboxView}`, this.onChange);
  }

  onChange() {
    this.element().dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  checkedDatas() {
    return this.data.filter(({ checked }) => checked);
  }
}

export interface Color {
  code: string;
  checked?: boolean;
}

export class ColorView extends View<Color> {
  override template({ code }: Color) {
    return html` <div style="background-color: ${code}"></div> `;
  }
}

export class ColorCheckboxView extends CheckboxView<Color> {
  override SubView = ColorView;
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  override CheckboxView = ColorCheckboxView;
}
