import type { Handler } from 'express';

type FactoryFunction<C> = C extends new (...args: infer P) => any
  ? (...args: P) => InstanceType<C>
  : never;
export type RenderHandler<C> = (view: FactoryFunction<C>) => Handler;
