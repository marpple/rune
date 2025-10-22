// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
import EventEmitter from 'events';

let _global: Map<any, any> = (global as any)._global;

if (!_global) {
  _global = new Map();
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(global as any)._global = _global;

export const globals: Map<any, any> = _global;
export const setGlobal = (key: any, val: any) => {
  globals.set(key, val);
};
