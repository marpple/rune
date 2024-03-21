import { ClientRouter } from '../src/app/ClientRouter';

export {};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __rune_SSR_INITIAL_DATA__: any;
    __rune_SSR_INITIAL_PATH__: keyof ClientRouter;
  }
}
