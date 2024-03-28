import { html, on, View } from 'rune-ts';

export class InputTextReturnEnterView extends View<{ value?: string }> {
  returnValue = this.data.value ?? '';

  override template() {
    return html` <input type="text" value="${this.data.value ?? ''}" /> `;
  }

  @on('keypress')
  private _keypress(e: KeyboardEvent) {
    if (e.code === 'Enter') {
      const input = e.target as HTMLInputElement;
      this.returnValue = input.value;
      input.value = '';
      this.element().dispatchEvent(new CustomEvent('return', { bubbles: true }));
    }
  }
}
