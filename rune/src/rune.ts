/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { View } from './View';
import { Page } from './Page';
import type { VirtualView } from './VirtualView';
import { $ } from './$Element';
import { ViewMounted, ViewUnmounted } from './ViewEvent';

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

  addMutationObserver(target: HTMLElement) {
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const addedNode of record.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            const subViewElement = addedNode as HTMLElement;
            if (subViewElement.matches('[data-rune]')) {
              $(subViewElement)
                .parentNode()
                ?.closest('[data-rune]')
                ?.chain((parentViewElement) => {
                  const subView = rune.getUnknownView(subViewElement)!;
                  subView.parentView = rune.getUnknownView(parentViewElement)!;
                  subView.element().dataset.runeParent = subView.parentView.toString();
                });
              dispatchEvents(ViewMounted, subViewElement);
            }
          }
        }
        for (const removedNode of record.removedNodes) {
          if (removedNode.nodeType === Node.ELEMENT_NODE) {
            const subViewElement = removedNode as HTMLElement;
            if (subViewElement.matches('[data-rune]')) {
              const subView = rune.getUnknownView(subViewElement)!;
              subView.parentView = null;
              subView.element().dataset.runeParent = '';
              dispatchEvents(ViewUnmounted, subViewElement);
            }
          }
        }
      }
    });
    observer.observe(target, { childList: true, subtree: true });
  }
}

export const rune = new Rune();

function dispatchEvents(Event: any, subViewElement: HTMLElement) {
  [subViewElement, ...subViewElement.querySelectorAll('[data-rune]')]
    .map((element) => rune.getUnknownView(element)!)
    .forEach((subView) => subView.dispatchEvent(Event, { detail: subView }));
}

if (typeof window !== 'undefined') {
  window.__rune__ = rune;
  rune.addMutationObserver(document.body);
}
