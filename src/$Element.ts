import { each, filter, pipe } from '@fxts/core';
import elementFromHtml from './lib/_elementFromHtml';
import _find from './lib/_find';
import _toIterator from './lib/_toIterator';
import { _nextOrPrevAll } from './lib/_nextOrPrevAll';
import { _nextOrPrev } from './lib/_nextOrPrev';
import _toCamel from './lib/_toCamel';
import _toDash from './lib/_toDash';

export class $Element {
  private _element: HTMLElement;
  private _prev$Element: $Element | undefined;
  private _error: Error | undefined;

  constructor(element: HTMLElement, prev$Element?: $Element, error?: Error) {
    if (element === undefined) throw new Error('element is undefined');
    this._element = element;
    this._prev$Element = prev$Element;
    this._error = error;
  }

  throwIfNull(error?: Error): $Element {
    return $Element.throwIfNull(this._element, error);
  }

  element(): HTMLElement {
    return this._element;
  }

  end(): $Element | undefined {
    return this._prev$Element;
  }

  find(selector: string): $Element | null {
    return $(
      _find('querySelector', selector, this._element),
      this,
      this._error,
    );
  }

  findAll(selector: string): $Element[] {
    return $Element.to$Elements(
      _find('querySelectorAll', selector, this._element),
    );
  }

  closest(selector: string): $Element | null {
    return $(this._element.closest(selector), this, this._error);
  }

  children(): $Element[] {
    return $Element.to$Elements(_toIterator(this._element.children));
  }

  prevAll(selector: string): $Element[] {
    return $Element.to$Elements(
      _nextOrPrevAll('prevElementSibling', 'unshift', selector, this._element),
    );
  }

  nextAll(selector: string): $Element[] {
    return $Element.to$Elements(
      _nextOrPrevAll('nextElementSibling', 'push', selector, this._element),
    );
  }

  prev(selector: string): $Element {
    return $(_nextOrPrev('prevElementSibling', selector, this._element));
  }

  next(selector: string): $Element {
    return $(_nextOrPrev('nextElementSibling', selector, this._element));
  }

  siblings(selector: string) {
    return [..._toIterator(this._element.parentNode!.children)].filter(
      (element2) => this._element !== element2 && element2.matches(selector),
    );
  }

  parentNode(): $Element | null {
    return $(this._element.parentNode as HTMLElement | null, this, this._error);
  }

  is(selector: string): boolean {
    return this._element.matches(selector);
  }

  matches(selector: string): boolean {
    return this.is(selector);
  }

  contains(child: $Element | HTMLElement): boolean {
    return this._element.contains($(child)._element);
  }

  getValue(): string {
    const value: string = (this._element as HTMLInputElement).value;
    if (value === undefined) {
      throw new Error("This element has no property defined as 'value'.");
    }
    return value;
  }

  setValue(value: string): this {
    (this._element as HTMLInputElement).value = value;
    return this;
  }

  floatValue(): number {
    return parseFloat(this.getValue());
  }

  getAttribute(name: string): string | null {
    return this._element.getAttribute(name);
  }

