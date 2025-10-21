import { CustomEventWithDetail, html, ListView, View } from 'rune-ts';

interface Segment {
  title: string;
  value?: string;
  selected?: boolean;
}

export class SegmentSelected<T extends Segment = Segment> extends CustomEventWithDetail<T> {}

class SegmentItemView<T extends Segment> extends View<T> {
  override template({ selected, title }: Segment) {
    return html` <button class="${selected ? 'selected' : ''}">${title}</button> `;
  }
}

export class SegmentControlView<T extends Segment> extends ListView<SegmentItemView<T>> {
  ItemView = SegmentItemView;

  selectedIndex: number;

  constructor(data: T[], selectedIndex?: number) {
    super(data);
    this.selectedIndex =
      selectedIndex ??
      Math.max(
        0,
        this.data.findIndex((segment) => segment.selected),
      );
    this.data[this.selectedIndex].selected = true;
  }

  override onRender() {
    this.delegate('click', SegmentItemView<T>, (e, itemView) => {
      if (itemView.data === this.selectedSegment()) return;
      itemView.element().classList.add('selected');
      itemView.data.selected = true;
      this.selectedSegmentView().element().classList.remove('selected');
      this.selectedSegmentView().data.selected = false;
      this.selectedIndex = this.itemViews.indexOf(itemView);
      this.dispatchEvent(SegmentSelected, { detail: this.selectedSegment(), bubbles: true });
    });
  }

  private selectedSegmentView() {
    return this.itemViews[this.selectedIndex];
  }

  selectedSegment() {
    return this.data[this.selectedIndex];
  }
}
