# Enable Class

Rune provides an Enable pattern that assigns multiple functionalities to a single `View`. Utilizing `Enable` allows for the modularization of actions or functionalities and facilitates the extension of `View`, making it a useful concept and class. Think of `Enable` as a `View` without a template, which receives a `View` and extends its functionalities.

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

## Create

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
  checkable = new Checkable(this);

  override template(color: Color) {
    return html`
      <div class="${color.checked ? 'checked' : ''}" style="background-color: ${color.code}"></div>
    `;
  }
}
```

## element()

`element(): HTMLElement;`

This is the `view.element()` of the `view` received as an argument during creation.

## view

`public view: ExtendExtraInterface<View<T>, E>;`

This is the `view` received as an argument during creation.

## data

`public data: T;`

This is the `view.data` of the `view` received as an argument during creation.

## onRender()

The `onRender()` method executes when the `element` of the view received as an argument during creation is created. If the `view`'s `element` is already created, `onRender()` executes immediately.

## onMount()

The `onMount()` method executes when the `element` of the view received as an argument during creation is added to the `document.body`. If it is already added, `onMount()` executes immediately.

## onUnmount()

The `onUnmount()` method executes when the `element` of the view received as an argument during creation is removed from the `document.body`.

## Event Handling

Like the View class, the Enable class also inherits event handling methods from the Base class. ([API - Event Handling](/api/event.html))