  getAttributes(names: string[]): Record<string, string | null> {
    return Object.fromEntries(
      names.map((name) => [_toCamel(name), this._element.getAttribute(name)]),
    );
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  setAttribute(name: string, value: any): this {
    this._element.setAttribute(_toDash(name), value);
    return this;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  setAttributes(attributes: Record<string, any>) {
    Object.entries(attributes).forEach(([name, value]) =>
      $(this).setAttribute(name, value),
    );
    return this;
  }

  removeAttribute(name: string): this {
    this._element.removeAttribute(name);
    return this;
  }

  getInnerHtml(): string {
    return this._element.innerHTML;
  }

  setInnerHtml(html: string): this {
    this._element.innerHTML = html;
    return this;
  }

  getTextContent(): string | null {
    return this._element.textContent;
  }

  setTextContent(html: string): this {
    this._element.textContent = html;
    return this;
  }

  addClass(...classNames: string[]): this {
    this._element.classList.add(...classNames);
    return this;
  }

  removeClass(...classNames: string[]): this {
    this._element.classList.remove(...classNames);
    return this;
  }

  hasClass(className: string): boolean {
    return this._element.classList.contains(className);
  }

  getComputedStyle(property: keyof CSSStyleDeclaration): string {
    const element = this._element;
    this._element.style;
    return element.ownerDocument.defaultView?.getComputedStyle(element, null)[
      _toCamel(property.toString())
    ];
  }

  getComputedStyles(
    properties: (keyof CSSStyleDeclaration)[],
  ): Record<string, string> {
    return Object.fromEntries(
      properties.map((property) => [
        _toCamel(property.toString()),
        this.getComputedStyle(property),
      ]),
    );
  }

  offsetFromBody(): { top: number; left: number } {
    const rect = this._element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    };
  }

  append(child: $Element | HTMLElement): this {
    this._element.appendChild($(child)._element);
    return this;
  }

  appendTo(parent: $Element | HTMLElement): this {
    $(parent).append(this._element);
    return this;
  }

  prepend(child: $Element | HTMLElement): this {
    this._element.insertBefore($(child)._element, this._element.firstChild);
    return this;
  }

  prependTo(parent: $Element | HTMLElement): this {
    $(parent).prepend(this._element);
    return this;
  }

  remove(): this {
    this._element.remove();
    return this;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
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
  delegate<K extends keyof HTMLElementEventMap>(
    eventType: K | string,
    selector: string,
    listener:
      | ((this: HTMLElement, e: HTMLElementEventMap[K]) => void)
      | ((this: HTMLElement, ev: Event) => any),
  ): this {
    this._element.addEventListener(eventType, (e: Event) => {
      pipe(
        this.findAll(selector),
        filter(($currentTarget: $Element) => {
          if (!e.target) return false;
          return $currentTarget.contains(e.target as HTMLElement);
        }),
        each(($currentTarget: $Element) => {
          listener.call(this._element, {
            ...(e as HTMLElementEventMap[K]),
            target: e.target,
            currentTarget: $currentTarget._element,
          } as HTMLElementEventMap[K]);
        }),
      );
    });
    return this;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  to<T>(f: (element: HTMLElement) => T): T {
    return f(this._element);
  }

  chain(f: (element: HTMLElement) => HTMLElement | void): $Element {
    const element2 = f(this._element);
    return !element2 || element2 === this._element ? this : $(element2);
  }

  static all = (selector: string): $Element[] => {
    return $Element.to$Elements(document.querySelectorAll(selector));
  };

  static fromHtml = (htmlStr: string): $Element => {
    htmlStr = htmlStr.trim();
    return htmlStr.startsWith('<')
      ? $(elementFromHtml(htmlStr))
      : $(document.createElement(htmlStr));
  };

  static to$Elements = <T>(
    elements: Iterable<T> | ArrayLike<T>,
  ): $Element[] => {
    return [..._toIterator(elements)].map((element) => $(element));
  };

  static throwIfNull = (
    element: HTMLElement | Element | $Element,
    throwIfNullError?: Error,
  ): $Element => {
    return $(
      element,
      undefined,
      throwIfNullError || new Error('HTMLElement not found.'),
    );
  };
}

function $(
  element: null,
  prev$Element?: $Element,
  throwIfNullError?: Error,
): null;
function $<T>(
  element: string | HTMLElement | Element | $Element | T,
  prev$Element?: $Element,
  throwIfNullError?: Error,
): $Element;
function $<T>(
  element: string | HTMLElement | Element | $Element | T | null,
  prev$Element?: $Element,
  throwIfNullError?: Error,
): $Element | null;
function $<T>(
  element: string | HTMLElement | Element | $Element | T | null,
  prev$Element?: $Element,
  throwIfNullError?: Error,
): $Element | null {
  if (typeof element === 'string') {
    return $(document.querySelector(element), prev$Element, throwIfNullError);
  }
  if (throwIfNullError && element === null) {
    throw throwIfNullError;
  }
  return element === null
    ? null
    : element instanceof $Element
      ? element
      : new $Element(element as HTMLElement, prev$Element, throwIfNullError);
}

$.all = $Element.all;
$.fromHtml = $Element.fromHtml;
$.to$Elements = $Element.to$Elements;
$.throwIfNull = $Element.throwIfNull;

export { $ };
