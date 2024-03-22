import { Layout } from './Layout';

interface Router {
  string: (...args: unknown[]) => Layout<object>;
}

function createRouter<T>(router: T): T {
  Object.entries(router as Router).forEach(([k, f]) => {
    router[k] = function (...args: unknown[]) {
      const layout: Layout<object> = f(...args);
      layout.path = k;
      return layout;
    };
    router[k].toString = function () {
      return k;
    };
  });
  return router;
}

function isServer() {
  return typeof window === 'undefined';
}

export const LayoutHelper = {
  createRouter,
};
