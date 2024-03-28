import { View, html, on, ListView } from 'rune-ts';

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
    new SettingController([
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

  const dessertListView = new DessertListView([
    { name: 'Choco', rating: 3.8 },
    { name: 'Latte', rating: 4.5 },
  ]);

  console.log(dessertListView.toHtml());

  dessertListView.add(
    [
      { name: 'Coffee', rating: 4.2 },
      { name: 'Decaf', rating: 2.1 },
    ],
    2,
  );

  console.log(dessertListView.toHtml());

  const itemView = dessertListView
    .append({ name: 'Coffee', rating: 4.2 })
    .prepend({ name: 'Decaf', rating: 2.1 })
    .removeByIndex(1)!;

  dessertListView.append(itemView.data);
  dessertListView.move(3, 0);
  //
  // dessertListView.data.pop();
  // dessertListView.set([...dessertListView.data]);

  document.querySelector('#tutorial')!.append(dessertListView.render());
}

interface Dessert {
  name: string;
  rating: number;
}

class DessertView extends View<Dessert> {
  override template({ name, rating }: Dessert) {
    return html` <li>${name} (${rating})</li> `;
  }
}

class DessertListView extends ListView<Dessert, DessertView> {
  override ItemView = DessertView;
}

interface Setting {
  title: string;
  on: boolean;
}

class SettingView extends View<Setting> {
  switchView = new SwitchView(this.data);

  override template(setting: Setting) {
    return html`
      <li>
        <span class="title">${setting.title}</span>
        ${this.switchView}
      </li>
    `;
  }
}

class SettingListView extends ListView<Setting, SettingView> {
  override ItemView = SettingView;
}

class SettingController extends View<Setting[]> {
  private checkAllSwitchView = new SwitchView({ on: this.isAllChecked() });
  private settingListview = new SettingListView(this.data);

  override template() {
    return html`
      <div>
        <div class="header">
          <span class="title">Check All</span>
          ${this.checkAllSwitchView}
        </div>
        ${this.settingListview}
      </div>
    `;
  }

  @on('switch:change', '> .header')
  checkAll() {
    const { on } = this.checkAllSwitchView.data;
    this.settingListview.itemViews
      .filter((view) => on !== view.data.on)
      .forEach((view) => view.switchView.setOn(on));
  }

  @on('switch:change', `> .${SettingListView}`)
  private _changed() {
    this.checkAllSwitchView.setOn(this.isAllChecked());
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
