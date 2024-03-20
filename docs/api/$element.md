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

## static $.fromHtml()

`static fromHtml(htmlStr: string): $Element;`

HTML 문자열로 HTMLElement를 생성하여 $Element를 리턴합니다.

```typescript
$.fromHtml('<div class="rune"></div>');
// div.rune
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

자신을 포함하여 셀렉터와 매칭되는 부모 엘리먼트를 찾습니다.


## children()

`children(): $Element[];`

모든 자식 요소를 가져옵니다.

## prev()

`prev(selector: string): $Element;`

Web API의 `prevElementSibling`을 하면서 selector와 매칭되는 첫 번째 요소를 가져옵니다.

## next()

`next(selector: string): $Element;`

Web API의 `nextElementSibling`을 하면서 selector와 매칭되는 첫 번째 요소를 가져옵니다.

## prevAll()

`prevAll(selector: string): $Element[];`

Web API의 `prevElementSibling`을 하면서 selector와 매칭되는 모든 요소를 가져옵니다.

## nextAll()

`nextAll(selector: string): $Element[];`

Web API의 `nextElementSibling`을 하면서 selector와 매칭되는 모든 요소를 가져옵니다.

## siblings()

`siblings(selector: string): $Element[];`

자신을 제외한 자신과 동일한 레벨의 엘리먼트들 selector와 매칭되는 모든 요소를 가져옵니다.

## parentNode()

`parentNode(): $Element | null;`

`parentNode`를 가져옵니다.

## is()

`is(selector: string): boolean;`

[Element: matches() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches)와 같습니다.

## matches()

`matches(selector: string): boolean;`

[Element: matches() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches)와 같습니다.

## contains()

`contains(child: $Element | HTMLElement): boolean;`

[Node: contains()](https://developer.mozilla.org/en-US/docs/Web/API/Node/contains)와 같습니다.

## getValue()

`getValue(): string;`

`element.value`를 가져옵니다. 

## setValue()

`setValue(value: string): this;`

`element.value`를 변경합니다.

## floatValue()

`floatValue(): number;`

`parseFloat(this.getValue())` 입니다. `<input type="number" />`에 사용하면 편리합니다. 

## getAttribute()

`getAttribute(name: string): string | null;`

[Element: getAttribute() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute)와 같습니다.

## getAttributes()

`getAttributes(names: string[]): Record<string, string | null>;`

attributes들을 가져오면서 key를 CamelCase로 변경합니다.

## setAttribute()

`setAttribute(name: string, value: any): this;`

[Element: setAttribute() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute)와 같습니다.

## setAttributes()

`setAttributes(attributes: Record<string, any>): this;`

attributes들을 변경합니다.

## removeAttribute()

`removeAttribute(name: string): this;`

[Element: removeAttribute() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute)와 같습니다.


## getInnerHtml()

`getInnerHtml(): string;`

[Element: innerHTML property](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)와 같습니다.

## setInnerHtml()

`setInnerHtml(html: string): this;`

[Element: innerHTML property](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)와 같습니다.

## getTextContent()

`getTextContent(): string | null;`

[Node: textContent property](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)와 같습니다.

## setTextContent()

`setTextContent(html: string): this;`

[Node: textContent property](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)와 같습니다.

## addClass()

`addClass(...classNames: string[]): this;`

[Element: classList property](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)와 같습니다.


## removeClass()

`removeClass(...classNames: string[]): this;`

[Element: classList property](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)와 같습니다.

## hasClass()

`hasClass(className: string): boolean;`

[DOMTokenList: contains() method](https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/contains)와 같습니다.

## getComputedStyle()

`getComputedStyle(property: keyof CSSStyleDeclaration): string;`

`element.ownerDocument.defaultView?.getComputedStyle`를 쉽게 가져옵니다.

## getComputedStyles()

`getComputedStyles(properties: (keyof CSSStyleDeclaration)[]): Record<string, string>;`

`getComputedStyle`들을 가져옵니다.

## offsetFromBody()

`offsetFromBody(): { top: number; left: number };`

document 시작으로부터 좌표를 구합니다. 

```javascript
offsetFromBody() {
  const rect = this._element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  };
}
```

## append()

`append(child: $Element | HTMLElement): this;`

[Element: append() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/append)와 같습니다.

## appendTo()

`append(...children: ($Element | HTMLElement)[]): this;`

## prepend()

`prepend(...children: ($Element | HTMLElement)[]): this`

[Element: prepend() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend)와 같습니다.

## prependTo()

`prependTo(parent: $Element | HTMLElement): this;`

## after()

`after(...children: ($Element | HTMLElement)[]): this`

[Element: after() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/after)와 같습니다.

## before()

`before(...children: ($Element | HTMLElement)[]): this`

[Element: before() method](https://developer.mozilla.org/en-US/docs/Web/API/Element/before)와 같습니다.

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