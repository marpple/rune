import { View, Enable, on, html } from 'rune-ts';

export class Movable extends Enable {
  override onMount() {
    this.start();
  }

  start() {
    this.element().animate(
      [
        { transform: 'translateX(0px)' },
        { transform: 'translateX(300px)' },
        { transform: 'translateX(0px)' },
      ],
      {
        duration: 5000,
        iterations: Infinity,
      },
    );
  }
}

export class Removable<T extends { count: number }> extends Enable<T> {
  @on('mousedown')
  hit() {
    if (--this.data.count === 0) {
      this.element().remove();
    }
  }
}

export interface Ball {
  color: string;
  count: number;
}

export class BallView extends View<Ball> {
  removable = new Removable(this);
  movable = new Movable(this);

  override template() {
    return html`
      <div style="border: 1px solid black; padding: 8px;">
        <div
          class="target"
          style="background-color: ${this.data
            .color}; width: 20px; height: 20px; border-radius: 10px;"
        ></div>
      </div>
    `;
  }
}
