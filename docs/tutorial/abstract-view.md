# Abstracting View

## Separating Check Functionality

The `ColorCheckboxListView` and `ColorCheckboxView` above have a property indicating whether they can be checked. By preparing a `View` abstracting the check functionality, you can more easily create more views with check functionality.

First, let's review the code for `ColorView`, `ColorCheckboxListView`, and `ColorCheckboxView`:

```typescript
export type Color = {
  code: string;
  checked?: boolean;
};

export class ColorView extends View<Color> {
  override template({ code }: Color) {
    return html` <div style="background-color: ${code}"></div> `;
  }
}

export class ColorCheckboxView extends View<Color> {
  override template(color: Color) {
    return html` <li class="${color.checked ? 'checked' : ''}">${new ColorView(color)}</li> `;
  }

  @on('click')
  private _toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
    this.element().dispatchEvent(new CustomEvent('checkbox:change', { bubbles: true }));
  }
}

export class ColorCheckboxListView extends View<Color[]> {
  override template(colors: Color[]) {
    return html`
      <ul>
        ${colors.map((color) => new ColorCheckboxView(color))}
      </ul>
    `;
  }

  override onMount() {
    this.delegate('checkbox:change', '.ColorCheckboxView', this.onChange);
  }

  onChange() {
    this.element().dispatchEvent(new CustomEvent('checkboxlist:change', { bubbles: true }));
  }

  checkedColors(): Color[] {
    return this.data.filter(({ checked }) => checked);
  }
}
```

## Abstracted Classes and Generics

`ColorCheckboxListView` and `ColorCheckboxView` can be abstracted using the following approach. Compare it with the previous code to see what has changed:

```typescript
export type CheckboxData = {
  checked?: boolean;
};

export class CheckboxView<T extends CheckboxData> extends View<T> {
  tagName: string = 'li';
  SubView: { new (data: T): View<T> } | null = null;

  override template({ checked }: T) {
    return html`
      <${this.tagName} class="${checked ? 'checked' : ''}">
        ${this.createSubView()}
      </${this.tagName}>
    `;
  }

  createSubView(): View<T> | string {
    return this.SubView ? new this.SubView(this.data) : '';
  }

  @on('click')
  private _toggle() {
    this.data.checked = !this.data.checked;
    this.element().classList.toggle('checked');
    this.element().dispatchEvent(new CustomEvent('checkbox:change', { bubbles: true }));
  }
}

export class CheckboxListView<T extends CheckboxData> extends View<T[]> {
  tagName: string = 'ul';
  CheckboxView: { new (data: T): CheckboxView<T> } = CheckboxView;

  override template(checkBoxDatas: T[]) {
    return html`
      <${this.tagName}>
        ${checkBoxDatas.map((checkBoxData) => this.createCheckboxView(checkBoxData))}
      </${this.tagName}>
    `;
  }

  createCheckboxView(data: T): CheckboxView<T> {
    return new this.CheckboxView(data);
  }

  @on('checkbox:change', '> *')
  onChange() {
    this.element().dispatchEvent(new CustomEvent('checkboxlist:change', { bubbles: true }));
  }

  checkedData() {
    return this.data.filter(({ checked }) => checked);
  }
}
```

Generics were used to allow type inference for the `data` in code extending `CheckboxListView` and `CheckboxView`. `CheckboxView<T extends CheckboxData>` constrains the type of `data` for new `View` extending `CheckboxView`. Additionally, properties like `tagName`, `SubView`, and `CheckboxView` were added for extension purposes.

## Extending through Inheritance

By inheriting `CheckboxView` and `CheckboxListView`, `ColorCheckboxListView` and `ColorCheckboxView` can be reimplemented as follows:

```typescript
export class ColorCheckboxView extends CheckboxView<Color> {
  SubView = ColorView;
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  CheckboxView = ColorCheckboxView;
}
```

They can be used in the same way:

```typescript
const colorCheckboxListView = new ColorCheckboxListView([
  { code: 'red' },
  { code: 'green', checked: true },
  { code: 'blue' },
  { code: 'yellow' },
]);

document.body.appendChild(colorCheckboxListView.render());

colorCheckboxListView.addEventListener('checkboxlist:change', function () {
  console.log(this.checkedData().map(({ code }) => code));
  // ['green', 'blue']
});
```

## Utilizing First-class Objects

Let's include `ColorView` in the code:

```typescript
export type Color = {
  code: string;
  checked?: boolean;
};

export class ColorView extends View<Color> {
  override template({ code }: Color) {
    return html` <div style="background-color: ${code}"></div> `;
  }
}

export class ColorCheckboxView extends CheckboxView<Color> {
  SubView = ColorView;
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  CheckboxView = ColorCheckboxView;
}
```

If you don't use `ColorCheckboxView`, you can write the code like this:

```typescript
export class ColorView extends View<Color> {
  template({ code }: Color) {
    return html` <div style="background-color: ${code}"></div> `;
  }
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  CheckboxView = class ColorCheckboxView extends CheckboxView<Color> {
    SubView = ColorView;
  };
}
```

Similarly, if you don't use `ColorView`, you can implement it like this:

```typescript
export class ColorCheckboxListView extends CheckboxListView<Color> {
  CheckboxView = class ColorCheckboxView extends CheckboxView<Color> {
    SubView = class ColorView extends View<Color> {
      template({ code }: Color) {
        return html` <div style="background-color: ${code}"></div> `;
      }
    };
  };
}
```

## Abstracting with Templates

The approach used to implement `CheckboxView` requires careful type definitions, making abstraction somewhat challenging. By leveraging Rune's template functions, you can abstract more easily as shown below.

```typescript
export class CheckboxView<T extends CheckboxData> extends View<T> {
  tagName: string = 'li';

  override template({ checked }: T) {
    return html`
      <${this.tagName} class="${checked ? 'checked' : ''}">
        ${this.subViewTemplate()}
      </${this.tagName}>
    `;
  }

  subViewTemplate() {
    return html``;
  }
}

export class ColorCheckboxView extends CheckboxView<Color> {
  override subViewTemplate() {
    return html`${new ColorView(this.data)}`;
  }
}
```
