# Event Handling

The View and Enable classes inherit event handling methods implemented in the Base class.

## addEventListener()

```
addEventListener<T extends new (...args: any[]) => Event>(
  eventType: T,
  listener: (this: this, ev: InstanceType<T>) => any,
  options?: boolean | AddEventListenerOptions,
): this;
addEventListener<K extends keyof HTMLElementEventMap>(
  eventType: K,
  listener: (this: this, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions,
): this;
addEventListener(
  eventType: string,
  listener: (this: this, ev: Event) => any,
  options?: boolean | AddEventListenerOptions,
): this;
```

The View and Enable classes provide an extended `addEventListener` method. `view.addEventListener()` registers a function and executes it bound to `this` as `view` when an event occurs. All other behaviors are identical to the Web API’s `addEventListener`. ([Tutorial - Handling Events](/tutorial/event.html))

## removeEventListener()

```
removeEventListener<T extends new (...args: any[]) => Event>(
  eventType: T,
  listener: (this: this, ev: InstanceType<T>) => any,
  options?: boolean | AddEventListenerOptions,
): this;
removeEventListener<K extends keyof HTMLElementEventMap>(
  eventType: K,
  listener: (this: this, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | EventListenerOptions,
): this;
removeEventListener(
  eventType: string,
  listener: (this: this, ev: Event) => any,
  options?: boolean | EventListenerOptions,
): this;
```

## delegate()

```
delegate<K extends new (...args: any[]) => Event, T extends new (...args: any[]) => Base>(
  eventClass: K,
  View: T,
  listener: (this: this, e: InstanceType<K>, targetView: InstanceType<T>) => void,
): this;
delegate<K extends keyof HTMLElementEventMap>(
  eventType: K,
  selector: string,
  listener: (this: this, e: HTMLElementEventMap[K]) => void,
): this;
delegate(eventType: string, selector: string, listener: (this: this, ev: Event) => any): this;
```

([Tutorial - Event Delegation](/tutorial/event.html#event-delegation))

## dispatchEvent()

```
dispatchEvent(event: Event): this;
dispatchEvent<T extends new (...args: any[]) => Event, U extends CustomEventInitFromClass<T>>(
  event: T,
  eventInitDict: U,
): this;
```

## @on decorator

The `@on` decorator allows for more concise code.

```typescript
export class CheckboxView extends View<{ checked: boolean }> {
  override onRender() {
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

If only one argument is passed to the `@on` decorator, it uses `addEventListener`. If a second argument, a CSS selector, is provided to `@on`, it uses `delegate`.

```typescript
class MyView extends View<object> {
  override onRender() {
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