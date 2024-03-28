import { LayoutHelper } from 'rune-ts';
import { TutorialRouter } from './Docs/Tutorial/LoungeTutorial';

export type ClientRouter = TutorialRouter;

export const ClientRouter: ClientRouter = LayoutHelper.createRouter<ClientRouter>({
  ...TutorialRouter,
});
