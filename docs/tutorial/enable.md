# Enable Pattern

Rune provides the Enable pattern, which allows multiple functionalities to be added to a single `View`. Enable serves as a concept and a class that modularizes behavior or functionality and facilitates extending `View`. Think of Enable as a `View` without a template, demonstrating a pattern for extending functionality based on a `View`.

## Sharing View and Data with Enable

Enable is designed to share both `View` and data. In TypeScript, you can pass the same type to `Enable<T>`'s type argument as the `view.data` of `View<T>`. When utilizing Enable with the previously created `CheckboxView`, you can implement it using the following pattern. `Checkable<T extends CheckableData>` constrains the type of `View`'s data passed when creating `Checkable`.

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

The `Enable.prototype.onMount` function is executed when the `element` of the `View` passed as an argument is added to the browser (appended). Additionally, like `View`, `Enable` also has an `addEventListener` method.

```typescript
_toggle() {
  this.data.checked = !this.data.checked;
  this.element().classList.toggle('checked');
  this.element().dispatchEvent(
    new CustomEvent('checkable:change', { bubbles: true })
  );
}
```

In `Enable`, since `this.view.data === this.data` and `this.view.element() === this.element()`, the toggle section can be modified as shown in the code above. This facilitates the process of transferring the code written for `View` to `Enable` to create reusable code.

## Extending Views without Data Sharing

Using `Deletable`, you can easily create a `BallView` that is deleted when clicked. `class Deletable extends Enable` is equivalent to `class Deletable extends Enable<object>`.

```typescript
class Deletable extends Enable {
  override onMount() {
    this.delegate('mousedown', '.remove-target', 'remove');
  }

  remove() {
    this.element().remove();
  }
}

type Ball = {
  color: string;
};

class BallView extends View<Ball> {
  deletable = new Deletable(this);

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

## EnableViewInterface

In the above code, we've agreed to use the class name "remove-target" for elements that trigger deletion in `Deletable`. By utilizing interfaces, we can further abstract and safely extend the protocol of communication between objects with greater scalability.

```typescript
interface DeletableViewInterface extends View<object> {
  readonly targetClassName: string;
}

export class Deletable extends Enable {
  constructor(public override view: DeletableViewInterface) {
    super(view);
  }

  override onMount() {
    this.delegate('mousedown', `.${this.view.targetClassName}`, 'remove');
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

Now, if `BallView` does not implement `targetClassName`, developers will receive an error message like "S2345: Argument of type this is not assignable to parameter of type DeletableViewInterface. Property targetClassName is missing in type BallView but required in type DeletableViewInterface." This guides developers to implement it.

Below is an example of inter-object communication, where `Deletable` asks `View` if it can be removed and deletes accordingly, with interfaces and implementations added:

```typescript
interface DeletableViewInterface extends View<object> {
  targetClassName: string;
  canRemove(): boolean;
}

export class Deletable extends Enable {
  constructor(public override view: DeletableViewInterface) {
    super(view);
  }

  override onMount() {
    this.delegate('mousedown', `.${this.view.targetClassName}`, 'remove');
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
  deletable = new Deletable(this);

  readonly targetClassName = 'target';

  canRemove() {
    return confirm('삭제하시겠습니까?');
  }

  override template() {
    return html` ... `;
  }
}
```

## Multiple Enables

With `Enable`, you can bestow two or more functionalities onto a single `View`.

```typescript
class Movable extends Enable {
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

type Ball = {
  color: string;
};

export class BallView extends View<Ball> {
  movable = new Movable(this);
  deletable = new Deletable(this);

  readonly targetClassName = 'target';

  canRemove() {
    return confirm('삭제하시겠습니까?');
  }

  override template() {
    return html` ... `;
  }
}
```

Now, `BallView` moves horizontally after being rendered on the screen and gets deleted when clicked. Let's add a `count` to the `Ball` and slightly modify the `canRemove` implementation.

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

Now, a simple game is completed where you have to click multiple times on the balls moving horizontally to pop them.
