import { View, CustomEventWithDetail } from 'rune-ts';

export type Toggle = { on: boolean };

export class Toggled extends CustomEventWithDetail<Toggle> {}

export abstract class ToggleView extends View<Toggle> {
  constructor(data?: Toggle) {
    super(data ?? { on: false });
  }

  protected override onRender() {
    this.addEventListener('click', () => this.toggle());
  }

  private toggle() {
    this.setOn(!this.data.on);
    this.dispatchEvent(Toggled, { bubbles: true, detail: this.data });
  }

  setOn(bool: boolean) {
    this.data.on = bool;
    this.element().classList.toggle('on', bool);
  }
}
