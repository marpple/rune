import { ToggleView } from './ToggleView';
import { html } from 'rune-ts';

export class CheckView extends ToggleView {
  override template() {
    return html` <span class="${this.data.on ? 'on' : ''}"></span> `;
  }

  override onMount(): void {
    console.log('CheckView mounted');
  }

  override onUnmount(): void {
    console.log('CheckView unmounted');
  }
}
