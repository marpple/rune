import { html, VirtualView } from './VirtualView';
import { Page } from './Page';

export class Layout<T extends object> extends VirtualView<T> {
  override root = true;
  page: Page<object>;
  path = '';

  constructor(page: Page<object>, layoutData: T) {
    super(layoutData);
    this.page = page;
  }

  override template(data: T) {
    return html`
      <html>
        <head>
          <title>${data}</title>
          <meta name="description" content="rune" />
        </head>
        <body>
          ${this.page}
        </body>
      </html>
    `;
  }
}
