# Type-Safe Custom Event Handling Pattern

Rune provides a type-safe custom event handling pattern.

## Custom events with no `detail` value

You can set up an event for use as follows by creating and exporting it:

```typescript
export class DialogOpened extends CustomEventWithoutDetail {}
```

When propagating the event, you must call `this.dispatchEvent` and pass two arguments: the class that extends `CustomEvent` and `CustomEventInit`.

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

## Custom events with an optional `detail` value

There aren’t many typical use cases where a custom event with an optional `detail` is perfectly suitable, so use this pattern carefully. Here is an example:

```typescript
export class DataLoaded extends CustomEventOptionalDetail<{ body: string; loadedAt: Date }> {}

export class DataLoaderView extends View {
  download() {
    // ...
    if (isFail) {
      this.dispatchEvent(DataLoaded, { bubbles: true });
      // ok  
    } else {
      this.dispatchEvent(DataLoaded, { detail: { body: '...', loadedAt: new Date() } });
      // ok
      this.dispatchEvent(DataLoaded, { detail: { body: '...' } });
      // TS2741: Property loadedAt is missing in type { body: string; } but required in type { body: string; loadedAt: Date; }  
    }
  }
}
```

## Custom events with a required `detail` value

To create custom events that require a `detail` value, import and extend `CustomEventWithDetail`.

```typescript
import { CustomEventWithDetail } from 'rune-ts';

export class SegmentSelected extends CustomEventWithDetail<Segment> {}
```

By making the `detail` property mandatory, the dispatch call is also constrained to include it:

```typescript
export class SegmentControlView extends View<Segment[]> {
  // ...

  @on('click', 'button:not(.selected)')
  private select(e: MouseEvent) {
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

## Listening to custom events

You can register the event by passing the event class instead of a string as shown below. In doing so, `(e: SegmentSelected) => void` is inferred, and `e.detail` is inferred as the type passed when dispatching the event.

```typescript
this.addEventListener(SegmentSelected, (e: SegmentSelected) => {
  const segment: Segment = e.detail;
});
```

This approach is also powerful when used with `delegate`. In the first argument (the event type position), pass the event class; in the second argument (the CSS selector position), specify the SubView class from which the event will be dispatched. This filters events that occur in the child view and provides inference such as `(e: RemoveRequested, todoItemView: TodoItemView)`, while also passing the `TodoItemView` object that triggered the event:

```typescript
this.delegate(
  RemoveRequested,
  TodoItemView,
  (e: RemoveRequested, todoItemView: TodoItemView) => {
    this.remove(todoItemView.data);
  },
);
```