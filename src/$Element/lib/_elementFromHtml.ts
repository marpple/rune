type ContainerKeys = 'tr' | 'tbody' | 'thead' | 'tfoot' | 'td' | 'th';

type _elementFromHtml = (htmlStr: string) => HTMLElement;

let elementFromHtml: _elementFromHtml;

if (typeof window === 'undefined') {
  elementFromHtml = function () {
    console.warn('Do not use it in Node.js');
  } as unknown as _elementFromHtml;
} else {
  const fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    div = document.createElement('div'),
    containers = {
      tr: document.createElement('tbody'),
      tbody: table,
      thead: table,
      tfoot: table,
      td: tableRow,
      th: tableRow,
    };

  elementFromHtml = function (htmlStr: string): HTMLElement {
    htmlStr = htmlStr.trim();
    const [name] = htmlStr.match(fragmentRE)!;
    const container = containers[name as ContainerKeys] || div;
    container.innerHTML = htmlStr;
    return container.firstElementChild as HTMLElement;
  };
}

export default elementFromHtml;
