/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { View } from './View';
import { Page } from './Page';
import type { VirtualView } from './VirtualView';

type Constructor = new (...args: any) => any;

class Rune {
  private _weakMap = new WeakMap();
  set(element: HTMLElement | EventTarget, instance: any, Constructor?: Constructor) {
    return this._weakMap.set(
      element,
      this._getMap(element).set(Constructor ?? instance.constructor, instance),
    );
  }

  get<T extends Constructor>(
    element: HTMLElement | EventTarget,
    Constructor: T,
  ): InstanceType<typeof Constructor> | undefined {
    const instance = this._getMap(element).get(Constructor);
    return instance === undefined ? instance : (instance as InstanceType<typeof Constructor>);
  }

  private _getMap(element: HTMLElement | EventTarget) {
    return this._weakMap.get(element) || this._weakMap.set(element, new Map()).get(element);
  }

  getView<T extends Constructor>(
    element: HTMLElement | EventTarget,
    Constructor: T,
  ): InstanceType<typeof Constructor> | undefined {
    return this.get(element, Constructor);
  }

  getUnknownView(element: HTMLElement | EventTarget) {
    return this.get(element, View);
  }

  protected _getPageByParentView(currentView: VirtualView<object>) {
    do {
      if (currentView instanceof Page) {
        return currentView as Page<object>;
      }
    } while ((currentView = currentView.parentView!));
  }

  getPage(currentView: VirtualView<object>): Page<object> | undefined {
    let page: View<object> | undefined;
    if (currentView) {
      page = this._getPageByParentView(currentView);
    }
    if (!page && typeof window !== 'undefined') {
      const element = document.querySelector(`body [data-rune]`);
      if (element) {
        page = this.getUnknownView(element);
      }
    }
    return page;
  }

  getSharedData(currentView: VirtualView<object>): Record<string, any> | undefined {
    return this.getPage(currentView)?.sharedData;
  }
}

export const rune = new Rune();

if (typeof window !== 'undefined') {
  window.__rune__ = rune;
}
