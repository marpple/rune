import { View, html } from 'rune-ts';

interface Color {
  code: string;
  checked?: boolean;
}

export class ColorView extends View<Color> {
  override template({ code }: Color) {
    return html` <div style="background-color: ${code}"></div> `;
  }
}

export class ColorCheckboxView extends View<Color> {
  override template(color: Color) {
    return html` <li class="${color.checked ? 'checked' : ''}">${new ColorView(color)}</li> `;
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

export class ColorCheckboxListView extends View<Color[]> {
  override template(colors: Color[]) {
    return html`
      <ul>
        ${colors.map((color) => new ColorCheckboxView(color))}
      </ul>
    `;
  }

  override onMount() {
    return this.delegate('change', '.ColorCheckboxView', this.onChange);
  }

  onChange() {
    this.element().dispatchEvent(new CustomEvent('change', { bubbles: true }));
  }

  checkedColors() {
    return this.data.filter(({ checked }) => checked);
  }
}
