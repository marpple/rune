# DOM Manipulation

Recent advancements in the [Web API](https://developer.mozilla.org/ko/docs/Web/API) have brought about significant progress, allowing developers to leverage numerous modern features directly across standardized browsers. Technologies like [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element), [HTMLElement](https://developer.mozilla.org/ko/docs/Web/API/HTMLElement), [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API), and others enable frontend app development that provides enhanced user experiences. Rune offers a library that adds a level of convenience to DOM manipulation and coding patterns for developers utilizing Web API functionalities.

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

## static $.fromHtml()

`static fromHtml(htmlStr: string): $Element;`

Creates an HTMLElement from an HTML string and returns a $Element.

```typescript
$.fromHtml('<div class="rune"></div>');
// div.rune
```

## element()

`element(): HTMLElement;`

## find()

`find(selector: string): $Element | null`

Finds a child element.

## findAll()

`findAll(selector: string): $Element[]`

Finds all child elements.

## Extended CSS Selectors

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

The default Web API's `querySelector` and `querySelectorAll` do not support using `>` at the beginning of a CSS selector.

```typescript
try {
  document.querySelector('.container')!.querySelectorAll('> ul li');
} catch (e) {
  console.log(e);
  // DOMException: Failed to execute 'querySelectorAll' on 'Element': '> ul li' is not a valid selector.
}
```

When using `find()` or `findAll()`, you can use `>` at the beginning of the selector:

```typescript
$('.container').findAll('> ul li');
// [li.item1, li.item2, li.item3]
```

The default behavior of `querySelector` and `querySelectorAll` in the Web API is to include the parent element when the selector starts with `>`. It's important to note this behavior:

```typescript
document.querySelector('.container').querySelectorAll('[active=true] > ul li');
// [li.item1, li.item2, li.item3, li.item4, li.item5]
```

In `find()` or `findAll()`, you can use `&` to explicitly indicate whether to include the parent element in additional conditions. If `&` is absent, it always starts searching from the child elements:

```typescript
$('.container').findAll('&[active="true"] li');
// [li.item1, li.item2, li.item3, li.item4, li.item5]

$('.container').findAll('&[active="true"] > ul li');
// [li.item1, li.item2, li.item3]

$('.container').findAll('&[active="false"] li');
// []
```

The usage of `find()` and `findAll()` allows for a more flexible and explicit way to search for elements based on the parent-child relationship and additional conditions.

## closest()

`closest(selector: string): $Element | null;`

Finds the closest ancestor element that matches the selector, including itself.

## children()

`children(): $Element[];`

Gets all the child elements.

## prev()

`prev(selector: string): $Element;`

Finds the previous sibling element that matches the selector using the Web API's `prevElementSibling`.

## next()

`next(selector: string): $Element;`

Finds the next sibling element that matches the selector using the Web API's `nextElementSibling`.

## prevAll()

`prevAll(selector: string): $Element[];`

Gets all the previous sibling elements that match the selector using the Web API's `prevElementSibling`.

## nextAll()

`nextAll(selector: string): $Element[];`

Gets all the next sibling elements that match the selector using the Web API's `nextElementSibling`.

## siblings()

`siblings(selector: string): $Element[];`

Gets all the sibling elements on the same level that match the selector, excluding itself.

## parentNode()

`parentNode(): $Element | null;`

Gets the parent node.

## is()

`is(selector: string): boolean;`

Similar to the [Element: matches() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches).

## matches()

`matches(selector: string): boolean;`

Similar to the [Element: matches() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches).

## contains()

`contains(child: $Element | HTMLElement): boolean;`

Similar to the [Node: contains()](https://developer.mozilla.org/en-US/docs/Web/API/Node/contains) method.

## getValue()

`getValue(): string;`

Gets the value of the element.

## setValue()

`setValue(value: string): this;`

Sets the value of the element.

## floatValue()

`floatValue(): number;`

Parses the value as a floating-point number using `parseFloat(this.getValue())`. Convenient for `<input type="number" />` elements.

## getAttribute()

`getAttribute(name: string): string | null;`

Similar to the [Element: getAttribute() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute).

## getAttributes()

`getAttributes(names: string[]): Record<string, string | null>;`

Gets the attributes while converting their keys to CamelCase.

## setAttribute()

`setAttribute(name: string, value: any): this;`

Similar to the [Element: setAttribute() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/setAttribute).

## setAttributes()

`setAttributes(attributes: Record<string, any>): this;`

Sets multiple attributes of the element.

## setAttributes()

`setAttributes(attributes: Record<string, any>): this;`

Modifies the attributes of the element.

## removeAttribute()

`removeAttribute(name: string): this;`

Similar to the [Element: removeAttribute() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute).

## getInnerHtml()

`getInnerHtml(): string;`

Similar to the [Element: innerHTML property](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML).

## setInnerHtml()

`setInnerHtml(html: string): this;`

Similar to the [Element: innerHTML property](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML).

## getTextContent()

`getTextContent(): string | null;`

Similar to the [Node: textContent property](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent).

## setTextContent()

`setTextContent(text: string): this;`

Similar to the [Node: textContent property](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent).

## addClass()

`addClass(...classNames: string[]): this;`

Similar to the [Element: classList property](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).

## removeClass()

`removeClass(...classNames: string[]): this;`

Similar to the [Element: classList property](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).

## hasClass()

`hasClass(className: string): boolean;`

Similar to the [DOMTokenList: contains() method](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains).

## getComputedStyle()

`getComputedStyle(property: keyof CSSStyleDeclaration): string;`

Conveniently retrieves the computed style using `element.ownerDocument.defaultView?.getComputedStyle`.

## getComputedStyles()

`getComputedStyles(properties: (keyof CSSStyleDeclaration)[]): Record<string, string>;`

Retrieves computed styles for multiple properties.

## offsetFromBody()

`offsetFromBody(): { top: number; left: number };`

Calculates the coordinates relative to the document origin.

## append()

`append(child: $Element | HTMLElement): this;`

Similar to the [Element: append() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/append).

## appendTo()

`appendTo(parent: $Element | HTMLElement): this;`

Appends the element to the specified parent.

## prepend()

`prepend(...children: ($Element | HTMLElement)[]): this;`

Similar to the [Element: prepend() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend).

## prependTo()

`prependTo(parent: $Element | HTMLElement): this;`

Prepends the element to the specified parent.

## after()

`after(...children: ($Element | HTMLElement)[]): this;`

Similar to the [Element: after() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/after).

## before()

`before(...children: ($Element | HTMLElement)[]): this;`

Similar to the [Element: before() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/before).

## remove()

`remove(): this;`

Removes the element from its parent.

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

Extends the element using the `chain` method.

```typescript
$('#body')
  .addClass('fixed')
  .chain((el: HTMLElement) => el.scrollTo(0, 500))
  .removeClass('fixed');
```

## to()

`to<T>(f: (element: HTMLElement) => T): T;`
