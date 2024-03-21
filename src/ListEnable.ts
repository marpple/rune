import { Enable, EnableWithOptions } from './Enable';

export abstract class ListEnable<T, E> extends Enable<T[], E> {}

export abstract class ListEnableWithOptions<T, O, E> extends EnableWithOptions<
  T[],
  O,
  E
> {}
