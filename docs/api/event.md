---
outline: deep
---

# Event handling

The View class and the Enable class inherit event handling methods implemented in the Base class.

## addEventListener()

```
addEventListener<K extends keyof HTMLElementEventMap, M extends keyof this>(
  eventType: K,
  listener: M,
  options?: boolean | AddEventListenerOptions,
): this;
addEventListener<M extends keyof this>(
  eventType: string,
  listener: M,
  options?: boolean | AddEventListenerOptions,
): this;
addEventListener<K extends keyof HTMLElementEventMap>(
  eventType: K,
  listener: (this: this, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): this;
addEventListener<T extends Event>(
  eventType: string,
  listener: (this: this, ev: T) => any,
  options?: boolean | AddEventListenerOptions,
): this;
```

The View class and the Enable class provide extended methods for `addEventListener`. When you use `view.addEventListener()`, the provided function is registered and executed with `this` bound to the `view` when the event occurs. All other behaviors are consistent with the Web API's `addEventListener`. ([Tutorial - Handling Events](/tutorial/event.html))

## removeEventListener()

```
removeEventListener<
  K extends keyof HTMLElementEventMap,
  M extends keyof this,
>(eventType: K, listener: M, options?: boolean | EventListenerOptions): this;
removeEventListener<M extends keyof this>(
  eventType: string,
  listener: M,
  options?: boolean | EventListenerOptions,
): this;
removeEventListener<K extends keyof HTMLElementEventMap>(
  eventType: K,
  listener: (this: this, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | EventListenerOptions,
): this;
removeEventListener<T extends Event>(
  eventType: string,
  listener: (this: this, ev: T) => any,
  options?: boolean | EventListenerOptions,
): this;
```

## delegate()

```
delegate<K extends keyof HTMLElementEventMap, M extends keyof this>(
  eventType: K,
  selector: string,
  listener: M,
): this;
delegate<M extends keyof this>(
  eventType: string,
  selector: string,
  listener: M,
): this;
delegate<K extends keyof HTMLElementEventMap>(
  eventType: K,
  selector: string,
  listener: (this: this, e: HTMLElementEventMap[K]) => void,
): this;
delegate<T extends Event>(
  eventType: string,
  selector: string,
  listener: (this: this, ev: T) => any,
): this;
```

([Tutorial - Event Delegation](/tutorial/event.html#event-delegate))

## @on decorator

Using the `@on` decorator allows for more concise code writing.

```typescript
export class CheckboxView extends View<{ checked: boolean }> {
  override onMount() {
    this.addEventListener('click', () => this._toggle());
  }

  private _toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}

export class CheckboxView extends View<{ checked: boolean }> {
  @on('click')
  private _toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}
```

When passing only one argument to the `@on` decorator, it utilizes `addEventListener`, while passing a second argument, a CSS selector, to `@on` indicates the use of `delegate`.

```typescript
class MyView extends View<object> {
  override onMount() {
    this.delegate('click', 'button', () => this.remove());
  }

  remove() {
    this.element().remove();
  }
}

class MyView extends View<object> {
  @on('click', 'button')
  remove() {
    this.element().remove();
  }
}
```
