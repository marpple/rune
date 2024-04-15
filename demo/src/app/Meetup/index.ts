import { html, Page } from 'rune-ts';
import { main } from './SettingPage';
import { main as main2 } from './TodoPage';
import { StyleView } from './style';

export type Meetup = Record<string, string>;

export class MeetupPage extends Page<Meetup> {
  override template() {
    return html`
      <div>
        ${new StyleView({})}
        <div id="tutorial"></div>
      </div>
    `;
  }

  override onRender() {
    main();
    main2();
  }
}

export const MeetupRouter = {
  ['/tutorials']: MeetupPage,
};
