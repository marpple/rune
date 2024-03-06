export function _nextOrPrevAll(
  nextOrPreviousElementSibling: 'nextElementSibling' | 'prevElementSibling',
  pushOrUnshift: 'push' | 'unshift',
  selector: string,
  element: HTMLElement,
) {
  const res: unknown[] = [];
  while ((element = element[nextOrPreviousElementSibling])) {
    if (element.matches(selector)) res[pushOrUnshift](element);
  }
  return res;
}
