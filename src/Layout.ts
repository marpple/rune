import { VirtualView } from './VirtualView';
import { Page } from './Page';

export class Layout<T> extends VirtualView<T> {
  override root = true;
  page: Page<unknown>;
  path = '';

  constructor(page: Page<unknown>, layoutData: T) {
    super(layoutData);
    this.page = page;
  }

  override template(data: T) {
    return this.html`
      <html>
        <head>
          <title>${data}</title>
          <meta name="description" content="rune">
        </head>
        <body>
          ${this.page}
        </body>
      </html>
    `;
  }
}
