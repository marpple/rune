import { html, Page } from 'rune-ts';
import {
  MarppleShopLayout,
  type MarppleShopLayoutData,
} from '../../MarppleShopLayout';
import { main } from './LoungeMain3';

export type Tutorial = Record<string, string>;

export interface TutorialRouter {
  ['/tutorials']: (
    data: Tutorial,
    locals: MarppleShopLayoutData,
  ) => MarppleShopLayout;
}

export const TutorialRouter: TutorialRouter = {
  ['/tutorials'](
    data: Tutorial,
    locals: MarppleShopLayoutData,
  ): MarppleShopLayout {
    return new MarppleShopLayout(new TutorialPage(data), locals);
  },
};

export class TutorialPage extends Page<Tutorial> {
  override template() {
    return html`<div>
      <style>
        .SwitchView {
          width: 44px;
          border-radius: 15px;
          border: 0 none;
          padding: 5px;
          box-sizing: border-box;
          background-color: #aaa;
          transition-property: background-color;
          transition-duration: 0.2s;
        }
        .SwitchView .toggle {
          width: 18px;
          height: 18px;
          margin: 0;
          border-radius: 9px;
          background: white;
          transform: translateX(0);
          transition-property: transform;
          transition-duration: 0.2s;
        }
        .SwitchView.on {
          background-color: #1d75ff;
        }
        .SwitchView.on .toggle {
          transform: translateX(16px);
        }
        .SettingsView {
          margin: 142px;
          width: 240px;
          box-shadow: 0px 1px 10px #ddd;
          border: 1px solid #eee;
        }
        .SettingsView .body,
        .SettingsView .body li {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .SettingsView .header,
        .SettingsView .body > li {
          position: relative;
          padding: 16px 16px 15px;
          height: 24px;
          line-height: 24px;
          border-top: 1px solid #eee;
        }
        .SettingsView .header .SwitchView,
        .SettingsView .body > li .SwitchView {
          position: absolute;
          top: 13px;
          right: 16px;
        }
      </style>
    </div> `;
  }

  override onMount() {
    main();
  }
}
