import { View, html } from 'rune-ts';

export class ColorView extends View<string> {
  constructor(a: string) {
    super(a);
  }
  override template(colorCode: string) {
    return html`<div style="background-color: ${colorCode}"></div>`;
  }
}
