# Enable Pattern

Rune provides an Enable pattern that assigns multiple functionalities to a single `View`. Using `Enable` allows for the modularization of actions or functionalities, making it easier to extend `View`. You can think of `Enable` as a `View` without a template, designed to receive a `View` and enhance its capabilities.

## Enable Sharing Data with View

`Enable` is designed to share data with `View`. In TypeScript, the type argument for `Enable<T>` should match the type argument of `view.data` in `View<T>`. Below is how you can implement the `CheckboxView` using the `Enable` pattern. `Checkable<T extends CheckableData>` constrains the type of `data` for the `View` passed during creation.

```typescript
import { View, html, Enable } from 'rune-ts';

type CheckableData = {
  checked?: boolean;
};

class Checkable<T extends CheckableData> extends Enable<T> {
  @on('click')
  private _toggle() {
    this.view.data.checked = !this.view.data.checked;
    this.view.element().classList.toggle('checked');
    this.view.element().dispatchEvent(new CustomEvent('checkable:change', { bubbles: true }));
  }
}

type Color = {
  code: string;
  checked?: boolean;
};

class CheckableColorView extends View<Color> {
  checkable = new Checkable(this);

  override template(color: Color) {
    return html`
      <div class="${color.checked ? 'checked' : ''}" style="background-color: ${color.code}"></div>
    `;
  }
}

const checkableColorView = new CheckableColorView({ code: 'red' });
checkableColorView.render().dispatchEvent(new MouseEvent('click'));
console.log(checkableColorView.data.checked);
// true
```

`Enable` also has `addEventListener`, `delegate`, and the `@on` decorator, similar to `View`.

```typescript
_toggle() {
  this.data.checked = !this.data.checked;
  this.element().classList.toggle('checked');
  this.element().dispatchEvent(
    new CustomEvent('checkable:change', { bubbles: true })
  );
}
```

In `Enable`, `this.view.data === this.data` and `this.view.element() === this.element()`, allowing for simplification of the toggle functionality. This facilitates the reuse of code originally written for `View` within `Enable`.

## Extending Views without Data Sharing

Using `Deletable`, you can easily create a `BallView` that gets removed on click. `class Deletable extends Enable` is equivalent to `class Deletable extends Enable<object>`.

```typescript
class Deletable extends Enable {
  override onRender() {
    this.delegate('mousedown', '.remove-target', this.remove);
  }

  remove() {
    this.element().remove();
  }
}

type Ball = {
  color: string;
};

class BallView extends View<Ball> {
  deletable = new Deletable(this).init();

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
          class="remove-target"
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

[{ color: 'red' }, { color: 'green' }, { color: 'blue' }]
  .map((ball) => new BallView(ball))
  .forEach((ballView) => {
    document.body.appendChild(ballView.render());
  });
```

`Enable.prototype.onRender` executes when the `element` of the received `View` is created.

## EnableViewInterface

In the code above, we agreed on the class name `remove-target` for the element triggering deletion. Using an `interface` allows for a more scalable and secure abstraction of communications between objects.

```typescript
interface DeletableViewInterface extends View<object> {
  readonly targetClassName: string;
}

export class Deletable extends Enable {
  constructor(public override view: DeletableViewInterface) {
    super(view);
  }
  
  override onRender() {
    this.delegate('mousedown', `.${this.view.targetClassName}`, this.remove);
  }

  remove() {
    this.element().remove();
  }
}

export class BallView extends View<Ball> {
  deletable = new Deletable(this);

  readonly targetClassName = 'target';

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
```

Now, if `BallView` does not implement `targetClassName`, it will throw an error such as `TS2345: Argument of type this is not assignable to parameter of type DeletableViewInterface. Property targetClassName is missing in type BallView but required in type DeletableViewInterface`, guiding developers to implement it mandatorily.

Here's an example of object communication, where `Deletable` asks `View` if it can remove, and an interface with implementation was added.

```typescript
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

export type Ball = {
  color: string;
  count: number;
};

export class BallView extends View<Ball> {
  deletable = new Deletable(this).init();

  readonly targetClassName = 'target';

  canRemove() {
    return confirm('Would you like to delete this?');
  }

  override template() {
    return html` ... `;
  }
}
```

## Multiple Enables

Using `Enable`, you can assign multiple functionalities to a single `View`.

```typescript
class Movable extends Enable {
  override onRender() {
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

type Ball = {
  color: string;
};

export class BallView extends View<Ball> {
  movable = new Movable(this);
  deletable = new Deletable(this);

  readonly targetClassName = 'target';

  canRemove() {
    return confirm('Would you like to delete this?');
  }

  override template() {
    return html` ... `;
  }
}
```

Now, after being drawn on the screen, the `BallView` moves horizontally back and forth, and can be removed upon clicking. Let's slightly modify the implementation of `canRemove` by adding a `count` to `Ball`.

```typescript
export type Ball = {
  color: string;
  count: number;
};

export class BallView extends View<Ball> {
  movable = new Movable(this);
  deletable = new Deletable(this);

  readonly targetClassName = 'target';

  canRemove() {
    return --this.data.count === 0;
  }

  override template() {
    return html` ... `;
  }
}

const balls = [
  { color: 'red', count: 3 },
  { color: 'green', count: 2 },
  { color: 'blue', count: 1 },
];
balls
  .map((ball) => new BallView(ball))
  .forEach((ballView) => {
    document.body.appendChild(ballView.render());
  });
```

A simple game has now been created where a horizontally moving ball needs to be clicked multiple times to burst.