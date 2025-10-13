import { CustomEventWithDetail, html, On, View } from 'rune-ts';

export class TextSubmitted extends CustomEventWithDetail<string> {}

export class TextSubmitView extends View<{ value?: string }> {
  override template() {
    return html`<input type="text" value="${this.data.value ?? ''}" />`;
  }
  @On('keypress')
  private keypress(e: KeyboardEvent) {
    if (e.code === 'Enter') {
      const input = e.target as HTMLInputElement;
      const detail = input.value.trim();
      if (detail) {
        this.dispatchEvent(TextSubmitted, { detail, bubbles: true });
        input.value = '';
      }
    }
  }
}
