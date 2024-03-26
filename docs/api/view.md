---
outline: deep
---

# View class

View is a class used for creating UI components, providing tools for HTML template generation, HTMLElement creation, and event handling.

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

The data passed as an argument is registered in `this.data`, and it is passed to the `template()` method as `data: T;`.

```typescript
new SwitchView({ on: false });
```

## template()

`protected template(): Html;`

Inside the `template` method, HTML templates are created using the `html` function. (See [Template API](/api/template.html) for more details.)

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

Internally, the `template` method constructs an HTML string using `this.template(this.data)`, generates an HTMLElement, and then assigns it to `this._element` before returning it.

```typescript
const element: HTMLElement = dessertView.render();
// div.DessertView
```

## element()

`public element(): HTMLElement;`

It returns the generated HTMLElement.

```typescript
const element: HTMLElement = dessertView.element();
// div.DessertView
```

## isRendered()

`public isRendered(): boolean;`

`isRendered()` checks whether an HTMLElement has been created inside the View. It is useful for distinguishing code that should only run when rendered.

## renderCount

`public renderCount: number;`

It represents the number of times the `template()` function has been executed internally. You can use this property to implement deferred rendering by defining the `template()` function to render only parts of the view.

## hydrateFromSSR()

`public hydrateFromSSR(element: HTMLElement): this;`

This method allows hydrating the View from an already rendered HTMLElement with the same data. It is useful for client-side hydration after server-side rendering. ([Tutorial - Solo Component SSR](/tutorial/solo-component-ssr.html))

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

The View object redraws itself with its current data state. The default behavior is to update the HTML attributes of the outermost element and update the inner content using `innerHTML`. It's advisable for developers creating each component to optimize the `redraw` function by overriding it as needed.

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

The above code can be written more succinctly using Rune's DOM manipulation helper class `$Element`.

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

In the `template()` method of View, the first-level subViews created are returned, i.e., the first subView that matches the constructor passed as an argument. The second argument, `selector`, is an optional CSS Selector that allows adding conditions for selecting the SubViews.

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

It returns an array of subViews.

## subViewIn()

```
protected subViewIn<T extends ViewConstructor>(
  selector: string,
  SubView: T
): InstanceType<T> | null;
```

It returns one subView drawn inside the parent element found by the selector.

## subViewsIn()

```
protected subViewsIn<T extends ViewConstructor>(
  selector: string,
  SubView: T,
): InstanceType<T>[];
```

It returns an array of subViews drawn inside the parent element found by the selector.

## redrawOnlySubViews()

`protected redrawOnlySubViews(): this;`

It iterates through the subViews and executes `redraw()` on each one.

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

The implementation of `safely` is as shown above. It is used to chain code that should only execute when the element has been rendered.

## toString()

Returns the class name of the View.

```typescript
new MyView('hi').toString();
// MyView
```

## onMount()

Executed after the View has been appended to the `document`.

## Event handling

The View class inherits event handling methods from the Base class. (Refer to [API - Event handling](/api/event.html))
