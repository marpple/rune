import { html } from 'rune-ts';
import { ToggleView } from './ToggleView';

export class CheckView extends ToggleView {
  override template() {
    return html` <span class="${this.data.on ? 'on' : ''}"></span> `;
  }
}
