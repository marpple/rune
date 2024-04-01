if (typeof window === 'undefined') {
  class Event {
    constructor() {
      throw Error(
        'In Node.js, only class declarations are supported, and instance creation is not supported.',
      );
    }
  }

  class CustomEvent extends Event {}
}

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
}
