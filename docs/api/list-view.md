---
outline: deep
---

# ListView class

This is the basic view class for handling array data. Since it inherits from the View class, all functionalities of the View class can be utilized as well.

```typescript
export class ListView<
  T extends object,
  IV extends View<T> = View<T>,
> extends View<T[]> {
  ...
}
```

## Definition

```typescript
import { ListView } from 'rune-ts';

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
```

Define the ItemView class to be used inside ListView and pass the type of data used by ItemView as a type argument to the ListView class, like `ListView<Dessert, DessertView>`.

## Create

`new (data: T) => ListView<T, IV>;`

```typescript
const dessertListView = new DessertListView([
  { name: 'Choco', rating: 3.8 },
  { name: 'Latte', rating: 4.5 },
]);
```

## toHtml()

`public toHtml(): string;`

```typescript
dessertListView.toHtml();
```

```html
<ul class="DessertListView">
  <li class="DessertView">Choco (3.8)</li>
  <li class="DessertView">Latte (4.5)</li>
</ul>
```

## tagName

`tagName: string;`

```typescript
class DessertListView extends ListView<Dessert, DessertView> {
  override tagName = 'ol';
  override ItemView = DessertView;
}

new DessertListView([
  { name: 'Choco', rating: 3.8 },
  { name: 'Latte', rating: 4.5 },
]).toHtml();
```

```html
<ol class="DessertListView">
  <li class="DessertView">Choco (3.8)</li>
  <li class="DessertView">Latte (4.5)</li>
</ol>
```

## ItemView

`ItemView: (new (data: T) => IV);`

## itemViews

`readonly itemViews: ItemView[];`

## length

`length: number;`

```typescript
dessertListView.length === dessertListView.itemViews.length;
// true
```

## add()

`add(items: T[], at?: number): this;`

Adds the passed data to `this.data` and creates ItemViews accordingly, reflecting them in the screen and `itemViews`.

```typescript
dessertListView.add([
  { name: 'Coffee', rating: 4.2 },
  { name: 'Decaf', rating: 2.1 },
]);
```

```html
<ol class="DessertListView">
  <li class="DessertView">Choco (3.8)</li>
  <li class="DessertView">Latte (4.5)</li>
  <li class="DessertView">Coffee (4.2)</li>
  <li class="DessertView">Decaf (2.1)</li>
</ol>
```

The optional parameter `at` can be used to add items at a specific position.

## append()

`append(item: T): this;`

Adds the passed data to `this.data` and creates ItemViews accordingly, reflecting them in the screen and `itemViews`.

## appendAll()

`appendAll(items: T[]): this;`

Adds the passed data to `this.data` and creates ItemViews accordingly, reflecting them in the screen and `itemViews`.

## prepend()

`prepend(item: T): this;`

Adds the passed data to `this.data` and creates ItemViews accordingly, reflecting them in the screen and `itemViews`.

## prependAll()

`prependAll(items: T[]): this;`

Adds the passed data to `this.data` and creates ItemViews accordingly, reflecting them in the screen and `itemViews`.

## remove()

`remove(item: T): IV | undefined;`

Removes the item with the same reference as `item` from `this.data`, `itemViews`, and the screen, and returns the removed ItemView object if successful.

## removeAll()

`removeAll(items: T[]): IV[];`

Similar to `remove()`, removes all items passed in the array.

## removeByItemView()

`removeByItemView(itemView: IV): IV | undefined;`

Similar to `remove()`, removes the item with the same reference as `itemView`.

## removeAllByItemViews()

`removeAllByItemViews(itemViews: IV[]): IV[];`

Similar to `removeAll()`, removes all items whose references are passed in the array.

## removeByIndex()

`removeByIndex(idx: number): IV | undefined;`

Similar to `remove()`, removes the item at the specified index `idx`.

## removeBy()

`removeBy(f: (itemView: IV) => boolean): IV | undefined;`

Iterates over ItemViews and removes the first ItemView object for which the function `f` returns true.

## removeAllBy()

`removeAllBy(f: (itemView: IV) => boolean): IV[];`

Similar to `removeBy()`, removes all ItemView objects for which the function `f` returns true.

## reset()

`reset(): this;`

Removes all items.

## set()

`set(items: T[]): this;`

Removes all items and refreshes the screen with the new items passed.

## move()

`move(at: number, to: number): this;`

Moves the item with index `at` to the position `to`.
