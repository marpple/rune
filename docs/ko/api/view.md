---
outline: deep
---

# View class

View는 HTML 템플릿, HTMLElement 생성, 이벤트 핸들링에 필요한 도구를 지원하며 UI 컴포넌트를 만들 때 사용하는 클래스입니다.

## Definition

```typescript
import { View } from 'rune-ts';

interface SwitchData {
  on: boolean;
}

class SwitchView extends View<SwitchData> {
  override template() {
    return html`
      <button class="${this.data.on ? 'on' : ''}">
        <div class="toggle"></div>
      </button>
    `;
  }
}
```

## Create

`new (data: T) => View<T>;`

인자로 넘긴 `data`는 `this.data`에 등록되며 `this.template(data: T);`과 같이 `template()` 메서드로 전달됩니다.

```typescript
new SwitchView({ on: false });
```

## template()

`protected template(): Html;`

`template` 메서드안에서는 `html`을 사용하여 HTML 템플릿을 만듭니다. ([템플릿 API 더보기](/ko/api/template.html))

```typescript
import { View, html } from 'rune-ts';

class DessertView extends View<{ name: string; rating: number }> {
  override template() {
    return html`
      <div>
        <div class="name">${this.data.name}</div>
        <div class="rating">${this.data.rating}</div>
      </div>
    `;
  }
}
```

## toHtml()

`public toHtml(): string;`

```typescript
const dessertView = new DessertView({ name: 'Choco', rating: 2.8 });
dessertView.toHtml();
```

```html
<div class="DessertView">
  <div class="name">Choco</div>
  <div class="rating">2.8</div>
</div>
```

## data

`public data: T;`

```typescript
dessertView.data.name = 'Latte';
dessertView.data.rating = 3.5;
dessertView.toHtml();
```

```html
<div class="DessertView">
  <div class="name">Latte</div>
  <div class="rating">3.5</div>
</div>
```

## render()

`public render(): HTMLElement;`

내부에서 `this.template(this.data)`로 HTML문자열을 만들고 HTMLElement를 생성하여 `this._element`에 등록하고 리턴합니다.

```typescript
const element: HTMLElement = dessertView.render();
// div.DessertView
```

## element()

`public element(): HTMLElement;`

생성되어있는 HTMLElement를 리턴합니다.

```typescript
const element: HTMLElement = dessertView.element();
// div.DessertView
```

## isRendered()

`public isRendered(): boolean;`

`isRendered()`는 View 내부에 HTMLElement를 생성한적이 있는지를 체크합니다. 렌더링된 상태에서만 실행하고자 하는 코드를 구분하고자 할 때 유용합니다.

## renderCount

`public renderCount: number;`

내부에서 `template()` 함수를 실행한 수입니다. 이 프로퍼티를 활용하여 부분적으로만 렌더링하도록 `template()` 함수를 정의하는 식으로 지연적인 렌더링을 구현할 수 있습니다.

## hydrateFromSSR()

`public hydrateFromSSR(element: HTMLElement): this;`

동일한 데이터로 만들어졌던 HTML로 그려진 HTMLElement와 data를 다시 넘겨주어 hydration을 할 수 있습니다. ([Tutorial - Solo Component SSR](/ko/tutorial/solo-component-ssr.html))

```typescript
// Server Side
new ProductView({
  name: 'Phone Case',
  price: 13,
}).toHtml();

// Client Side
new ProductView({
  name: 'Phone Case',
  price: 13,
}).hydrateFromSSR(document.querySelector('.ProductView')!);
```

## redraw()

`public redraw(): this;`

View 객체의 현재 data 상태로 자신을 다시 그립니다. 기본 동작은 가장 바깥 엘리먼트의 html attributes를 갱신하고 내부는 `innerHTML`로 변경합니다. 각 컴포넌트를 만드는 개발자가 `redraw` 함수를 최적화하여 오버라이드 해두면 좋습니다.

```typescript
class PhotoView extends View<{ src: string; alt: string }> {
  override template({ src, alt }) {
    return html`<div><img src="${src}" alt="${alt}" /></div>`;
  }

  override redraw() {
    const img = this.element().querySelector('img')!;
    img.setAttribute('src', this.data.src);
    img.setAttribute('alt', this.data.alt);
  }
}
```

위 코드는 Rune의 DOM 조작 헬퍼 클래스인 `$Element`를 활용하면 보다 간결하게 작성할 수 있습니다.

```typescript
override redraw() {
  $(this.element()).find('img')!.setAttributes(this.data);
}
```

## subView()

```
protected subView<T extends ViewConstructor>(
  SubView: T,
  selector?: string
): InstanceType<T> | null;
```

View의 `template()` 메서드 안에서 생성된 subView들, 즉 첫 번째 뎁스의 subView들 중에 컨스트럭터가 인자로 전달한 컨스트럭터와 동일한 첫 번째 subView를 리턴합니다. 두 번째 인자인 selector? 는 CSS Selector로, SubView를 조회하는 조건을 추가할 수 있습니다.

```typescript
class ProductView extends View<Product> {
  override template(product: Product) {
    return html`
      <div>
        ${new PhotoView({ src: product.thumbnail, alt: product.name })}
        <div class="name">${product.name}</div>
        <div class="price">$${product.price}</div>
      </div>
    `;
  }

  override onMount() {
    console.log(this.subView(PhotoView)!.data.src);
  }
}
```

## subViews()

```
protected subViews<T extends ViewConstructor>(
  SubView: T,
  selector?: string
): InstanceType<T>[];
```

subViews 배열을 리턴합니다.

## subViewIn()

```
protected subViewIn<T extends ViewConstructor>(
  selector: string,
  SubView: T
): InstanceType<T> | null;
```

selector로 찾아지는 부모 엘리먼트 내부에 그려진 subView를 하나를 리턴합니다.

## subViewsIn()

```
protected subViewsIn<T extends ViewConstructor>(
  selector: string,
  SubView: T,
): InstanceType<T>[];
```

selector로 찾아지는 부모 엘리먼트 내부에 그려진 subViews 배열을 리턴합니다.

## redrawOnlySubViews()

`protected redrawOnlySubViews(): this;`

subView를 순회하면서 `redraw()`를 실행합니다.

## chain()

`chain(f: (this: this, view: this) => void): this;`

```typescript
view.chain((view) => view.data.quantity++).redraw();
```

```typescript
view.chain((view) => view.data.quantity++).redraw();
```

## safely()

`safely(f: (this: this, view: this) => void): this;`

```typescript
safely(f: (this: this, view: this) => void): this {
  return this.isRendered() ? this.chain(f) : this;
}
```

`safely`의 구현은 위와 같습니다. 엘리먼트가 렌더링 된 상태에서만 동작했으면 하는 코드를 체이닝할 때 사용합니다.

## toString()

View의 클래스이름을 리턴합니다.

```typescript
new MyView('hi').toString();
// MyView
```

## onMount()

View가 `document`에 `append` 된 이후에 실행됩니다.

## Event handling

View class는 Base class로 부터 Event handling 메서드들을 상속 받았습니다. ([API - Event handling 참고](/ko/api/event.html))
