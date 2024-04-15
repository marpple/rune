# Handling Events

## Event Registration

`onRender()` is executed right after the `element` is created, making it the ideal time to register events. `this.element()` returns the `HTMLElement` associated with the `View`, and events can be registered using the Web API’s `addEventListener()`.

```typescript
export class ColorCheckboxView extends View<Color> {
  override template(color: Color) {
    return html` <li class="${color.checked ? 'checked' : ''}">${new ColorView(color)}</li> `;
  }

  override onRender() {
    this.element().addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}
```

While the code above is not bad, if `ColorCheckboxView` instances increase, the registered event listeners will also multiply. To prevent this, `View` provides an extended method for `addEventListener`.

```typescript
export class ColorCheckboxView extends View<Color> {
  ...
  override onRender() {
    this.addEventListener('click', this.toggle);
  }

  toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}
```

`view.addEventListener()` registers a function and binds it to `this` as `view` when the event triggers. In the code above, `ColorCheckboxView.prototype.toggle` is a single function, making it efficient even when multiple ColorCheckboxViews are created.

## Event Registration Decorator

The `@on` decorator allows for more concise code writing. `@on('click')` replaces the code written inside `onRender`.

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

## Event Delegation

As shown above, `dispatchEvent()` can be used to trigger events. `checkbox:` is a type of convention to avoid duplication and has no functionality. Events can also be listened to using the instance method `delegate()` of `View` as shown below.

```typescript
export class ColorCheckboxListView extends View<Color[]> {
  ...
  override onRender() {
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

If only one argument is provided to the `@on` decorator, it uses `addEventListener`, and if a CSS selector is provided as a second argument to `@on`, it uses `delegate`. `Delegate` can also be written concisely as a decorator like below.

```typescript
class MyView extends View<{ val: number }> {
  override onRender() {
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

## Wrapping Up ColorCheckboxListView

```typescript
export class ColorCheckboxListView extends View<Color[]> {
  override template(colors: Color[]) {
    return html`
      <ul>
        ${colors.map((color) => new ColorCheckboxView(color))}
      </ul>
    `;
  }

  override onRender() {
    this.delegate('checkbox:change', '.ColorCheckboxView', this.onChange);
  }

  onChange() {
    this.element().dispatchEvent(new CustomEvent('checkboxlist:change', { bubbles: true }));
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