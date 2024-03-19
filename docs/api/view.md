---
outline: deep
---

# View

## Class Definition

```typescript
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

```typescript
new SwitchView({ on: false });
```

## template()
`protected template(): Html;`

`template` 메서드안에서는 `html`을 사용하여 HTML 문자열을 템플릿을 만듭니다. 

```typescript
interface Product {
  name: string;
  price: number;
  thumbnail: string;
  options: { id: number; name: string }[];
}

class ProductView extends View<Product> {
  override template(product: Product) {
    return html`
      <div>
        ${new PhotoView({ src: product.thumbnail, alt: product.name })}
        <div class="name">${product.name}</div>
        <div class="price">$${product.price}</div>
        <select>
          ${product.options.map(
            ({ id, name }) => html`<option value="${id}">${name}</option>`,
          )}
        </select>
      </div>
    `;
  }
}

class PhotoView extends View<{ src: string; alt: string }> {
  override template({ src, alt }) {
    return html`<div><img src="${src}" alt="${alt}" /></div>`;
  }
}
```

`${}`를 통해 넘어오는 값은 다음과 같이 처리합니다.

- array => join('');
- view => view.toHtml();
- string | number ... => escape(a.toString());

## toHtml()

`public toHtml(): string;`

```typescript
class UserView extends View<{ name: string, age: number }> {
  override template() {
    return html`
      <div>
        <div class="name">${this.data.name}</div>
        <div class="age">${this.data.age}</div>
      </div>
    `
  }
}

const userView = new UserView({ name: 'milg', age: 20 });
userView.toHtml();
```
```html
<div class="UserView">
  <div class="name">milg</div>
  <div class="age">20</div>
</div>
```

## data

`public data: T;`

```typescript
userView.data.age = 30;
userView.toHtml();
```
```html
<div class="UserView">
  <div class="name">milg</div>
  <div class="age">30</div>
</div>
```

## setData();

`public setData(data: T): this;`

```typescript
userView.setData({ name: 'milgarian', age: 25 });
userView.toHtml();
```
```html
<div class="UserView">
  <div class="name">milgarian</div>
  <div class="age">25</div>
</div>
```

## render()

`public render(): HTMLElement;`

내부에서 `this.template(this.data)`로 HTML문자열을 만들고 HTMLElement를 생성하여 `this._element`에 등록하고 리턴합니다. 

```typescript
const element: HTMLElement = userView.render();
// div.UserView
```

## element()

`public element(): HTMLElement;`

생성되어있는 HTMLElement를 리턴합니다.

```typescript
const element: HTMLElement = userView.element();
// div.UserView
```

## isRendered()

`public isRendered(): boolean;`

## hydrateFromSSR()

`public hydrateFromSSR(element: HTMLElement): this;`

동일한 데이터로 만들어졌던 HTML로 그려진 HTMLElement와 data를 다시 넘겨주어 hydration을 할 수 있습니다. ([Tutorial - Solo Component SSR](/tutorial/solo-component-ssr.html))

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
