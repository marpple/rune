/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { $ } from './$Element';
import { rune } from './rune';
import { _camelToColonSeparated } from './lib/_camelToColonSeparated';

export class EventHelper {
  private _listenerMap = new WeakMap();

  _getMap(constructor: any) {
    return (
      this._listenerMap.get(constructor) ||
      this._listenerMap.set(constructor, new Map()).get(constructor)
    );
  }

  getListener({ constructor }: any, fn: any) {
    return this._getMap(constructor).get(fn);
  }

  setListener({ constructor }: any, fn: any, boundListener: any) {
    return this._getMap(constructor).set(fn, boundListener);
  }

  private _makeListener(
    instance: { constructor: any },
    listener: string | ((arg0: any, arg1: any) => void),
    View?: (new (...args: any[]) => any) | string,
  ) {
    const fn = typeof listener === 'string' ? instance[listener] : listener;
    const boundListener = this.getListener(instance, fn);
    if (boundListener) {
      return boundListener;
    } else {
      const boundListener = function (this: any, e: any) {
        const _instance = rune.get(this, instance.constructor)!;
        fn.call(
          _instance,
          e,
          typeof View === 'string' || View === undefined
            ? _instance
            : rune.getUnknownView(e.currentTarget)!,
        );
      };
      this.setListener(instance, fn, boundListener);
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

  addEventListener(instance: any, element: any, eventType: any, listener: any, options?: any) {
    if (element) {
      element.addEventListener(
        this._eventType(eventType),
        this._makeListener(instance, listener),
        options,
      );
    } else {
      this._getReservedListener(instance).push((instance: any, element: any) => {
        this.addEventListener(instance, element, eventType, listener, options);
      });
    }
    return this;
  }

  removeEventListener(instance: any, element: any, eventType: any, listener: any, options?: any) {
    element.removeEventListener(
      this._eventType(eventType),
      this._makeListener(instance, listener),
      options,
    );
    return this;
  }

  delegate(instance: any, element: any, eventType: any, selector: any, listener: any) {
    if (element) {
      $(element).delegate(
        this._eventType(eventType),
        typeof selector === 'string' ? selector : `.${selector}[data-rune]`,
        this._makeListener(instance, listener, selector),
      );
    } else {
      this._getReservedListener(instance).push((instance: any, element: any) =>
        this.delegate(instance, element, eventType, selector, listener),
      );
    }
    return this;
  }

  private _eventType(eventType: any): string {
    return typeof eventType === 'string' ? eventType : _camelToColonSeparated(eventType.name);
  }

  addDecoratedListeners(instance: any, element: any): this {
    instance._decoratedListeners?.forEach((f) => f(instance, element));
    return this;
  }

  on(
    instancePrototype: any,
    eventType: string | (new (...args: any[]) => Event),
    listener: any,
    selector?: any,
  ) {
    instancePrototype._decoratedListeners = [
      ...(instancePrototype._decoratedListeners ?? []),
      selector === undefined
        ? (instance: any, element: any) =>
            eventHelper.addEventListener(instance, element, eventType, listener)
        : (instance: any, element: any) =>
            eventHelper.delegate(instance, element, eventType, selector, listener),
    ];
  }
}

export const eventHelper = new EventHelper();
