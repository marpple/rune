/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
type Constructor = new (...args: any) => any;

class Rune {
  weakMap = new WeakMap();
  set(
    element: HTMLElement | EventTarget,
    instance: any,
    Constructor?: Constructor,
  ) {
    return this.weakMap.set(
      element,
      this._getMap(element).set(Constructor ?? instance.constructor, instance),
    );
  }

  get<T extends Constructor>(
    element: HTMLElement | EventTarget,
    Constructor: T,
  ): InstanceType<typeof Constructor> | undefined {
    const instance = this._getMap(element).get(Constructor);
    return instance === undefined
      ? instance
      : (instance as InstanceType<typeof Constructor>);
  }

  private _getMap(element: HTMLElement | EventTarget) {
    return (
      this.weakMap.get(element) ||
      this.weakMap.set(element, new Map()).get(element)
    );
  }

  getView<T extends Constructor>(
    element: HTMLElement | EventTarget,
    Constructor: T,
  ): InstanceType<typeof Constructor> | undefined {
    return this.get(element, Constructor);
  }
}

export const rune = new Rune();
