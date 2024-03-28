import { View, Enable, html } from 'rune-ts';

export class Movable extends Enable {
  override onMount() {
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

interface DeletableExtraViewInterface {
  readonly targetClassName: string;
  canRemove(): boolean;
}

export class Deletable extends Enable<object, DeletableExtraViewInterface> {
  override onMount() {
    this.delegate('mousedown', `.${this.view.targetClassName}`, 'remove');
  }

  remove() {
    if (this.view.canRemove()) {
      this.element().remove();
    }
  }
}

export interface Ball {
  color: string;
  count: number;
}

export class BallView extends View<Ball> {
  movable = new Movable(this);

  removable = new Deletable(this);
  readonly targetClassName = 'target';
  canRemove() {
    return --this.data.count === 0;
  }

  override template() {
    return html`
      <div
        style="
         border: 1px solid black; 
         padding: 10px; 
         width: 20px; 
         height: 20px; 
         border-radius: 20px;"
      >
        <div
          class="${this.targetClassName}"
          style="
           background-color: ${this.data.color}; 
           width: 100%; 
           height: 100%; 
           border-radius: 10px;"
        ></div>
      </div>
    `;
  }
}
