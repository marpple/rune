# View

## 간단하게 컴포넌트 만들기

rune에서는 `View` 클래스를 상속하여 컴포넌트를 만듭니다.

```typescript
import { View, html } from 'rune-ts';

export type Color = {
  code: string;
};

export class ColorView extends View<Color> {
  template({ code }: Color) {
    return html`
      <div style="background-color: ${code}"></div>
    `;
  }
}

const colorView = new ColorView({ code: 'red' });
colorView.toHtml();
```

`colorView.toHtml()`은 아래와 같은 HTML 문자열을 리턴합니다.

```html
<div class="ColorView" style="background-color: red"></div>
```

## 데이터 변경하기

colorView의 데이터를 변경한 후 다시 html 문자열을 얻을 수 있습니다.

```typescript
colorView.data.code = 'blue';
colorView.toHtml();
```

```html
<div class="ColorView" style="background-color: blue"></div>
```

같은 코드를 메서드 체이닝으로 표현할 수 있습니다.

```typescript
colorView.setData({ code: 'blue' }).toHtml();
```

## HTMLElement 생성하기

`colorView.render();` 를 실행하면 HTMLElement 생성하여 리턴합니다. `render` 메서드는 브라우저단에서만 사용하는 것을 권장합니다.

```typescript
document.body.appendChild(
  new ColorView({ code: 'pink' }).render()
);
```
```html
<html>
...
<body>
...
<div class="ColorView" style="background-color: pink"></div>
</body>
</html>
```

## 중첩 컴포넌트 만들기

템플릿 리터럴을 이용하여 중첩 컴포넌트를 구현할 수 있습니다.

```typescript
export type Color = {
  code: string;
  checked?: boolean;
};

export class ColorCheckboxView extends View<Color> {
  template(color: Color) {
    return html`
      <li class="${color.checked ? 'checked' : ''}">
        ${new ColorView(color)}
      </li>
    `;
  }
}

new ColorCheckboxView(
  { code: 'yellow', checked: true }
).toHtml();
```

```html
<li class="ColorCheckboxView checked">
  <div class="ColorView" style="background-color: green"></div>
</li>
```
이와 같이 `ColorView`를 가지는 `ColorCheckboxView`를 만들 수 있습니다. 아래는 배열을 전달하여 여러개의 `ColorCheckboxView`를 가지는 `ColorCheckboxListView`를 만드는 예시입니다.

```typescript
export class ColorCheckboxListView extends View<Color[]> {
  template(colors: Color[]) {
    return html`
      <ul>
        ${colors.map(
          (color) => new ColorCheckboxView(color)
        )}
      </ul>
    `;
  }
}

document.body.appendChild(
    new ColorCheckboxListView([
      { code: 'red' },
      { code: 'green', checked: true },
      { code: 'blue' },
      { code: 'yellow' },
    ]).render(),
);
```



```html
<ul class="ColorCheckboxListView">
  <li class="ColorCheckboxView">
    <div class="ColorView" style="background-color: red"></div>
  </li>
  <li class="ColorCheckboxView checked">
    <div class="ColorView" style="background-color: green"></div>
  </li>
  ...
</ul>
```
## 이벤트 할당

`onMount()`는 `document.body` 내에 렌더링된 직후 실행되며 이벤트를 등록하기 적합한 시점입니다. `this.element()`는 `View`와 매핑된 `HTMLElement`를 리턴하며 Web API의 `addEventListener()`를 이용하여 이벤트를 등록할 수 있습니다.

```typescript

export class ColorCheckboxView extends View<Color> {
  template(color: Color) {
    return html`
      <li class="${color.checked ? 'checked' : ''}">
        ${new ColorView(color)}
      </li>
    `;
  }

  onMount() {
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
  onMount() {
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
  toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
  }
}
```


## 커스텀 이벤트 디스패치와 이벤트 델리게이트

```typescript
export class ColorCheckboxView extends View<Color> {
  ...
  @on('click')
  toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
    this.element().dispatchEvent(
      new CustomEvent('checkbox:change', { bubbles: true })
    );
  }
}
```

위와 같이`dispatchEvent()`를 사용하여 이벤트를 발생시킬 수 있습니다. `checkbox:`는 중복을 피하기위한 일종의 컨벤션이며 기능은 없습니다. 또한 아래처럼 `View`의 인스턴스 메서드 `delegate()`를 통해 이벤트를 들을 수 있습니다.

```typescript
export class ColorCheckboxListView extends View<Color[]> {
  ...
  onMount() {
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

class MyView extends View<number> {
  onMount() {
    this.delegate('click', '.target', () => this.remove());
  }
  
  remove() {
    this.element().remove();
  }
}

class MyView extends View<number> {
  @on('click', '.target')
  remove() {
    this.element().remove();
  }
}
```

## ColorCheckBoxListView 마무리

```typescript
export class ColorCheckboxListView extends View<Color[]> {
  template(colors: Color[]) {
    return html`
      <ul>
        ${colors.map((color) => new ColorCheckboxView(color))}
      </ul>
    `;
  }

  onMount() {
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
