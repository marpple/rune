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
  private _weakMap = new WeakMap<HTMLElement | EventTarget, Map<Constructor, any>>();
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
    const instance = this._weakMap.get(element)?.get(Constructor);
    return instance === undefined ? instance : (instance as InstanceType<typeof Constructor>);
  }

  delete(element: HTMLElement | EventTarget) {
    this._weakMap.delete(element);
    return this;
  }

  private _getMap(element: HTMLElement | EventTarget) {
    return this._weakMap.get(element) ?? this._weakMap.set(element, new Map()).get(element)!;
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
    let page: Page<object> | undefined;
    if (currentView) {
      page = this._getPageByParentView(currentView);
    }
    if (!page && typeof window !== 'undefined') {
      const element = document.querySelector(`body [data-rune]`);
      if (element) {
        page = this.getUnknownView(element) as Page<object> | undefined;
      }
    }
    return page;
  }

  getSharedData(currentView: VirtualView<object>): Record<string, any> | undefined {
    return this.getPage(currentView)?.sharedData;
  }

  addMutationObserver(target: HTMLElement) {
    const observer = new MutationObserver((records) => {
      const removedViewsMap = new Map<string, { element: HTMLElement; view: View }>();
      const addedViewsMap = new Map<string, { element: HTMLElement; view: View | null }>();

      for (const record of records) {
        for (const removedNode of record.removedNodes) {
          if (removedNode.nodeType !== Node.ELEMENT_NODE) continue;
          this.findRuneDescendants(removedNode).forEach((element) => {
            const view = rune.getUnknownView(element as HTMLElement);
            if (view) {
              removedViewsMap.set(view.viewId, { element: element as HTMLElement, view });
            }
          });
        }
        for (const addedNode of record.addedNodes) {
          if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
          const subViewElement = addedNode as HTMLElement;
          [subViewElement, ...subViewElement.querySelectorAll('[data-rune]')].forEach((element) => {
            if (element.matches('[data-rune]')) {
              const view = rune.getUnknownView(element as HTMLElement);
              // console.log(view);
              if (view) {
                addedViewsMap.set(view.viewId, { element: element as HTMLElement, view });
              }
            }
          });
        }
      }

      const removedViewIds = new Set(removedViewsMap.keys());
      const addedViewIds = new Set(addedViewsMap.keys());

      const permanentlyRemovedIds = [...removedViewIds].filter((id) => !addedViewIds.has(id));
      const temporarilyRemovedIds = [...removedViewIds].filter((id) => addedViewIds.has(id));

      for (const viewId of temporarilyRemovedIds) {
        const { element: oldElement } = removedViewsMap.get(viewId)!;
        const { element: newElement } = addedViewsMap.get(viewId)!;

        dispatchEvents(ViewUnmounted, oldElement, false);
        dispatchEvents(ViewMounted, newElement);
      }

      for (const viewId of permanentlyRemovedIds) {
        const { element, view } = removedViewsMap.get(viewId)!;
        view.parentView = null;
        view.element().dataset.runeParent = '';

        dispatchEvents(ViewUnmounted, element, true);

        // rune.delete(element);
      }

      for (const [viewId, { element }] of addedViewsMap) {
        if (!temporarilyRemovedIds.includes(viewId)) {
          $(element)
            .parentNode()
            ?.closest('[data-rune]')
            ?.chain((parentViewElement) => {
              const subView = rune.getUnknownView(element);
              if (subView) {
                subView.parentView = rune.getUnknownView(parentViewElement)!;
                subView.element().dataset.runeParent = subView.parentView.toString();
              }
            });
          dispatchEvents(ViewMounted, element);
        }
      }
    });
    observer.observe(target, { childList: true, subtree: true });
  }

  private findRuneDescendants(node: Node): Element[] {
    let views: Element[] = [];
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.matches('[data-rune]')) {
        views.push(element);
      }
      for (const child of element.childNodes) {
        views = [this.findRuneDescendants(child), ...views].flat();
      }
    }
    return views;
  }
}

export const rune = new Rune();

function dispatchEvents(Event: any, subViewElement: HTMLElement, isPermanent?: boolean) {
  rune.getUnknownView(subViewElement)?.dispatchEvent(Event, {
    detail: { element: subViewElement, isPermanent },
  });
}

if (typeof window !== 'undefined') {
  window.__rune__ = rune;
  rune.addMutationObserver(document.body);
}
