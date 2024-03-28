import { View, html } from 'rune-ts';

export class ColorView extends View<{ colorCode: string }> {
  override template() {
    return html`<div style="background-color: ${this.data.colorCode}"></div>`;
  }
}
