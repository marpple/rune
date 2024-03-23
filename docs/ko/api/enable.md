# Enable class

Rune은 하나의 `View`에 여러개의 기능을 부여하는 Enable 패턴을 제공합니다. `Enable`을 이용하면 동작이나 기능을 모듈화하고 `View`를 확장하기 용이한 개념이자 클래스입니다. `Enable`은 템플릿이 없는 `View`와 같다고 생각하면 쉬우며 `View`를 받아 기능을 확장하는 패턴을 보여줍니다.

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
    this.view.element().dispatchEvent(
      new CustomEvent('checkable:change', { bubbles: true })
    );
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
      <div class="${color.checked ? 'checked' : ''}" style="background-color: ${color.code}">
      </div>
    `;
  }
}
```

## element()

`element(): HTMLElement;`

생성시 인자로 받은 `view`의 `view.element()` 입니다.

## view

`public view: ExtendExtraInterface<View<T>, E>;`

생성시 인자로 받은 `view`입니다.

## data

`public data: T;`

생성시 인자로 받은 `view`의 `view.data`입니다.

## onMount()

`enable.init()`을 실행하면 `enable`을 생성시 인자로 받았던 `view`의 `element`가 `document`에 `append` 되었을 때 `onMount()`가 실행됩니다. 이미 `append` 되어있던 상태라면 `init()` 실행시 바로 `onMount()`가 실행됩니다.

## Event handling

Enable class도 View class 처럼 Base class로부터 Event handling 메서드들을 상속 받았습니다. ([API - Event handling 참고](/ko/api/event.html))

