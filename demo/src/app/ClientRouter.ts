import { LayoutHelper } from 'rune-ts';

// import { TutorialRouter } from './Docs/Tutorial/Tutorial';
//
// export type ClientRouter = TutorialRouter;
//
// export const ClientRouter: ClientRouter = LayoutHelper.createRouter<ClientRouter>({
//   ...TutorialRouter,
// });

import { MeetupRouter } from './Meetup/index';

export type ClientRouter = MeetupRouter;

export const ClientRouter: ClientRouter = LayoutHelper.createRouter<ClientRouter>({
  ...MeetupRouter,
});
