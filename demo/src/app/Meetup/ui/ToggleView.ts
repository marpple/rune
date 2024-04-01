import { CustomEventWithDetail, on, View } from 'rune-ts';

export class Toggled extends CustomEventWithDetail<boolean> {}

export abstract class ToggleView extends View<{ on: boolean }> {
  @on('click')
  private _toggle() {
    this.setOn(!this.data.on);
    this.dispatchEvent(Toggled, { detail: this.data.on, bubbles: true });
  }

  setOn(bool: boolean) {
    this.data.on = bool;
    this.element().classList.toggle('on', bool);
  }
}
