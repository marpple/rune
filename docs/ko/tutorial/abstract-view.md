# View 추상화

## 체크하는 기능을 분리하기

위의 `ColorCheckboxListView`와 `ColorCheckboxView`는 체크할 수 있다는 속성을 가지고 있습니다. 체크 기능을 추상화한 `View`를 준비하면 체크 기능이 적용된 더 많은 `View`를 보다 쉽게 만들 수 있습니다.

먼저 `ColorView`, `ColorCheckboxListView`, `ColorCheckboxView`의 코드를 다시보면 아래와 같습니다.

```typescript
export type Color = {
  code: string;
  checked?: boolean;
};

export class ColorView extends View<Color> {
  override template({ code }: Color) {
    return html` <div style="background-color: ${code}"></div> `;
  }
}

export class ColorCheckboxView extends View<Color> {
  override template(color: Color) {
    return html` <li class="${color.checked ? 'checked' : ''}">${new ColorView(color)}</li> `;
  }

  @on('click')
  private _toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
    this.element().dispatchEvent(new CustomEvent('checkbox:change', { bubbles: true }));
  }
}

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
```

## 추상화된 클래스와 제네릭

`ColorCheckboxListView`, `ColorCheckboxView`를 아래와 같은 방법으로 추상화할 수 있습니다. 이전 코드와 비교하여 변한 부분을 확인해보세요.

```typescript
export type CheckboxData = {
  checked?: boolean;
};

export class CheckboxView<T extends CheckboxData> extends View<T> {
  tagName: string = 'li';
  SubView: { new (data: T): View<T> } | null = null;

  override template({ checked }: T) {
    return html`
      <${this.tagName} class="${checked ? 'checked' : ''}">
        ${this.createSubView()}
      </${this.tagName}>
    `;
  }

  createSubView(): View<T> | string {
    return this.SubView ? new this.SubView(this.data) : '';
  }

  @on('click')
  private _toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
    this.element().dispatchEvent(new CustomEvent('checkbox:change', { bubbles: true }));
  }
}

export class CheckboxListView<T extends CheckboxData> extends View<T[]> {
  tagName: string = 'ul';
  CheckboxView: { new (data: T): CheckboxView<T> } = CheckboxView;

  override template(checkBoxDatas: T[]) {
    return html`
      <${this.tagName}>
        ${checkBoxDatas.map((checkBoxData) => this.createCheckboxView(checkBoxData))}
      </${this.tagName}>
    `;
  }

  createCheckboxView(data: T): CheckboxView<T> {
    return new this.CheckboxView(data);
  }

  @on('checkbox:change', '> *')
  onChange() {
    this.element().dispatchEvent(new CustomEvent('checkboxlist:change', { bubbles: true }));
  }

  checkedData() {
    return this.data.filter(({ checked }) => checked);
  }
}
```

제네릭을 활용하여 `CheckboxListView`, `CheckboxView`를 확장할 코드들에서 `data`의
타입을 추론할 수 있도록 하였습니다. `CheckboxView<T extends CheckboxData>`는 `CheckboxView`을 확장할 새로운 `View`의 `data`의 타입을 제약합니다. 또한 `tagName`, `SubView`, `CheckboxView` 등을 확장할 수 있도록 프로퍼티를 추가했습니다.

## 상속으로 확장하기

`CheckboxView`와 `CheckboxListView`를 상속하여 `ColorCheckboxListView`, `ColorCheckboxView`를 다시 구현하면 아래와 같습니다.

```typescript
export class ColorCheckboxView extends CheckboxView<Color> {
  SubView = ColorView;
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  CheckboxView = ColorCheckboxView;
}
```

동일하게 사용할 수 있습니다.

```typescript
const colorCheckboxListView = new ColorCheckboxListView([
  { code: 'red' },
  { code: 'green', checked: true },
  { code: 'blue' },
  { code: 'yellow' },
]);

document.body.appendChild(colorCheckboxListView.render());

colorCheckboxListView.addEventListener('checkboxlist:change', function () {
  console.log(this.checkedData().map(({ code }) => code));
  // ['green', 'blue']
});
```

## 1급 객체 활용

`ColorView`를 포함하여 코드를 다시 보겠습니다.

```typescript
export type Color = {
  code: string;
  checked?: boolean;
};

export class ColorView extends View<Color> {
  override template({ code }: Color) {
    return html` <div style="background-color: ${code}"></div> `;
  }
}

export class ColorCheckboxView extends CheckboxView<Color> {
  SubView = ColorView;
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  CheckboxView = ColorCheckboxView;
}
```

만일 `ColorCheckboxView`를 사용하지 않는다면 아래와 같이 코드를 작성할 수 있습니다.

```typescript
export class ColorView extends View<Color> {
  template({ code }: Color) {
    return html` <div style="background-color: ${code}"></div> `;
  }
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  CheckboxView = class ColorCheckboxView extends CheckboxView<Color> {
    SubView = ColorView;
  };
}
```

마찬가지로 `ColorView`도 사용하지 않는다면 아래와 같이 구현할 수 있습니다.

```typescript
export class ColorCheckboxListView extends CheckboxListView<Color> {
  CheckboxView = class ColorCheckboxView extends CheckboxView<Color> {
    SubView = class ColorView extends View<Color> {
      template({ code }: Color) {
        return html` <div style="background-color: ${code}"></div> `;
      }
    };
  };
}
```

## template으로 쉽게 추상화하기

위에서 `CheckboxView`를 구현한 방식은 타입 정의를 잘해주어야하기 때문에 추상화가 약간 어렵습니다. Rune의 템플릿 함수를 활용하면 아래처럼 좀 더 쉽게 추상화할 수 있습니다.

```typescript
export class CheckboxView<T extends CheckboxData> extends View<T> {
  tagName: string = 'li';

  override template({ checked }: T) {
    return html`
      <${this.tagName} class="${checked ? 'checked' : ''}">
        ${this.subViewTemplate()}
      </${this.tagName}>
    `;
  }

  subViewTemplate() {
    return html``;
  }
}

export class ColorCheckboxView extends CheckboxView<Color> {
  override subViewTemplate() {
    return html`${new ColorView(this.data)}`;
  }
}
```
