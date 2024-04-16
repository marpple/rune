# Type-safe Custom Event Handling Pattern

Rune provides a pattern for handling type-safe custom events.


## Custom Events without a detail value

You can prepare events for export so that they can be used where events are registered by creating and exporting them as shown below:

```typescript
export class DialogOpened extends CustomEventWithoutDetail {}
```

When propagating events, `this.dispatchEvent` must be executed with two arguments extending `CustomEvent` and `CustomEventInit`.

```typescript
export class DialogView extends View {
  open() {
    // ...
    this.dispatchEvent(DialogOpened, { bubbles: true });
    // ok
    this.dispatchEvent(DialogOpened, { bubbles: true, detail: 'my-data' });
    // TS2322: Type string is not assignable to type undefined
  }
}
```

## Custom Events with an optional detail value

The pattern for custom events with an optional detail value is not commonly used and should be used with caution. It can be used as shown below:

```typescript
export class DataLoaded extends CustomEventOptionalDetail<{ body: string; loadedAt: Date }> {}

export class DataLoaderView extends View {
  download() {
    // ...
    if (isFail) {
      this.dispatchEvent(DataLoaded, { bubbles: true });
      // ok  
    } else {
      this.dispatchEvent(DataLoaded, { 
        detail: { 
          body: '...', 
          loadedAt: new Date() 
        } 
      });
      // ok
      this.dispatchEvent(DataLoaded, { 
        detail: { body: '...' } 
      });
      // TS2741: Property loadedAt is missing in type { body: string; } but required in type { body: string; loadedAt: Date; }  
    }
  }
}
```

## Custom Events with a required detail value

When you want to create a custom event with a required detail value, you can import the `CustomEventWithDetail` class and extend it as shown below:

```typescript
import { CustomEventWithDetail } from 'rune-ts';

export class SegmentSelected extends CustomEventWithDetail<Segment> {}
```

By making the detail property mandatory, you enforce passing it when dispatching events as shown below:

```typescript
export class SegmentControlView extends View<Segment[]> {
  // ...
  
  @on('click', 'button:not(.selected)')
  private _select(e: MouseEvent) {
    //...
    this.dispatchEvent(SegmentSelected, { 
      detail: this.selectedSegment(), 
      bubbles: true
    });
    // ok
    this.dispatchEvent(SegmentSelected, { bubbles: true });
    // TS2345: Property detail is missing in type { bubbles: true; } but required in type CustomEventWithDetailInit<Segment>
  }

  selectedSegment() {
    return this.data[this.selectedIndex];
  }
}
```

## Custom Event Listening

You can register events by passing the event class instead of a string in the event type argument position. Doing so allows for inference of `(e: SegmentSelected) => void`, and `e.detail` is also inferred based on the type passed when dispatched.

```typescript
this.addEventListener(SegmentSelected, (e: SegmentSelected) => {
  const segment: Segment = e.detail;
});
```

Using `delegate` is also powerful. By providing the event class in the first argument and the SubView class to which the event will be sent in the second argument, you can filter events occurring within subviews and provide inference such as `(e: RemoveRequested, todoItemView: TodoItemView)`, which also passes the `TodoItemView` object that triggered the event.

```typescript
this.delegate(
  RemoveRequested, 
  TodoItemView, 
  (e: RemoveRequested, todoItemView: TodoItemView) => {
    this.remove(todoItemView.data);
  },
);
```