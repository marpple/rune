import { View, Enable, html, on, enable, ListView, rune, $ } from 'rune-ts';
import { each, filter, map, pipe } from '@fxts/core';

interface Product {
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

class ProductView extends View<Product> {
  override template(product: Product) {
    return html`
      <div class="ProductView">
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
    return html`<img src="${src}" alt="${alt}" />`;
  }

  @on('click')
  showOriginalImg() {
    console.log(this.data.originalSrc ?? this.data.src);
  }
}

class MyMyView extends View<object> {}

class MyMyView3 extends Enable {}

export function main() {
  console.log(
    new ProductView({
      name: 'Phone Case',
      price: 13,
      quantity: 3,
      thumbnail: 'phone-case.png',
    }).toHtml(),
  );

  document.querySelector('#tutorial')!.innerHTML = new ProductView({
    name: 'Phone Case',
    price: 13,
    quantity: 3,
    thumbnail: 'phone-case.png',
  }).toHtml();

  new ProductView({
    name: 'Phone Case',
    price: 13,
    quantity: 3,
    thumbnail: 'phone-case.png',
  }).hydrateFromSSR(document.querySelector('.ProductView'));

  // click button -> $39
  class MyView extends View<{ value: string }> {
    override template({ value }: { value: string }) {
      return html` <div>${value}${html.preventEscape(value)}</div> `;
    }
  }

  console.log(new MyView({ value: '<marquee>Hello, world!</marquee>' }).toHtml());
}
