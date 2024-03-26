# Enable 패턴

Rune은 하나의 `View`에 여러개의 기능을 부여하는 Enable 패턴을 제공합니다. `Enable`을 이용하면 동작이나 기능을 모듈화하고 `View`를 확장하기 용이한 개념이자 클래스입니다. `Enable`은 템플릿이 없는 `View`와 같다고 생각하면 쉬우며 `View`를 받아 기능을 확장하는 패턴을 보여줍니다.

## View와 데이터를 공유하는 Enable

`Enable`은 `View`와 데이터를 공유할 수 있도록 설계되었습니다. 타입스크립트에서는 `Enable<T>`의 type argument로 `View<T>`의 type argument인 `view.data`와 동일한 타입을 전달하면 됩니다. 이전에 만들었던 `CheckboxView`를 `Enable`을 활용할 경우 아래와 같은 패턴으로 구현할 수 있습니다. `Checkable<T extends CheckableData>`는 `Checkable`를 생성할 때 전달할 `View`의 `data`의 타입을 제약합니다.

```typescript
import { View, html, Enable } from 'rune-ts';

type CheckableData = {
  checked?: boolean;
};

class Checkable<T extends CheckableData> extends Enable<T> {
  @on('click')
  private _toggle() {
    this.view.data.checked = !this.view.data.checked;
    this.view.element().classList.toggle('checked');
    this.view.element().dispatchEvent(new CustomEvent('checkable:change', { bubbles: true }));
  }
}

type Color = {
  code: string;
  checked?: boolean;
};

class CheckableColorView extends View<Color> {
  checkable = new Checkable(this).init();

  override template(color: Color) {
    return html`
      <div class="${color.checked ? 'checked' : ''}" style="background-color: ${color.code}"></div>
    `;
  }
}

const checkableColorView = new CheckableColorView({ code: 'red' });
checkableColorView.render().dispatchEvent(new MouseEvent('click'));
console.log(checkableColorView.data.checked);
// true
```

`Enable.prototype.onMount`는 인자로 받은 `View`의 `element`가 브라우저에 추가(append) 되었을 때 실행됩니다. 또한 `Enable`도 `View`처럼 `addEventListener`를 가지고 있습니다.

```typescript
_toggle() {
  this.data.checked = !this.data.checked;
  this.element().classList.toggle('checked');
  this.element().dispatchEvent(
    new CustomEvent('checkable:change', { bubbles: true })
  );
}
```

`Enable`에서 `this.view.data === this.data` 이고 `this.view.element() === this.element()` 이기 때문에 toggle 영역을 위 코드처럼 변경할 수 있습니다. 이는 `View`를 작성할 때 만들었던 코드를 `Enable`로 옮겨 재사용가능한 코드로 만들고자 할 때 용이하게 합니다.

## 데이터 공유가 없는 View 확장

`Deletable`을 사용하여 클릭했을 때 삭제되는 `BallView`를 쉽게 만들 수 있습니다. `class Deletable extends Enable` 는 `class Deletable extends Enable<object>`와 같습니다.

```typescript
class Deletable extends Enable {
  override onMount() {
    this.delegate('mousedown', '.remove-target', 'remove');
  }

  remove() {
    this.element().remove();
  }
}

type Ball = {
  color: string;
};

class BallView extends View<Ball> {
  deletable = new Deletable(this).init();

  override template() {
    return html`
      <div
        style="
         border: 1px solid black; 
         padding: 10px;
         width: 20px; 
         height: 20px;
         border-radius: 20px;"
      >
        <div
          class="remove-target"
          style="
           background-color: ${this.data.color}; 
           width: 100%; 
           height: 100%; 
           border-radius: 10px;"
        ></div>
      </div>
    `;
  }
}

[{ color: 'red' }, { color: 'green' }, { color: 'blue' }]
  .map((ball) => new BallView(ball))
  .forEach((ballView) => {
    document.body.appendChild(ballView.render());
  });
```

## ViewExtraInterface

위 코드에서는 `Deletable`의 삭제를 트리거하는 엘리먼트의 클래스명을 `remove-target`라는 문자열로 약속을 했습니다. `interface`를 활용하면 객체간 통신의 규약을 더 확장성이 있으면서도 안전하게 추상화할 수 있습니다.

