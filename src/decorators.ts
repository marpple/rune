/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventHelper } from './EventHelper';
import { type Enable } from './Enable';
import { type HasReservedEnables } from './View';

export function on(
  eventType: string,
  selector?: string | ((self: any) => string),
): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    eventHelper.on(target, eventType, descriptor.value, selector);
  };
}

export function enable(
  ...Enables: (new (...args: any[]) => Enable<unknown>)[]
) {
  return function (Constructor: any) {
    (Constructor as HasReservedEnables)._ReservedEnables = Enables;
  };
}
