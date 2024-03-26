# Solo Component SSR

## View 혼자서도 가능한 서버 사이드 렌더링

Rune의 컴포넌트는 별도의 기술 없이 혼자서도 서버사이드 렌더링을 지원하며 자바스크립트만으로 동작합니다. 이러한 특성은 이식성을 높게 하여 프로젝트에서 React, Solid, Next.js, Express.js 등 어떤 방식으로 서버사이드 렌더링을 구축했는지와 관계없이 함께 바로 사용이 가능합니다.

```typescript
interface Product {
  name: string;
  price: number;
  quantity: number;
}

class ProductView extends View<Product> {
  override template(product: Product) {
    return html`
      <div>
        <div class="name">${product.name}</div>
        <div class="price">$${product.price}</div>
        <div class="quantity">${product.quantity}</div>
        <button>Total Price</button>
      </div>
    `;
  }

  @on('click', 'button')
  showTotalPrice() {
    console.log(`$${this.data.price * this.data.quantity}`);
  }
}
```

위와 같은 컴포넌트를 만든 경우 서버측에서 아래와 같이 실행하여 HTML 문자열을 만들 수 있습니다.

```typescript
// Server Side
new ProductView({
  name: 'Phone Case',
  price: 13,
  quantity: 3,
}).toHtml();
```

```html
<div class="ProductView">
  <div class="name">Phone Case</div>
  <div class="price">$13</div>
  <div class="quantity">3</div>
  <button>Total Price</button>
</div>
```

## Hydration

서버 측에서 HTML을 생성할 당시 사용했던 동일한 데이터를 전달하여 View 객체를 생성한 다음 도큐먼트에 생성되어있는 HTMLElement를 `hydrateFormSSR` 메서드에 전달하면 됩니다.

```typescript
// Client Side
new ProductView({
  name: 'Phone Case',
  price: 13,
  quantity: 3,
}).hydrateFromSSR(document.querySelector('.ProductView')!);

// click button -> $39
```

## 중첩 컴포넌트의 Hydration

중첩 컴포넌트 역시 부모 컴포넌트에게 데이터를 전달하면 됩니다. 아례는 `ProductView` 내부에 `PhotoView`를 추가한 사례를 보여줍니다.

```typescript
interface Product {
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

class ProductView extends View<Product> {
  override template(product: Product) {
    return html`
      <div>
        ${new PhotoView({ src: product.thumbnail, alt: product.name })}
        <div class="name">${product.name}</div>
        <div class="price">$${product.price}</div>
        <div class="quantity">${product.quantity}</div>
        <button>Total Price</button>
      </div>
    `;
  }

  @on('click', 'button')
  showTotalPrice() {
    console.log(`$${this.data.price * this.data.quantity}`);
  }
}

class PhotoView extends View<{
  src: string;
  originalSrc?: string;
  alt: string;
}> {
  override template({ src, alt }) {
    return html`<div><img src="${src}" alt="${alt}" /></div>`;
  }

  @on('click')
  showOriginalImg() {
    console.log(this.data.originalSrc ?? this.data.src);
  }
}
```

```typescript
// Server Side
new ProductView({
  name: 'Phone Case',
  price: 13,
  quantity: 3,
  thumbnail: 'phone-case.png',
}).toHtml();

// Client Side
new ProductView({
  name: 'Phone Case',
  price: 13,
  quantity: 3,
  thumbnail: 'phone-case.png',
}).hydrateFromSSR(document.querySelector('.ProductView')!);

// click button -> $39
// click img -> phone-case.png
```

## 빠른 SSR, 높은 이식성

Rune의 컴포넌트들이 HTML 문자열을 만드는 과정은 자바스크립트의 Template Literals에 의한 문자열 조합이므로 간결하고 빠릅니다. 또한 자바스크립트의 내장 값으로만 소통하기 때문에 자바스크립트가 동작하는 어디에나 이식 가능합니다. 만일 개발자가 프로젝트 내에서 재사용이 필요한 코드를 작성해야 할 때, 동작의 퀄리티가 높아야하거나 애니메이션을 잘 다뤄야하거나 최신 Web API 기술을 사용해야해서 내부 코드를 DOM으로 직접 조작해야하고, 컴포넌트 방식으로 개발하고 싶고 서버 사이드 렌더링도 필요하다면, 그리고 그 컴포넌트를 React, Solid.js 등의 코드 내부에서 불러와 사용하고 싶다면, Rune 컴포넌트는 좋은 대안이 될 것입니다.
