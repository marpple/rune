import { LayoutHelper } from 'rune-ts';
// import { TutorialRouter } from './Docs/Tutorial/Tutorial';
import { MeetupRouter } from './Meetup/index';

export type ClientRouter = MeetupRouter;

export const ClientRouter: ClientRouter = LayoutHelper.createRouter<ClientRouter>({
  ...MeetupRouter,
});
