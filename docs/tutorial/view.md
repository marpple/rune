# View 만들기

## 간단하게 컴포넌트 만들기

Rune에서는 `View` 클래스를 상속하여 컴포넌트를 만듭니다.

```typescript
import { View, html } from 'rune-ts';

export type Color = {
  code: string;
};

export class ColorView extends View<Color> {
  override template({ code }: Color) {
    return html`
      <div style="background-color: ${code}"></div>
    `;
  }
}

const colorView = new ColorView({ code: 'red' });
colorView.toHtml();
```

`colorView.toHtml()`은 HTML 문자열을 리턴합니다.

```html
<div class="ColorView" style="background-color: red"></div>
```

## 데이터 변경하기

colorView의 데이터를 변경한 후 다시 HTML 문자열을 얻을 수 있습니다.

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
  override template(color: Color) {
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
  override template(colors: Color[]) {
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

