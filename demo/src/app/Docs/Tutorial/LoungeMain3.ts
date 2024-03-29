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
  }).hydrateFromSSR(document.querySelector('.ProductView')!);

  // click button -> $39

  document.querySelector('#tutorial')!.appendChild(
    new SettingsView([
      { title: 'Wi-fi', on: true },
      { title: 'Bluetooth', on: false },
      { title: 'Airplane mode', on: true },
    ]).render(),
  );

  class MyView extends View<{ value: string }> {
    override template({ value }: { value: string }) {
      return html` <div>${value}${html.preventEscape(value)}</div> `;
    }
  }

  console.log(new MyView({ value: '<marquee>Hello, world!</marquee>' }).toHtml());
}

interface Setting {
  title: string;
  on: boolean;
}

class SettingsView extends View<Setting[]> {
  override template() {
    return html`
      <div>
        <div class="header">
          <span class="title">Check All</span>
          ${new SwitchView({ on: this.isAllChecked() })}
        </div>
        <ul class="body">
          ${this.data.map(
            (setting) => html`
              <li>
                <span class="title">${setting.title}</span>
                ${new SwitchView(setting)}
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }

  @on('switch:change', '> .header')
  checkAll() {
    const { on } = this.subViewIn('> .header', SwitchView)!.data;
    this.subViewsIn('> .body', SwitchView)
      .filter((view) => on !== view.data.on)
      .forEach((view) => view.setOn(on));
  }

  @on('switch:change', '> .body')
  private _changed() {
    this.subViewIn('> .header', SwitchView)!.setOn(this.isAllChecked());
  }

  isAllChecked() {
    return this.data.every(({ on }) => on);
  }
}

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

  @on('click')
  private _toggle() {
    this.setOn(!this.data.on);
    this.redraw();
    this.dispatchEvent(new CustomEvent('switch:change', { bubbles: true }));
  }

  setOn(on: boolean) {
    this.data.on = on;
    return this.redraw();
  }

  override redraw() {
    const { classList } = this.element();
    this.data.on ? classList.add('on') : classList.remove('on');
    return this;
  }
}
