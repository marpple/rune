import { ToggleView } from './ToggleView';
import { html } from 'rune-ts';

export class SwitchView extends ToggleView {
  override template() {
    return html`
      <button class="${this.data.on ? 'on' : ''}">
        <span class="toggle"></span>
      </button>
    `;
  }
}
