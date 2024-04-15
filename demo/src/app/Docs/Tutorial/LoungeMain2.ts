import { Enable, html, on, View } from 'rune-ts';

interface DeletableViewInterface extends View<object> {
  targetClassName: string;
  canRemove(): boolean;
}

export class Deletable extends Enable {
  constructor(public override view: DeletableViewInterface) {
    super(view);
  }

  override onRender() {
    this.delegate('mousedown', `.${this.view.targetClassName}`, this.remove);
  }

  remove() {
    if (this.view.canRemove()) {
      this.element().remove();
    }
  }
}

export class Movable extends Enable {
  override onRender() {
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

interface Ball {
  color: string;
  count: number;
}

export class BallView extends View<Ball> {
  movable = new Movable(this);
  deletable = new Deletable(this);
  targetClassName = 'target';

  canRemove() {
    return --this.data.count === 0;
  }

  override template(ball: Ball) {
    return html`
      <div
        style="background-color: black; width: 20px; height: 20px; padding: 10px; border-radius: 30px;"
      >
        <div
          class="${this.targetClassName}"
          style="background-color: ${ball.color}; width: 20px; height: 20px; border-radius: 10px;"
        ></div>
      </div>
    `;
  }
}

export function main() {
  const balls = [
    { color: 'red', count: 3 },
    { color: 'green', count: 2 },
    { color: 'blue', count: 1 },
  ];
  balls
    .map((ball) => new BallView(ball).render())
    .forEach((element) => document.body.appendChild(element));

  document.body.appendChild(
    new SettingsView([
      { title: 'Wi-fi', on: true },
      { title: 'Bluetooth', on: false },
      { title: 'Airplane mode', on: true },
    ]).render(),
  );

  const sv = new SettingsView([
    { title: 'Wi-fi', on: true },
    { title: 'Bluetooth', on: false },
    { title: 'Airplane mode', on: true },
  ]);
}

interface Setting {
  title: string;
  on: boolean;
}

class SettingsView extends View<Setting[]> {
  override template() {
    return html`
      <div>
        <div class="header">
          <span class="title">Check All</span>
          ${new SwitchView({ on: this.isAllChecked() })}
        </div>
        <div class="body">
          ${this.data.map(
            (setting) => html`
              <div class="setting-item">
                <span class="title">${setting.title}</span>
                ${new SwitchView(setting)}
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  @on('switch:change', '> .header')
  checkAll() {
    const { on } = this.subViewIn('> .header', SwitchView)!.data;
    this.subViewsIn('> .body', SwitchView)
      .filter((view) => on !== view.data.on)
      .forEach((view) => view.setOn(on));
  }

  @on('switch:change', '> .body')
  settingViewChanged() {
    this.subViewIn('> .header', SwitchView)!.setOn(this.isAllChecked());
  }

  isAllChecked() {
    return this.data.every(({ on }) => on);
  }
}

class SwitchView extends View<{
  on: boolean;
  color?: string;
}> {
  override template() {
    return html`
      <button
        style="
        width: 50px; 
        border-radius: 15px; 
        border: 0 none;
        padding: 5px;
        box-sizing: border-box;
        background-color: ${this.color()};"
      >
        <div
          class="toggle"
          style="
          width: 20px; 
          height: 20px; 
          margin: 0;
          border-radius: 10px;
          background: white;
          transform: ${this.translateX()}"
        ></div>
      </button>
    `;
  }

  private color() {
    return this.data.on ? this.data.color ?? 'green' : 'gray';
  }

  private translateX() {
    return `translateX(${this.data.on ? '0%' : '100%'})`;
  }

  private toggleElement(): HTMLElement {
    return this.element().querySelector('.toggle')!;
  }

  @on('click')
  private toggle() {
    this.setOn(!this.data.on);
    this.dispatchEvent(new CustomEvent('switch:change', { bubbles: true }));
  }

  setOn(on: boolean): this {
    this.data.on = on;
    Promise.all([
      this.element().animate({ backgroundColor: this.color() }, 150),
      this.toggleElement().animate({ transform: this.translateX() }, 150).finished,
    ])
      .then(() => {
        this.element().style.backgroundColor = this.color();
        this.toggleElement().style.transform = this.translateX();
      })
      .catch((e) => {
        throw e;
      });
    return this;
  }
}
