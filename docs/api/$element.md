# DOM Manipulation

최근 [Web API](https://developer.mozilla.org/ko/docs/Web/API)는 많은 발전을 이루었으며 브라우저들의 표준화로 수많은 최신 기능들을 바로 사용할 수 있게 되었습니다. [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element), [HTMLElement](https://developer.mozilla.org/ko/docs/Web/API/HTMLElement), [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) 등의 웹 표준 기술들을 사용하면 더 나은 사용자 경험을 제공하는 프론트엔드 앱 개발이 가능합니다. Rune은 개발자가 Web API를 이용할 때 DOM 조작과 코딩 패턴에 있어 약간의 편의성을 더할 라이브러리를 제공합니다.

## static $()

```
function $(selector: string): $Element | null;
function $(element: HTMLElement): $Element | null;
function $($element: $Element): $Element | null;
```

```typescript
const div: $Element = $('div')!;
```

## static $.all()

`static all(selector: string): $Element[];`

```typescript
const divs: $Element[] = $('div');
```

## element()

`element(): HTMLElement;`

## find()

`find(selector: string): $Element | null`

자식 요소를 찾습니다.

## findAll()

`findAll(selector: string): $Element[]`

자식 요소들을 찾습니다.

## 확장된 CSS 선택자

```html
<div class="container div1" active="true">
  <ul class="list1">
    <li class="item1">1</li>
    <li class="item2">2</li>
    <li class="item3">3</li>
  </ul>
  <div class="div2" active="true">
    <ul class="list2">
      <li class="item4">4</li>
      <li class="item5">5</li>
    </ul>
  </div>
</div>
```

Web API의 기본 `querySelector`나 `querySelectorAll`는 CSS 선택자의 시작으로 `>` 를 사용할 수 없습니다.

```typescript
try {
  document.querySelector(".container")!.querySelectorAll("> ul li");
} catch (e) {
  console.log(e);
  // DOMException: Failed to execute 'querySelectorAll' on 'Element': '> ul li' is not a valid selector.
}
```

`find()`나 `findAll()`를 이용하면 `>`를 선택자의 시작으로 사용할 수 있습니다.

```typescript
$(".container").findAll("> ul li");
// [li.item1, li.item2, li.item3]
```

Web API의 기본 `querySelector`나 `querySelectorAll`는 셀렉터의 시작이 항상 부모도 포함한다는 점을 유의해야합니다.

```typescript
document.querySelector(".container").querySelectorAll("[active=true] > ul li");
// [li.item1, li.item2, li.item3, li.item4, li.item5]
```

`find()`나 `findAll()`에서는 `&`를 사용하여 부모 `element`에 대한 부모를 포함하여 추가 조건을 붙일 것인지를 명시적으로 구분할 수 있습니다. `&`가 없다면 항상 자식요소부터 찾게 됩니다.

```typescript
$(".container").findAll('&[active="true"] li');
// [li.item1, li.item2, li.item3, li.item4, li.item5]

$(".container").findAll('&[active="true"] > ul li');
// [li.item1, li.item2, li.item3]

$(".container").findAll('&[active="false"] li');
// []
```

## closest() 

`closest(selector: string): $Element | null;`

## children()

`children(): $Element[];`

## prev()

`prev(selector: string): $Element;`

## next()

`next(selector: string): $Element;`

## prevAll()

`prevAll(selector: string): $Element[];`

## nextAll()

`nextAll(selector: string): $Element[];`

## siblings()

`siblings(selector: string): $Element[];`

## parentNode()

`parentNode(): $Element | null;`

## is()

`is(selector: string): boolean;`

## matches()

`matches(selector: string): boolean;`

## contains()

`contains(child: $Element | HTMLElement): boolean;`

## getValue()

`getValue(): string;`

## setValue()

`setValue(value: string): this;`

## floatValue()

`floatValue(): number;`

## getAttribute()

`getAttribute(name: string): string | null;`

## getAttributes()

`getAttributes(names: string[]): Record<string, string | null>;`

## setAttribute()

`setAttribute(name: string, value: any): this;`

## setAttributes()

`setAttributes(attributes: Record<string, any>): this;`

## removeAttribute()

`removeAttribute(name: string): this;`

## getInnerHtml()

`getInnerHtml(): string;`

## setInnerHtml()

`setInnerHtml(html: string): this;`

## getTextContent()

`getTextContent(): string | null;`

## setTextContent()

`setTextContent(html: string): this;`

## addClass()

`addClass(...classNames: string[]): this;`

## removeClass()

`removeClass(...classNames: string[]): this;`

## hasClass()

`hasClass(className: string): boolean;`

## getComputedStyle()

`getComputedStyle(property: keyof CSSStyleDeclaration): string;`

## getComputedStyles()

`getComputedStyles(properties: (keyof CSSStyleDeclaration)[]): Record<string, string>;`

## offsetFromBody()

`offsetFromBody(): { top: number; left: number };`

## append()

`append(child: $Element | HTMLElement): this;`

## appendTo()

`appendTo(parent: $Element | HTMLElement): this;`

## prepend()

`prepend(child: $Element | HTMLElement): this;`

## prependTo()

`prependTo(parent: $Element | HTMLElement): this;`

## remove()

`remove(): this;`

## delegate()

```typescript
delegate<K extends keyof HTMLElementEventMap>(
  eventType: K,
  selector: string,
  listener: (this: HTMLElement, e: HTMLElementEventMap[K]) => any,
): this;
delegate<T extends Event>(
  eventType: string,
  selector: string,
  listener: (this: HTMLElement, ev: T) => any,
): this;
```

## chain()

`chain(f: (element: HTMLElement) => HTMLElement | void): $Element;`

## to()

`to<T>(f: (element: HTMLElement) => T): T;`