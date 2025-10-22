import { ToggleView } from './ToggleView';
import { html } from 'rune-ts';

export class CheckView extends ToggleView {
  override template() {
    return html` <span class="${this.data.on ? 'on' : ''}"></span> `;
  }
}
