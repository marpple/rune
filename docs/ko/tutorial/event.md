# Event 다루기

## 이벤트 등록

`onMount()`는 `document.body` 내에 렌더링된 직후 실행되며 이벤트를 등록하기 적합한 시점입니다. `this.element()`는 `View`와 매핑된 `HTMLElement`를 리턴하며 Web API의 `addEventListener()`를 이용하여 이벤트를 등록할 수 있습니다.

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

위 코드는 나쁘지 않지만 `ColorCheckboxView`가 매우 많아질 경우 등록된 이벤트 리스너도 함께 많아지게 됩니다. 이를 방지하기 위해 `View`는 `addEventListener`를 확장한 메서드를 제공합니다.

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

`view.addEventListener()`는 받은 함수를 등록해두었다가 이벤트가 실행되었을 때 `this`에 `view`를 바인딩하여 실행합니다. 위 코드에서 `ColorCheckboxView.prototype.toggle`은 하나의 함수이기 때문에 여러개의 ColorCheckboxView가 만들어지더라도 효율적입니다. 혹은 `'toggle'`과 같이 메서드명을 전달해도 됩니다.

## 이벤트 등록 데코레이터

`@on` 데코레이터를 사용하면 보다 간결하게 코드를 작성할 수 있습니다. `@on('click')`은 `onMount` 내 작성했던 코드를 대체합니다.

```typescript
export class ColorCheckboxView extends View<Color> {
  @on('click')
  private _toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}
```

## 커스텀 이벤트 디스패치

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

## 이벤트 델리게이트

위와 같이`dispatchEvent()`를 사용하여 이벤트를 발생시킬 수 있습니다. `checkbox:`는 중복을 피하기위한 일종의 컨벤션이며 기능은 없습니다. 또한 아래처럼 `View`의 인스턴스 메서드 `delegate()`를 통해 이벤트를 들을 수 있습니다.

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

`@on` 데코레이터에 인자를 하나만 전달하면 `addEventListener`를 사용하고, `@on`에 두 번째 인자로 CSS 셀렉터를 함께 전달하면 `delegate`를 사용합니다. `delegate`도 데코레이터로 아래처럼 간결하게 작성할 수 있습니다.

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

## ColorCheckBoxListView 마무리

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