```typescript
interface DeletableViewExtraInterface {
  readonly targetClassName: string;
}

export class Deletable extends Enable<object, DeletableViewExtraInterface> {
  override onMount() {
    this.delegate('mousedown', `.${this.view.targetClassName}`, 'remove');
  }

  remove() {
    this.element().remove();
  }
}

export class BallView extends View<Ball> {
  deletable = new Deletable(this).init();

  readonly targetClassName = 'target';

  override template() {
    return html`
      <div
        style="
         border: 1px solid black; 
         padding: 10px; 
         width: 20px; 
         height: 20px; 
         border-radius: 20px;"
      >
        <div
          class="${this.targetClassName}"
          style="
           background-color: ${this.data.color}; 
           width: 100%; 
           height: 100%; 
           border-radius: 10px;"
        ></div>
      </div>
    `;
  }
}
```

이제 `BallView`에서 `targetClassName`를 구현하지 않는다면 `Argument of type this is not assignable to parameter of type View<unknown> & DeletableViewExtraInterface`와 같은 에러메시지가 출력되어 개발자가 반드시 구현하도록 가이드를 줄 수 있습니다.

다음은 객체간 통신의 예시로 `Deletable`이 `View`에게 `canRemove()`를 물어보고 삭제하도록 인터페이스와 구현을 추가했습니다.

```typescript
interface DeletableViewExtraInterface {
  readonly targetClassName: string;
  canRemove(): boolean;
}

export class Deletable extends Enable<object, DeletableViewExtraInterface> {
  override onMount() {
    this.delegate('mousedown', `.${this.view.targetClassName}`, 'remove');
  }

  remove() {
    if (this.view.canRemove()) {
      this.element().remove();
    }
  }
}

export type Ball = {
  color: string;
  count: number;
};

export class BallView extends View<Ball> {
  deletable = new Deletable(this).init();

  readonly targetClassName = 'target';

  canRemove() {
    return confirm('삭제하시겠습니까?');
  }

  override template() {
    return html` ... `;
  }
}
```

## 두 개 이상의 Enable

`Enable`을 이용하면 하나의 `View`에 두 개 이상의 기능을 부여할 수 있습니다.

```typescript
class Movable extends Enable {
  override onMount() {
    this.element().animate(
      [
        { transform: 'translateX(0px)' },
        { transform: 'translateX(300px)' },
        { transform: 'translateX(0px)' },
      ],
      {
        duration: 5000,
        iterations: Infinity,
      },
    );
  }
}

type Ball = {
  color: string;
};

export class BallView extends View<Ball> {
  movable = new Movable(this).init();
  deletable = new Deletable(this).init();

  readonly targetClassName = 'target';

  canRemove() {
    return confirm('삭제하시겠습니까?');
  }

  override template() {
    return html` ... `;
  }
}
```

이제 `BallView`는 화면에 그려진 후 횡으로 반복 이동하며 클릭하면 삭제됩니다. `Ball`에 `count`를 추가하고 `canRemove` 구현을 살짝 고쳐보겠습니다.

```typescript
export type Ball = {
  color: string;
  count: number;
};

export class BallView extends View<Ball> {
  movable = new Movable(this).init();
  deletable = new Deletable(this).init();

  readonly targetClassName = 'target';

  canRemove() {
    return --this.data.count === 0;
  }

  override template() {
    return html` ... `;
  }
}

const balls = [
  { color: 'red', count: 3 },
  { color: 'green', count: 2 },
  { color: 'blue', count: 1 },
];
balls
  .map((ball) => new BallView(ball))
  .forEach((ballView) => {
    document.body.appendChild(ballView.render());
  });
```

이제 횡으로 반복하는 공을 여러번 클릭해야 터지는 간단한 게임이 완성되었습니다.

위 코드들은 간결하며 재사용성이 높습니다. 다만 너무 많은 객체간의 통신은 부작용을 조심해야하며 개발자는 객체들이 서로 간섭하지 않도록 유의해야합니다. 본 문서에서는 Rune의 기능과 코딩 패턴을 소개하기 위해 의도적으로 작은 컴포넌트를 만들었습니다. 문제를 작게 만들어 해결하는 것은 좋지만 하나의 컴포넌트가 충분한 역할을 가지도록 설계할 필요가 있습니다.
