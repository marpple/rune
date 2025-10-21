# View class

View is a class used to create UI components, providing tools for handling HTML templates, creating HTMLElements, and managing event handling.

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

The `data` passed as an argument is registered in `this.data` and is also passed to the `template()` method as `this.template(data: T);`.

```typescript
new SwitchView({ on: false });
```

## template()

`protected template(): Html;`

Inside the `template` method, create an HTML template using `html`. ([See more about the template API](/api/template.html))

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

Internally, it creates an HTML string from `this.template(this.data)`, generates an HTMLElement, assigns it to `this._element`, and returns it.

```typescript
const element: HTMLElement = dessertView.render();
// div.DessertView
```

## element()

`public element(): HTMLElement;`

Returns the created HTMLElement.

```typescript
const element: HTMLElement = dessertView.element();
// div.DessertView
```

## isRendered()

`public isRendered(): boolean;`

`isRendered()` checks whether an HTMLElement has ever been created inside the View. It’s useful when you want to separate out code that should only run when rendering has occurred.

## renderCount

`public renderCount: number;`

This tracks how many times the `template()` function has been executed internally. You can use this property to implement lazy rendering by defining the `template()` function in a way that only partially renders based on the render count.

## hydrateFromSSR()

`public hydrateFromSSR(element: HTMLElement): this;`

You can hydrate an existing HTMLElement that was rendered with the same data on the server by passing the previously rendered HTML element and data. ([Tutorial - Solo Component SSR](/tutorial/solo-component-ssr.html))

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

Redraws itself using the current data state of the View object. By default, it updates the HTML attributes of the outermost element and changes the inside by setting `innerHTML`. If you want further optimization, it’s good to override and optimize the `redraw` function in each component.

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

Using `$Element`, Rune’s DOM manipulation helper class, you can write the above code more succinctly:

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

Returns the first subView created within the `template()` method that matches the constructor passed as an argument. The optional second argument, selector,

allows for further querying conditions using a CSS Selector.

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

  override onRender() {
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

Returns an array of subViews.

## subViewIn()

```
protected subViewIn<T extends ViewConstructor>(
  selector: string,
  SubView: T
): InstanceType<T> | null;
```

Returns a single subView drawn inside a parent element found using the selector.

## subViewsIn()

```
protected subViewsIn<T extends ViewConstructor>(
  selector: string,
  SubView: T,
): InstanceType<T>[];
```

Returns an array of subViews drawn inside a parent element found using the selector.

## redrawOnlySubViews()

`protected redrawOnlySubViews(): this;`

Iterates through subViews and executes `redraw()` on each.

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

The implementation of `safely` is as shown above. Use this when you want to chain code that should only operate if the element is already rendered.

## toString()

Returns the class name of the View.

```typescript
new MyView('hi').toString();
// MyView
```

## onRender()

Executes right after the View’s `element` is created.

## onMount()

Executes right after the View is appended to `document.body`.

## onUnmount()

Executes right after the View is removed from `document.body`.

## Event handling

The View class inherits event handling methods from the Base class. ([Refer to API - Event handling](/api/event.html))