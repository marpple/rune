import { Layout, Page, UnsafeHtml, html } from 'rune-ts';
import { manifest } from '@rune-ts/server';

export interface MarppleShopLayoutData {
  __host_name: string;
  __bundle_port: number;
  title: string;
  description: string;
}

const ESCAPE_LOOKUP: Record<string, string> = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export const ESCAPE_REGEX = /[&><\u2028\u2029]/g;

export function htmlEscapeJsonString(str: string): string {
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
export class MarppleShopLayout extends Layout<MarppleShopLayoutData> {
  styleSheet: () => UnsafeHtml;
  dataScript: () => UnsafeHtml;
  entryScript: () => UnsafeHtml;

  constructor(page: Page<any>, data: MarppleShopLayoutData) {
    super(page, data);

    this.styleSheet = () =>
      manifest?.['main.css']
        ? html.preventEscape(`
        <link rel="stylesheet" href="${manifest?.['main.css']}" />`)
        : html.preventEscape('');

    this.dataScript = () =>
      html.preventEscape(`
        <script 
          id="__RUNE_DATA__"
          type="application/json"
        >
          ${htmlEscapeJsonString(
            JSON.stringify({
              data: page.data,
              layoutData: data,
              path: this.path,
              manifest,
            }),
          )}
        </script>`);

    this.entryScript = () =>
      html.preventEscape(`
        <script crossorigin="anonymous" src="${manifest['main.js']}"></script>
        <script crossorigin="anonymous" src="${manifest['vendors.js']}"></script>
        <script crossorigin="anonymous" src="${manifest['runtime.js']}"></script>`);
  }

  override template(data: MarppleShopLayoutData) {
    return html`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${data.title}</title>
          <meta name="description" content="${data.description}" />
          ${this.styleSheet()}
        </head>
        <body>
          <div id="body">${this.page}</div>
          <div>${this.dataScript()} ${this.entryScript()}</div>
        </body>
      </html>
    `;
  }
}
