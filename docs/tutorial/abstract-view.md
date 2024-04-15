# View Abstraction

## Separating the Checking Feature

The `ColorCheckboxListView` and `ColorCheckboxView` possess a checkable attribute. By preparing an abstracted `View` for the checking functionality, it becomes easier to create more `View` types with this capability.

Here's a look back at the code for `ColorView`, `ColorCheckboxListView`, and `ColorCheckboxView`:

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

  override onRender() {
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

You can abstract `ColorCheckboxListView` and `ColorCheckboxView` as follows. Notice the changes compared to the previous code:

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
    this.element().dispatchEvent(new Custom Event('checkbox:change', { bubbles: true }));
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
    this.element().dispatchEvent(new Custom Event('checkboxlist:change', { bubbles: true }));
  }

  checkedData() {
    return this.data.filter(({ checked }) => checked);
  }
}
```

Generics are utilized to allow code that extends `CheckboxListView` and `CheckboxView` to infer the type of `data`. `CheckboxView<T extends CheckboxData>` constrains the type of `data` for any new `View` extending `CheckboxView`. Additionally, properties like `tagName`, `SubView`, and `CheckboxView` can be extended.

## Extending via Inheritance

By inheriting `CheckboxView` and `CheckboxListView`, you can reimplement `ColorCheckboxListView` and `ColorCheckboxView` as follows:

```typescript
export class ColorCheckboxView extends CheckboxView<Color> {
  SubView = ColorView;
}

export class ColorCheckboxListView extends CheckboxListView<Color> {
  CheckboxView = ColorCheckboxView;
}
```

They can be used just like before:

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

## Utilizing First-Class Objects

Here's a revisited version including `Color

View`:

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

If you choose not to use `ColorCheckboxView`, you could alternatively write:

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

Similarly, if you choose not to use `ColorView`, you could implement it as follows:

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

## Simplifying Abstraction with Templates

The method of implementing `CheckboxView` as previously described requires careful type definition, making abstraction a bit challenging. By using Rune's template functions, you can abstract more easily:

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