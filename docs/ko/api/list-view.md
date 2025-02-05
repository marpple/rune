---
outline: deep
---

# ListView class

Array 데이터를 다루는 기본 뷰 클래스입니다. View class를 상속 받았기 때문에 View의 기능도 그대로 모두 사용할 수 있습니다.

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

ListView 안에서 사용할 ItemView 클래스를 정의하고 `ListView<DessertView>`와 같이 ListView 클래스의 타입 인자로 전달하면 됩니다.

## Create

`new (data: T) => ListView<IV>;`

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

전달 받은 데이터를 `this.data`에 추가하고 `ItemView`를 생성하여 화면과 `itemViews`에 반영합니다.

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

추가 옵션인 `at`을 이용하면 원하는 위치에 추가할 수 있습니다.

## append()

`append(item: T): this;`

전달 받은 데이터를 `this.data`에 추가하고 `ItemView`를 생성하여 화면과 `itemViews`에 반영합니다.

## appendAll()

`appendAll(items: T[]): this;`

전달 받은 데이터를 `this.data`에 추가하고 `ItemView`를 생성하여 화면과 `itemViews`에 반영합니다.

## prepend()

`prepend(item: T): this;`

전달 받은 데이터를 `this.data`에 추가하고 `ItemView`를 생성하여 화면과 `itemViews`에 반영합니다.

## prependAll()

`prependAll(items: T[]): this;`

전달 받은 데이터를 `this.data`에 추가하고 `ItemView`를 생성하여 화면과 `itemViews`에 반영합니다.

## remove()

`remove(item: T): IV | undefined;`

레퍼런스가 동일한 `item` 을 받아 `this.data`에서 `item`을 삭제하고 `itemViews`와 화면에서 `ItemView` 객체를 삭제하고 삭제를 성공하면 삭제된 `ItemView` 객체를 리턴합니다.

## removeAll()

`removeAll(items: T[]): IV[];`

`remove()`와 동일하게 동작하며 배열을 받아 모두 삭제합니다.

## removeByItemView()

`removeByItemView(itemView: IV): IV | undefined;`

`remove()`와 동일하게 동작하며 `itemView`와 레퍼런스가 동일한 값을 삭제합니다.

## removeAllByItemViews()

`removeAllByItemViews(itemViews: IV[]): IV[];`

`removeByItemView()`와 동일하게 동작하며 배열을 받아 모두 삭제합니다.

## removeByIndex()

`removeByIndex(idx: number): IV | undefined;`

`remove()`와 동일하게 동작하며 `idx` 값으로 삭제합니다.

## removeBy()

`removeBy(f: (itemView: IV) => boolean): IV | undefined;`

`itemView`를 순회하면서 `f` 함수에게 전달하여 참이 조건이 되는 첫 번째 `ItemView` 객체를 삭제합니다.

## removeAllBy()

`removeAllBy(f: (itemView: IV) => boolean): IV[];`

`removeBy()`와 동일하게 동작하며 참이 되는 모든 `ItemView` 객체들을 삭제합니다.

## reset()

`reset(): this;`

모두 삭제합니다.

## set()

`set(items: T[]): this;`

새로 받은 `items`로 기존의 `this.data`와 비교하여 최소한의 변경으로 `this.data`와 화면을 갱신합니다. 기존 데이터에 없던 새로운 `item`이 있으면 `ItemView`를 추가하고, 기존 `item`이 새로운 `items`에 없으면 `ItemView`를 제거합니다. 다만, 이 메서드에서는 `ItemView` 자체를 갱신하지는 않습니다. `this.data`를 기준으로 모든 `ItemView` 내부도 갱신하고자 한다면, `redraw()` 메서드를 실행하면 됩니다. 

## move()

`move(at: number, to: number): this;`

`at`이 인덱스였던 `itemView`와 데이터의 위치를 `to`로 이동합니다.
