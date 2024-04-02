export function _nextOrPrev(
  nextOrPreviousElementSibling: 'nextElementSibling' | 'previousElementSibling',
  selector: string,
  element: HTMLElement,
) {
  do {
    element = element[nextOrPreviousElementSibling] as HTMLElement;
  } while (!element.matches(selector));
  return element;
}
