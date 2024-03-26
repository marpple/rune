/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { $ } from './$Element';
import { rune } from './rune';

export class EventHelper {
  private _listenerMap = new WeakMap();

  private _makeListener(
    instance: { constructor: any },
    listener: string | ((arg0: any, arg1: any) => void),
  ) {
    const fn = typeof listener === 'string' ? instance[listener] : listener;
    const boundListener = this._listenerMap.get(fn);
    if (boundListener) {
      return boundListener;
    } else {
      const boundListener = function (this: any, e: any) {
        const _instance = rune.get(this, instance.constructor);
        fn.call(_instance, e, _instance);
      };
      this._listenerMap.set(fn, boundListener);
      return boundListener;
    }
  }

  private _reservedListenerMap = new WeakMap<any, ((instance: any, element: any) => void)[]>();

  private _getReservedListener(instance: any) {
    return (
      this._reservedListenerMap.get(instance) ??
      this._reservedListenerMap.set(instance, []).get(instance)!
    );
  }

  addReservedListener(instance: any, element: any): this {
    this._getReservedListener(instance).forEach((f) => f(instance, element));
    return this;
  }

  addEventListener(instance: any, element: any, eventType: string, listener: any, options?: any) {
    if (element) {
      element.addEventListener(eventType, this._makeListener(instance, listener), options);
    } else {
      this._getReservedListener(instance).push((instance: any, element: any) =>
        this.addEventListener(instance, element, eventType, listener, options),
      );
    }
    return this;
  }

  removeEventListener(
    instance: any,
    element: any,
    eventType: string,
    listener: any,
    options?: any,
  ) {
    element.removeEventListener(eventType, this._makeListener(instance, listener), options);
    return this;
  }

  delegate(instance: any, element: any, eventType: string, selector: string, listener: any) {
    if (element) {
      $(element).delegate(eventType, selector, this._makeListener(instance, listener));
    } else {
      this._getReservedListener(instance).push((instance: any, element: any) =>
        this.delegate(instance, element, eventType, selector, listener),
      );
    }
    return this;
  }

  addDecoratedListeners(instance: any, element: any): this {
    instance._decoratedListeners?.forEach((f) => f(instance, element));
    return this;
  }

  on(
    instancePrototype: any,
    eventType: string,
    listener: any,
    selector?: string | ((runeInstance: any) => string),
  ) {
    instancePrototype._decoratedListeners = [
      ...(instancePrototype._decoratedListeners ?? []),
      selector === undefined
        ? (instance: any, element: any) =>
            eventHelper.addEventListener(instance, element, eventType, listener)
        : (instance: any, element: any) =>
            eventHelper.delegate(
              instance,
              element,
              eventType,
              typeof selector === 'string' ? selector : instance,
              listener,
            ),
    ];
  }
}

export const eventHelper = new EventHelper();
