/* eslint-disable @typescript-eslint/no-explicit-any */
class RuneMap {
  weakMap = new WeakMap();
  set(element: HTMLElement | EventTarget, instance: any) {
    return this.weakMap.set(
      element,
      this.getMap(element).set(instance.constructor, instance),
    );
  }

  getMap(element: HTMLElement | EventTarget) {
    return (
      this.weakMap.get(element) ||
      this.weakMap.set(element, new Map()).get(element)
    );
  }

  get<T extends abstract new (...args: any) => any>(
    element: HTMLElement | EventTarget,
    Constructor: T,
  ): InstanceType<typeof Constructor> | undefined {
    const instance = this.getMap(element).get(Constructor);
    return instance === undefined
      ? instance
      : (instance as InstanceType<typeof Constructor>);
  }
}

export class rune {
  private static viewMap = new RuneMap();
  private static enableMap = new RuneMap();

  static getView(element: HTMLElement | EventTarget): unknown;
  static getView<T extends abstract new (...args: any) => any>(
    element: HTMLElement | EventTarget,
    Constructor: T,
  ): InstanceType<typeof Constructor> | undefined;
  static getView<T extends abstract new (...args: any) => any>(
    element: HTMLElement | EventTarget,
    Constructor?: T | undefined,
  ) {
    if (Constructor === undefined) {
      const [view] = this.viewMap.getMap(element).values();
      return view === undefined ? view : (view as unknown);
    } else {
      return this.viewMap.get(element, Constructor);
    }
  }

  static setView(element: HTMLElement | EventTarget, instance: any) {
    this.viewMap.set(element, instance);
    return this;
  }

  static getEnable<T extends abstract new (...args: any) => any>(
    element: HTMLElement | EventTarget,
    Constructor: T,
  ): InstanceType<typeof Constructor> | undefined {
    return this.enableMap.get(element, Constructor);
  }

  static setEnable(element: HTMLElement | EventTarget, instance: any) {
    this.enableMap.set(element, instance);
    return this;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
