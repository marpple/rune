import { Page } from 'rune';
import { MarppleShopLayout, MarppleShopLayoutData } from '../../MarppleShopLayout';
import { ColorView } from './ColorPicker/ColorView';
import { ColorCheckboxListView, ColorCheckboxView } from './ColorPicker/ColorPicker2';

export type Tutorial = Record<string, string>;

export class TutorialPage extends Page<Tutorial> {
  override template() {
    return this.html`
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
        ${new ColorView('red')}
        ${new ColorView('red').setData('blue')}
        
        <ul>
          ${new ColorCheckboxView({ value: { colorCode: 'green' } })}
          ${new ColorCheckboxView({ value: { colorCode: 'yellow' }, checked: true })}
        </ul>
        
      </div>
    `;
  }

  override onMount() {
    const parentElement = this.element();

    document.body.appendChild(new ColorView('pink').render());

    console.log(new ColorCheckboxView({ value: { colorCode: 'green' } }).toHtml());
    console.log(
      new ColorCheckboxView({
        value: { colorCode: 'yellow' },
        checked: true,
      }).toHtml(),
    );

    // const cv = new ColorCheckboxView();

    // new ColorCheckboxListView([
    //   { colorCode: 'red' },
    //   { colorCode: 'blue', checked: true },
    //   { colorCode: 'green' },
    //   { colorCode: 'yellow' },
    // ]);

    const colorCheckboxListView = new ColorCheckboxListView([
      { value: { colorCode: 'red' } },
      { value: { colorCode: 'blue' }, checked: true },
      { value: { colorCode: 'green' } },
      { value: { colorCode: 'yellow' } },
    ]);

    document.body.appendChild(colorCheckboxListView.render());

    colorCheckboxListView.addEventListener('change', function () {
      console.log(this.checkedDatas().map((a) => a.value.colorCode));
      // ['blue', 'green']
    });

    return this;
  }
}

export interface TutorialRouter {
  ['/tutorials']: (data: Tutorial, locals: MarppleShopLayoutData) => MarppleShopLayout;
}

export const TutorialRouter: TutorialRouter = {
  ['/tutorials'](data: Tutorial, locals: MarppleShopLayoutData): MarppleShopLayout {
    return new MarppleShopLayout(new TutorialPage(data), locals);
  },
};
