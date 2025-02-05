# Handling Events

## Event Registration

`onRender()` is executed immediately after the `element` is created, making it a good time to register events. `this.element()` returns the `HTMLElement` mapped to the `View`, and you can register events using the Web API’s `addEventListener()`.

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

The above code is fine, but if there are many `ColorCheckboxView` instances, there will also be many registered event listeners. To prevent this, `View` provides an extended method for `addEventListener`.

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

`view.addEventListener()` registers the given function so that when the event is triggered, it is bound to `this` as the `view`. In the code above, `ColorCheckboxView.prototype.toggle` is a single function, so even if multiple instances of `ColorCheckboxView` are created, it remains efficient.

## Event Registration Decorator

Using the `@on` decorator allows for more concise code. `@on('click')` replaces what was written inside `onRender`.

```typescript
export class ColorCheckboxView extends View<Color> {
  @on('click')
  private toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}
```

## Dispatching Custom Events

```typescript
export class ColorCheckboxView extends View<Color> {
  ...
  @on('click')
  private toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
    this.element().dispatchEvent(
      new CustomEvent('checkbox:change', { bubbles: true })
    );
  }
}
```

## Event Delegation

As shown above, you can trigger an event using `dispatchEvent()`. Here, `checkbox:` is a kind of convention to avoid duplication and does not have any special functionality. In addition, you can listen for the event via the `delegate()` method of `View` instances, as shown below.

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

If you pass only one argument to the `@on` decorator, it uses `addEventListener`; if you pass a CSS selector as the second argument to `@on`, it uses `delegate`. You can also write `delegate` succinctly with the decorator, as shown below.

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

## Completing ColorCheckBoxListView

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