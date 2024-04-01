# 타입 안전한 커스텀 이벤트 핸들링 패턴

Rune은 타입 안전한 커스텀 이벤트 핸들링 패턴을 제공합니다.


## detail 값이 없는 커스텀 이벤트

아래처럼 이벤트를 생성하고 export 하여 이벤트를 등록하는 곳에서 사용할 수 있도록 준비할 수 있습니다.

```typescript
export class DialogOpened extends CustomEvent<undefined> {}
```

이벤트를 전파할 때는 `this.dispatchEvent`를 실행하면서 `CustomEvent`를 확장한 class와 `CustomEventInit`로 두개의 인자로 전달해야합니다.  

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

## detail 값이 옵셔널한 커스텀 이벤트

detail 값이 옵셔널한 커스텀 이벤트 패턴은 사용하기 적합한 케이스가 흔하지는 않으며 유의하여 사용해야합니다. 아래와 같이 사용할 수 있습니다.

```typescript
export class DataLoaded extends CustomEvent<{ body: string; loadedAt: Date }> {}

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

## detail 값이 필수인 커스텀 이벤트

`CustomEventWithDetail` 

detail 값이 필수인 커스텀 이벤트를 만들고자 할 때는 `CustomEventWithDetail` 클래스를 import 하여 확장합니다.

```typescript
import { CustomEventWithDetail } from 'rune-ts';

export class SegmentSelected extends CustomEventWithDetail<Segment> {}
```

detail 프로퍼티를 필수로 설정하면 아래와 같이 이벤트를 전파할 때 필수로 전달하도록 제약합니다.

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

## 커스텀 이벤트 리스닝

아래처럼 이벤트 타입 인자자리에 문자열 대신 이벤트 클래스를 전달하여 이벤트를 등록합니다. 그렇게 하면 `(e: SegmentSelected) => void` 로 추론되어 `e.detail`도 디스패치할 때 전달한 타입으로 추론됩니다.

```typescript
this.addEventListener(SegmentSelected, (e: SegmentSelected) => {
  const segment: Segment = e.detail;
});
```

아래처럼 `delegate`와 사용할 때에도 강력합니다. 첫 번째 인자인 이벤트 타입 자리에는 이벤트 클래스를, 두 번째 인자인 CSS 선택자 자리에는 이벤트를 보내줄 SubView 클래스를 넣어줍니다. 그렇게하면 하위 뷰 안에서 일어난 이벤트로 필터링도 하고 `(e: RemoveRequested, todoItemView: TodoItemView)`와 같이 추론을 제공하고, 이벤트를 발생시킨 `TodoItemView` 객체도 전달해줍니다. 

```typescript
this.delegate(RemoveRequested, TodoItemView, (
  e: RemoveRequested, 
  todoItemView: TodoItemView
) => {
  this.remove(todoItemView.data);
});
```



