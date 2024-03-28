# Enable class

Rune provides the Enable pattern, which allows multiple functionalities to be added to a single View. Enabling allows for modularizing behavior or features and is a concept and class that facilitates extending Views. Think of Enable as similar to a View without a template, making it easy to understand, and it demonstrates a pattern of extending functionality by taking a View.

## Definition

```typescript
import { Enable } from 'rune-ts';

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
```

## Create & init()

```
type ExtendExtraInterface<T, E> = E extends null ? T : T & E;

new (view: ExtendExtraInterface<View<T>, E>) => Enable<T, E>;
```

```typescript
type Color = {
  code: string;
  checked?: boolean;
};

class CheckableColorView extends View<Color> {
  checkable = new Checkable(this).init();

  override template(color: Color) {
    return html`
      <div class="${color.checked ? 'checked' : ''}" style="background-color: ${color.code}"></div>
    `;
  }
}
```

## element()

`element(): HTMLElement;`

Returns the HTMLElement associated with the `view` received as an argument during creation.

## view

`public view: ExtendExtraInterface<View<T>, E>;`

The `view` received as an argument during creation.

## data

`public data: T;`

The `view.data` associated with the `view` received as an argument during creation.

## onMount()

When `enable.init()` is called, `onMount()` is executed when the `element` of the `view` passed as an argument during creation is appended to the `document`. If the element is already appended, `onMount()` is executed immediately upon calling `init()`.

## Event handling

Enable class inherits Event handling methods from the Base class, just like the View class. (Refer to [API - Event handling](/api/event.html))
