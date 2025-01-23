/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventHelper } from './EventHelper';
import type { View } from './View';
import type { Base } from './Base';

function on<K extends keyof HTMLElementEventMap>(
  eventType: K,
): <T extends (event: HTMLElementEventMap[K]) => void>(
  target: View,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>,
) => void;

function on<E extends new (...args: any[]) => Event>(
  EventClass: E,
): <T extends (event: InstanceType<E>) => void>(
  view: View,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>,
) => void;

function on<K extends keyof HTMLElementEventMap>(
  eventType: K,
  selector: string,
): <T extends (event: HTMLElementEventMap[K]) => void>(
  target: View,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>,
) => void;

function on<E extends new (...args: any[]) => Event>(
  EventClass: E,
  selector: string,
): <T extends (event: InstanceType<E>) => void>(
  view: View,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>,
) => void;

function on<E extends new (...args: any[]) => Event, V extends new (...args: any[]) => Base>(
  EventClass: E,
  ViewClass: V,
): <T extends (event: InstanceType<E>, targetView: InstanceType<V>) => void>(
  view: View,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>,
) => void;

function on(
  eventType: any,
  selector?: any,
): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    eventHelper.on(target, eventType, descriptor.value, selector);
  };
}

export { on };
