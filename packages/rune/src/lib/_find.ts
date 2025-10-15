const idCreator = () => {
  let i = 0;
  return () => 'rune-element-id-' + i++;
};

const createId = idCreator();

type QuerySelectorMethodNames = 'querySelector' | 'querySelectorAll';

export default function _find(
  querySelectorMethodName: QuerySelectorMethodNames,
  selector: string,
  element: HTMLElement,
) {
  const id = element.id;
  element.id = id || createId();
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const res = (element as any)[querySelectorMethodName](
    '#' + element.id + (selector.startsWith('&') ? selector.substring(1) : ' ' + selector),
  );
  if (!id) element.removeAttribute('id');
  return res;
}
