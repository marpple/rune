import { View } from 'rune-ts';
import { html } from 'rune-ts';

interface CheckboxData {
  checked?: boolean;
}

export class CheckboxView<T extends CheckboxData> extends View<T> {
  override template() {
    return html`
      <div class="${this.data.checked ? 'checked' : ''}">${this.makeSubViewHtml()}</div>
    `;
  }

  makeSubViewHtml() {
    return html``;
  }

  override onMount() {
    this.addEventListener('click', this.click);
  }

  click() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
    this.element().dispatchEvent(
      new CustomEvent('checkbox:change', {
        bubbles: true,
      }),
    );
  }
}

export class CheckboxListView<T extends CheckboxData> extends View<T[]> {
  override template() {
    return html`
      <div>${this.data.map((checkboxData) => this.makeCheckboxViewHtml(checkboxData))}</div>
    `;
  }

  makeCheckboxViewHtml(checkboxData: T) {
    return html``;
  }

  override onMount() {
    this.delegate('checkbox:change', `> *`, function () {
      this.dispatchEvent(new CustomEvent('checkboxlist:change'));
    });
  }

  checkedData() {
    return this.data.filter(({ checked }) => checked);
  }
}

interface Color {
  code: string;
  checked?: boolean;
}

export class ColorView extends View<Color> {
  override template() {
    const { code } = this.data;
    return html`
      <div
        style="
        background-color: ${code};
        width: 20px;
        height: 20px;
        border-radius: 10px;"
      ></div>
    `;
  }
}

export class ColorCheckboxView extends CheckboxView<Color> {
  override makeSubViewHtml() {
    return html`${new ColorView(this.data)}`;
  }
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  override makeCheckboxViewHtml(color: Color) {
    return html`${new ColorCheckboxView(color)}`;
  }
}

export function main() {
  const colors = [{ code: 'red' }, { code: 'green', checked: true }, { code: 'blue' }];

  const colorCheckboxListView = new ColorCheckboxListView(colors);
  document.body.appendChild(colorCheckboxListView.render());

  colorCheckboxListView.addEventListener('checkboxlist:change', function () {
    console.log(this.checkedData().map((color) => color.code));
  });
}
