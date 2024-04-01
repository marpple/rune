import { CustomEventWithDetail, html, on, View } from 'rune-ts';

interface Segment {
  title: string;
  value: string;
  selected?: boolean;
}

export class SegmentSelected extends CustomEventWithDetail<Segment> {}

export class SegmentControlView extends View<Segment[]> {
  selectedIndex = this.data.findIndex((segment) => segment.selected);

  override template() {
    return html`
      <div>
        ${this.data.map(
          (segment) => html`
            <button class="${segment.selected ? 'selected' : ''}">${segment.title}</button>
          `,
        )}
      </div>
    `;
  }

  @on('click', 'button:not(.selected)')
  private _select(e: MouseEvent) {
    const button = e.currentTarget as HTMLButtonElement;
    button.classList.add('selected');
    const buttons = [...this.element().querySelectorAll('button')];
    buttons[this.selectedIndex].classList.remove('selected');
    this.selectedIndex = buttons.indexOf(button);
    this.dispatchEvent(SegmentSelected, { detail: this.selectedSegment(), bubbles: true });
  }

  selectedSegment() {
    return this.data[this.selectedIndex];
  }
}
