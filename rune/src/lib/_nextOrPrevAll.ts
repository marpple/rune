export function _nextOrPrevAll(
  nextOrPreviousElementSibling: 'nextElementSibling' | 'previousElementSibling',
  pushOrUnshift: 'push' | 'unshift',
  selector: string,
  element: HTMLElement,
) {
  const res: unknown[] = [];
  while ((element = element[nextOrPreviousElementSibling] as HTMLElement)) {
    if (element.matches(selector)) res[pushOrUnshift](element);
  }
  return res;
}
