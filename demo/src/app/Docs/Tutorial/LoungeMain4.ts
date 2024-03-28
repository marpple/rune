import { View, html, on } from 'rune-ts';

interface Product {
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
  options: { id: number; name: string }[];
}

class ProductView extends View<Product> {
  override template(product: Product) {
    return html`
      <div class="ProductView">
        ${new PhotoView({ src: product.thumbnail, alt: product.name })}
        <div class="name">${product.name}</div>
        <div class="price">$${product.price}</div>
        <div class="quantity">${product.quantity}</div>
        <select>
          ${product.options.map(({ id, name }) => html`<option value="${id}">${name}</option>`)}
        </select>
      </div>
    `;
  }
}

class PhotoView extends View<{ src: string; alt: string }> {
  override template({ src, alt }) {
    return html`<img src="${src}" alt="${alt}" />`;
  }
}

export function main() {}

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
