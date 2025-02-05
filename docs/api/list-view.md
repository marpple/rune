---
outline: deep
---

# ListView class

A basic view class for working with array data. Since it extends the `View` class, you can use all of `View`’s features as well.

```typescript
class ListView<IV extends View<object>> extends View<IV['data'][]> {}
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
    return html`
      <li>${name} (${rating})</li> 
    `;
  }
}

class DessertListView extends ListView<DessertView> {
  override ItemView = DessertView;
}
```

Inside `ListView`, define the `ItemView` class you want to use and pass it as the type parameter of the `ListView` class, like `ListView<DessertView>`.

## Create

```typescript
const dessertListView = new DessertListView([
  { name: 'Choco', rating: 3.8 },
  { name: 'Latte', rating: 4.5 },
]);
```
  
`new (data: T) => ListView<IV>;`

## toHtml()

```typescript
dessertListView.toHtml();
```
  
`public toHtml(): string;`

```html
<ul class="DessertListView">
  <li class="DessertView">Choco (3.8)</li>
  <li class="DessertView">Latte (4.5)</li>
</ul>
```

## tagName

```typescript
class DessertListView extends ListView<DessertView> {
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
  
`tagName: string;`

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

Adds the passed-in data to `this.data`, creates an `ItemView` for each item, and reflects these changes on the screen and in `itemViews`.

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

You can add items at a specific position by using the optional `at` parameter.

## append()
  
`append(item: T): this;`

Adds the received data to `this.data`, creates an `ItemView`, and updates the screen and `itemViews`.

## appendAll()
  
`appendAll(items: T[]): this;`

Adds the received data to `this.data`, creates `ItemView` objects, and updates the screen and `itemViews`.

## prepend()
  
`prepend(item: T): this;`

Adds the received data to `this.data` at the beginning, creates an `ItemView`, and updates the screen and `itemViews`.

## prependAll()
  
`prependAll(items: T[]): this;`

Adds the received data to `this.data` at the beginning, creates `ItemView` objects, and updates the screen and `itemViews`.

## remove()
  
`remove(item: T): IV | undefined;`

Receives an `item` with the same reference, removes it from `this.data`, and removes the corresponding `ItemView` object from both `itemViews` and the screen. If deletion succeeds, it returns the deleted `ItemView` object.

## removeAll()
  
`removeAll(items: T[]): IV[];`

Works the same as `remove()` but takes an array and removes them all.

## removeByItemView()
  
`removeByItemView(itemView: IV): IV | undefined;`

Works the same as `remove()` but deletes the item that has the same reference as the given `itemView`.

## removeAllByItemViews()
  
`removeAllByItemViews(itemViews: IV[]): IV[];`

Works the same as `removeByItemView()` but takes an array and removes them all.

## removeByIndex()
  
`removeByIndex(idx: number): IV | undefined;`

Works the same as `remove()` but removes the item at the given index.

## removeBy()
  
`removeBy(f: (itemView: IV) => boolean): IV | undefined;`

Iterates over each `itemView`, passing it to the function `f`. Removes the first `ItemView` for which `f` returns true.

## removeAllBy()
  
`removeAllBy(f: (itemView: IV) => boolean): IV[];`

Works the same as `removeBy()`, but removes every `ItemView` for which `f` returns true.

## reset()
  
`reset(): this;`

Removes everything.

## set()
  
`set(items: T[]): this;`

Compares the new `items` with the existing `this.data` and updates `this.data` and the screen with minimal changes. If there is a new item not in the existing data, it adds an `ItemView`. If an existing item is not in the new `items`, it removes the corresponding `ItemView`. However, this method does **not** update the `ItemView` contents themselves. If you want to update the internals of every `ItemView` based on the new `this.data`, call the `redraw()` method.

## move()
  
`move(at: number, to: number): this;`

Moves the `itemView` (and the corresponding data) from index `at` to index `to`.
