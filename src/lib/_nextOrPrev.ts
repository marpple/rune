export function _nextOrPrev(
  nextOrPreviousElementSibling: 'nextElementSibling' | 'prevElementSibling',
  selector: string,
  element: HTMLElement,
) {
  do {
    element = element[nextOrPreviousElementSibling];
  } while (!element.matches(selector));
  return element;
}
