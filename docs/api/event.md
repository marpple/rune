---
outline: deep
---

# Event handling

View class, Enable class는 Base class에 구현된 Event handling 관련 메서드들을 상속 받았습니다.

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

View class와 Enable class는 `addEventListener`를 확장한 메서드를 제공합니다. `view.addEventListener()`는 받은 함수를 등록해두었다가 이벤트가 실행되었을 때 `this`에 `view`를 바인딩하여 실행합니다. 그 외 모든 동작은 Web API의 `addEventListener`와 동일합니다. ([Tutorial - Event 다루기](/tutorial/event.html))

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

([Tutorial - 이벤트 델리게이트](/tutorial/event.html#이벤트-델리게이트))

## @on decorator

`@on` 데코레이터를 사용하면 보다 간결하게 코드를 작성할 수 있습니다. 

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

`@on` 데코레이터에 인자를 하나만 전달하면 `addEventListener`를 사용하고, `@on`에 두 번째 인자로 CSS 셀렉터를 함께 전달하면 `delegate`를 사용합니다. 

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


