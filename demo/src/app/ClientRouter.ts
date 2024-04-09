// import { TutorialRouter } from './Docs/Tutorial/Tutorial';
//
// export type ClientRouter = TutorialRouter;
//
// export const ClientRouter: ClientRouter = LayoutHelper.createRouter<ClientRouter>({
//   ...TutorialRouter,
// });

import { createRouter } from '@rune-ts/server';
import { MeetupRouter } from './Meetup';
import { BannerRouter } from './Banner/router';

// import { MeetupRouter } from './Lecture/index';

export type ClientRouter = typeof MeetupRouter & typeof BannerRouter;

export const ClientRouter = createRouter<ClientRouter>({
  ...MeetupRouter,
  ...BannerRouter,
});
