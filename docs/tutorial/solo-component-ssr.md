# Solo Component SSR

## View Capable of Server-Side Rendering Alone

Rune's components support server-side rendering on their own without the need for additional technologies, and they work with JavaScript alone. This feature enhances portability, allowing them to be used seamlessly regardless of how server-side rendering is implemented in the project, whether it's through React, Solid, Next.js, Express.js, or any other method.

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

If you have created such components, you can generate HTML strings on the server side as follows.

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

On the server side, you can create View objects using the same data that was used when generating HTML. Then, you can pass the generated HTMLElement in the document to the `hydrateFromSSR` method.

```typescript
// Client Side
new ProductView({
  name: 'Phone Case',
  price: 13,
  quantity: 3,
}).hydrateFromSSR(document.querySelector('.ProductView')!);

// click button -> $39
```

## Hydration of Nested Components

For nested components, you simply need to pass data from the parent component to its children. Below is an example illustrating the addition of a `PhotoView` inside a `ProductView`.

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

## Fast SSR, High Portability

The process of generating HTML strings by Rune's components relies on JavaScript's Template Literals, making it concise and fast. Moreover, since it communicates only through JavaScript's built-in values, it's highly portable and can be used anywhere JavaScript runs. If a developer needs to write reusable code within a project that requires high-quality functionality, intricate animation handling, utilization of the latest Web API technologies, direct manipulation of the DOM for internal code, development using a component-based approach, and the need for server-side rendering, and if they want to import and use those components within frameworks like React or Solid.js, then Rune components can serve as an excellent alternative.
