# Creating a View

## Creating a simple component

In Rune, you create components by extending the `View` class.

```typescript
import { View, html } from 'rune-ts';

export type Color = {
  code: string;
};

export class ColorView extends View<Color> {
  override template({ code }: Color) {
    return html`
      <div style="background-color: ${code}"></div> 
    `;
  }
}

const colorView = new ColorView({ code: 'red' });
colorView.toHtml();
```

`colorView.toHtml()` returns an HTML string.

```html
<div class="ColorView" style="background-color: red"></div>
```

## Changing data

After changing the `colorView` data, you can obtain the HTML string again.

```typescript
colorView.data.code = 'blue';
colorView.toHtml();
```

```html
<div class="ColorView" style="background-color: blue"></div>
```

You can express the same code using method chaining.

```typescript
colorView.chain((view) => (view.data.code = 'blue')).toHtml();
```

## Creating an HTMLElement

When you run `colorView.render();`, it creates and returns an HTMLElement. It’s recommended to use the `render` method only in the browser.

```typescript
document.body.appendChild(new ColorView({ code: 'pink' }).render());
```

```html
<html>
  ...
  <body>
    ...
    <div class="ColorView" style="background-color: pink"></div>
  </body>
</html>
```

## Creating nested components

You can implement nested components using template literals.

```typescript
export type Color = {
  code: string;
  checked?: boolean;
};

export class ColorCheckboxView extends View<Color> {
  override template(color: Color) {
    return html`
      <li class="${color.checked ? 'checked' : ''}">${new ColorView(color)}</li>
    `;
  }
}

new ColorCheckboxView({ code: 'yellow', checked: true }).toHtml();
```

```html
<li class="ColorCheckboxView checked">
  <div class="ColorView" style="background-color: green"></div>
</li>
```

In this way, you can create a `ColorCheckboxView` that contains a `ColorView`. Below is an example of creating a `ColorCheckboxListView` that holds multiple `ColorCheckboxView`s by passing an array.

```typescript
export class ColorCheckboxListView extends View<Color[]> {
  override template(colors: Color[]) {
    return html`
      <ul>
        ${colors.map((color) => new ColorCheckboxView(color))}
      </ul>
    `;
  }
}

document.body.appendChild(
  new ColorCheckboxListView([
    { code: 'red' },
    { code: 'green', checked: true },
    { code: 'blue' },
    { code: 'yellow' },
  ]).render(),
);
```

```html
<ul class="ColorCheckboxListView">
  <li class="ColorCheckboxView">
    <div class="ColorView" style="background-color: red"></div>
  </li>
  <li class="ColorCheckboxView checked">
    <div class="ColorView" style="background-color: green"></div>
  </li>
  ...
</ul>
```