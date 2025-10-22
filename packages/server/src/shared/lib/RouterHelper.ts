import { type Page } from 'rune-ts';

export type FactoryFunction<C> = C extends new (...args: infer P) => any ? (...args: P) => InstanceType<C> : never;
export type Router = Record<string, typeof Page<object>>;
export type RuneRouter<T extends Router> = {
  -readonly [K in keyof T]: FactoryFunction<T[K]>;
};

export const createRouter = function <T extends Record<string, typeof Page<object>>>(router: T) {
  const newRouter: RuneRouter<T> = {} as RuneRouter<T>;
  Object.entries(router).map(([k, v]) => {
    if (newRouter[k]) {
      throw new Error(`Duplicate key found: ${k}, ${v.constructor.name}`);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    newRouter[k] = (...data: ConstructorParameters<typeof v>) => {
      const view = new v(...data);
      view.key = k;
      return view;
    };

    newRouter[k].toString = function () {
      return k;
    };
  });

  return newRouter;
};
