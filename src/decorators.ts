/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventHelper } from './EventHelper';

function on(
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

export { on };
