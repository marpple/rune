import { html, VirtualView } from './VirtualView';
import { Page } from './Page';

export class Layout<T extends object> extends VirtualView<T> {
  override readonly isLayout: boolean = true;

  constructor(
    data: T,
    public page: Page<object>,
  ) {
    super(data);
  }

  override template(data: T) {
    return html`
      <html>
        <head>
          <title>${data}</title>
          <meta name="description" content="rune" />
        </head>
        <body>
          ${this.page.toHtmlSSR()}
        </body>
      </html>
    `;
  }
}
