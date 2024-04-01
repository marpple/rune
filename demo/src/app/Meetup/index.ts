import { html, Page, rune, View } from 'rune-ts';
import { TutorialLayout, type TutorialLayoutData } from '../TutorialLayout';
import { main } from './SettingPage';
import { main as main2 } from './TodoPage';
import { StyleView } from './style';

export type Meetup = Record<string, string>;

export interface MeetupRouter {
  ['/tutorials']: (pageData: Meetup, layoutData: TutorialLayoutData) => TutorialLayout;
}

export const MeetupRouter: MeetupRouter = {
  ['/tutorials'](pageData: Meetup, layoutData: TutorialLayoutData): TutorialLayout {
    return new TutorialLayout(layoutData, new MeetupPage(pageData, { is_mobile: true }));
  },
};

export class MeetupPage extends Page<Meetup> {
  override template() {
    return html`
      <div>
        ${new StyleView({})}
        <div id="tutorial"></div>
      </div>
    `;
  }

  override onMount() {
    main();
    main2();
  }
}
