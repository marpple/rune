---
outline: deep
---

# Template

## view.template()

`protected template(): Html;`

The `template()` method is executed internally within `view.toHtml()`, `view.render()`, etc., and it takes the `data: T` passed as an argument when creating the `View<T>`. Inside the `template` method, HTML templates are constructed using the `html` function.

```typescript
import { View, html } from 'rune-ts';

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
          ${product.options.map(({ id, name }) => html`<option value="${id}">${name}</option>`)}
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

## html

The values inside `${}` within `html`` are processed internally as follows, allowing for nested component usage:

- (view: View) => view.toHtml();
- (arr: Array) => arr.join('');
- (ush: UnsafeHtml) => ush.toString();
- (a: string | number ...) => escape(a.toString());

## html.preventEscape

`(htmlStr: string): UnsafeHtml;`

```typescript
type Data = { value: string };

class MyView extends View<Data> {
  override template({ value }: Data) {
    return html` <div>${value} ${html.preventEscape(value)}</div> `;
  }
}

new MyView({ value: '<marquee>Hello, world!</marquee>' }).toHtml();
```

```html
<div class="MyView">
  &lt;marquee&gt;Hello, world!&lt;/marquee&gt;
  <marquee>Hello, world!</marquee>
</div>
```
