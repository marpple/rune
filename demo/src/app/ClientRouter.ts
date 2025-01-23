import { createRouter } from '@rune-ts/server';
import { TodoPage } from './todo';
import { SettingPage } from './setting';

export const ClientRouter = createRouter({
  '/todo': TodoPage,
  '/setting': SettingPage,
});
