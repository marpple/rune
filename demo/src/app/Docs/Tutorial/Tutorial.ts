import { Page, html } from 'rune-ts';
import { ColorView } from './ColorPicker/ColorView';
import { ColorCheckboxListView, ColorCheckboxView } from './ColorPicker/ColorPicker';
import { main } from './LoungeMain2';

export type Tutorial = Record<string, string>;

export class TutorialPage extends Page<Tutorial> {
  override template() {
    return html`
      <div>
        <style>
          .ColorView {
            width: 20px;
            height: 20px;
            border-radius: 10px;
          }
          .ColorCheckboxView {
            border: 1px solid transparent;
            border-radius: 20px;
            padding: 2px;
            margin: 4px;
            display: inline-block;
          }
          .ColorCheckboxView.checked {
            border-color: black;
          }
        </style>

        <h1>컬러피커</h1>
        ${new ColorView({ colorCode: 'red' })}

        <ul>
          ${new ColorCheckboxView({ code: 'green' })}
          ${new ColorCheckboxView({ code: 'yellow', checked: true })}
        </ul>
      </div>
    `;
  }

  override onMount() {
    const parentElement = this.element();

    document.body.appendChild(new ColorView({ colorCode: 'pink' }).render());

    console.log(new ColorCheckboxView({ code: 'green' }).toHtml());
    console.log(new ColorCheckboxView({ code: 'yellow', checked: true }).toHtml());

    // new ColorCheckboxListView([
    //   { code: 'red' },
    //   { code: 'blue', checked: true },
    //   { code: 'green' },
    //   { code: 'yellow' },
    // ]);

    const colorCheckboxListView = new ColorCheckboxListView([
      { code: 'red' },
      { code: 'blue', checked: true },
      { code: 'green' },
      { code: 'yellow' },
    ]);

    document.body.appendChild(colorCheckboxListView.render());

    colorCheckboxListView.addEventListener('change', function () {
      console.log(this.checkedColors().map(({ code }) => code));
      // ['blue', 'green']
    });

    main();

    return this;
  }
}

export const TutorialRouter = {
  ['/tutorials2']: TutorialPage,
};
