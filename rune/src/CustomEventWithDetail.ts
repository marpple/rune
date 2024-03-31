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
    super(eventType, eventInitDict);
  }

  private readonly isCustomEventWithDetail = true;
}
