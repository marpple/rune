import { _camelToColonSeparated } from './lib/_camelToColonSeparated';

if (typeof global !== 'undefined') {
  global.CustomEvent =
    global.CustomEvent ||
    class CustomEvent {
      constructor() {
        throw Error(
          'In Node.js, only class declarations are supported, and instance creation is not supported.',
        );
      }
    };
}

export class CustomEventWithoutDetail extends CustomEvent<undefined> {
  static override toString() {
    return _camelToColonSeparated(this.name);
  }
}

export class CustomEventOptionalDetail<T> extends CustomEvent<T> {}

export interface CustomEventWithDetailInit<T> extends EventInit {
  detail: T;
}

export type CustomEventDetailType<T> = T extends CustomEvent<infer U> ? U : unknown;

export type CustomEventInitFromClass<T extends new (...args: any[]) => Event> =
  InstanceType<T> extends CustomEventWithDetail<unknown>
    ? CustomEventWithDetailInit<CustomEventDetailType<InstanceType<T>>>
    : CustomEventInit<CustomEventDetailType<InstanceType<T>>>;

export class CustomEventWithDetail<T> extends CustomEvent<T> {
  constructor(eventType: string, eventInitDict: CustomEventWithDetailInit<T>) {
    super(eventType, eventInitDict as CustomEventInit<T>);
  }

  private readonly isCustomEventWithDetail = true;

  static override toString() {
    return _camelToColonSeparated(this.name);
  }
}
