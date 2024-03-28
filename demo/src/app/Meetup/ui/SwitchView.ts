import { html } from 'rune-ts';
import { ToggleView } from './ToggleView';

export class SwitchView extends ToggleView {
  override template() {
    return html`
      <button class="${this.data.on ? 'on' : ''}">
        <div class="toggle"></div>
      </button>
    `;
  }
}
