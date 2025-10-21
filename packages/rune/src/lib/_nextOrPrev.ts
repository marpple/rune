export function _nextOrPrev(
  nextOrPreviousElementSibling: 'nextElementSibling' | 'previousElementSibling',
  selector: string,
  element: HTMLElement,
): HTMLElement | null {
  do {
    element = element[nextOrPreviousElementSibling] as HTMLElement;
  } while (element && !element.matches(selector));
  return element;
}
