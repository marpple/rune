# Event handling

## Event Registration

`onMount()` is executed immediately after rendering within `document.body`, making it an appropriate time to register events. `this.element()` returns the `HTMLElement` associated with the `View`, enabling event registration using Web API's `addEventListener()`.

```typescript

export class ColorCheckboxView extends View<Color> {
  override template(color: Color) {
    return html`
      <li class="${color.checked ? 'checked' : ''}">
        ${new ColorView(color)}
      </li>
    `;
  }

  override onMount() {
    this.element().addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}
```

The above code is not bad, but if there are many instances of `ColorCheckboxView`, there will also be a lot of registered event listeners. To prevent this, the `View` provides an extended method for `addEventListener`.

```typescript
export class ColorCheckboxView extends View<Color> {
  ...
  override onMount() {
    this.addEventListener('click', this.toggle);
    // or this.addEventListener('click', 'toggle');
  }

  toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}
```

`view.addEventListener()` registers the provided function and binds `view` to `this` when the event is triggered. In the above code, `ColorCheckboxView.prototype.toggle` is a single function, so it remains efficient even when multiple `ColorCheckboxView` instances are created. Alternatively, you can pass the method name like `'toggle'`.

## Event Registration Decorator

Using the `@on` decorator allows for a more concise code. `@on('click')` replaces the code written within `onMount`.

```typescript
export class ColorCheckboxView extends View<Color> {
  @on('click')
  private _toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}
```

## Custom Event Dispatch

```typescript
export class ColorCheckboxView extends View<Color> {
  ...
  @on('click')
  private _toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
    this.element().dispatchEvent(
      new CustomEvent('checkbox:change', { bubbles: true })
    );
  }
}
```

## Event Delegate

As shown above, you can trigger events using `dispatchEvent()`. `checkbox:` is a kind of convention to avoid duplication and doesn't have any functionality. Additionally, you can listen to events using the instance method `delegate()` of the `View` as follows.

```typescript
export class ColorCheckboxListView extends View<Color[]> {
  ...
  override onMount() {
    this.delegate('checkbox:change', '.ColorCheckboxView', (e) => {
      console.log(e.target);
      // <li class="ColorCheckboxView checked">...</li>
    });

    this.delegate('click', '.ColorCheckboxView', (e) => {
      console.log(e.currentTarget);
      // <li class="ColorCheckboxView checked">...</li>
      console.log(e.target);
      // <div class="ColorView" style="background-color: yellow">...</div>
    });
  }
}
```

When passing only one argument to the `@on` decorator, it utilizes `addEventListener`, and when passing a CSS selector as the second argument to `@on`, it utilizes `delegate`. You can also write `delegate` as a decorator for convenience.

```typescript
class MyView extends View<{ val: number }> {
  override onMount() {
    this.delegate('click', '.target', () => this.remove());
  }
  
  remove() {
    this.element().remove();
  }
}

class MyView extends View<{ val: number }> {
  @on('click', '.target')
  remove() {
    this.element().remove();
  }
}
```

## ColorCheckBoxListView

```typescript
export class ColorCheckboxListView extends View<Color[]> {
  override template(colors: Color[]) {
    return html`
      <ul>
        ${colors.map((color) => new ColorCheckboxView(color))}
      </ul>
    `;
  }

  override onMount() {
    this.delegate('checkbox:change', '.ColorCheckboxView', this.onChange);
  }

  onChange() {
    this.element().dispatchEvent(
      new CustomEvent('checkboxlist:change', { bubbles: true }),
    );
  }

  checkedColors(): Color[] {
    return this.data.filter(({ checked }) => checked);
  }
}

const colorCheckboxListView = new ColorCheckboxListView([
  { code: 'red' },
  { code: 'green', checked: true },
  { code: 'blue' },
  { code: 'yellow' },
]);

document.body.appendChild(colorCheckboxListView.render());

colorCheckboxListView.addEventListener('checkboxlist:change', function () {
  console.log(this.checkedColors().map(({ code }) => code));
  // ['green', 'blue']
});
```
