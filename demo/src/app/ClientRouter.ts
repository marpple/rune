// import { TutorialRouter } from './Docs/Tutorial/Tutorial';
//
// export type ClientRouter = TutorialRouter;
//
// export const ClientRouter: ClientRouter = LayoutHelper.createRouter<ClientRouter>({
//   ...TutorialRouter,
// });

import { createRouter } from '@rune-ts/server';
import { MeetupRouter } from './Meetup';

export type ClientRouter = MeetupRouter;

export const ClientRouter: ClientRouter = createRouter<ClientRouter>({
  ...MeetupRouter,
});
