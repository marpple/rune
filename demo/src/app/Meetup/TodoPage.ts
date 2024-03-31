import { html, on, View, ListView, SafeCustomEvent } from 'rune-ts';
import { CheckView } from './ui/CheckView';
import { CheckListManager } from './ui/CheckListManager';
import { InputTextReturn, InputTextReturnEnterView } from './ui/InputTextReturnEnterView';
import { SegmentControlView, SegmentSelect } from './ui/SegmentControlView';
import { ToggleChange } from './ui/ToggleView';

interface Todo {
  title: string;
  completed: boolean;
}

class RequestRemove extends CustomEvent<undefined> {}
class RequestRemove2 extends SafeCustomEvent {}

class TodoItemView extends View<Todo> {
  private checkView = new CheckView({ on: this.data.completed });

  override template() {
    return html`
      <div class="${this.data.completed ? 'completed' : ''}">
        ${this.checkView}
        <span class="title">${this.data.title}</span>
        <button class="remove">x</button>
      </div>
    `;
  }

  @on(ToggleChange)
  private _syncData() {
    this.data.completed = this.checkView.data.on;
  }

  setCompleted(bool: boolean) {
    this.data.completed = bool;
    this.element().classList.toggle('completed', bool);
    this.checkView.setOn(bool);
  }

  @on('click', '.remove')
  private _remove() {
    this.dispatchEvent(RequestRemove, { bubbles: true });
  }
}

class TodoListView extends ListView<Todo, TodoItemView> {
  ItemView = TodoItemView;
}

class TodoPage extends View<Todo[]> {
  checkListManager = new CheckListManager(
    new CheckView({ on: false }),
    new TodoListView([...this.data]),
    (itemView) => itemView.data.completed,
    (itemView, bool) => itemView.setCompleted(bool),
  );

  inputTextView = new InputTextReturnEnterView({});

  filterView = new SegmentControlView([
    { title: 'All', value: 'all', selected: true },
    { title: 'Active', value: 'active' },
    { title: 'Completed', value: 'completed' },
  ]);

  override template() {
    return html`
      <div>
        <div class="header">${this.checkListManager.checkAllView} ${this.inputTextView}</div>
        ${this.checkListManager.listView}
        <div class="filter">${this.filterView}</div>
      </div>
    `;
  }

  override onMount() {
    this.inputTextView.addEventListener(InputTextReturn, () => this._append());
    this.addEventListener(ToggleChange, () => this.redraw());
    this.addEventListener(SegmentSelect, () => this.redraw());
    this.checkListManager.listView.delegate(
      RequestRemove,
      TodoItemView,
      (e, todoItemView: TodoItemView) => {
        this.data.splice(this.data.indexOf(todoItemView.data), 1);
        this.checkListManager.listView.removeByItemView(todoItemView);
      },
    );
  }

  private _append() {
    const todo = {
      title: this.inputTextView.returnValue,
      completed: false,
    };
    this.data.push(todo);
    this.checkListManager.listView.append(todo);
    this.checkListManager.syncCheckAll();
  }

  override redraw() {
    this.checkListManager.listView.set(
      this.data.filter((todo) =>
        this.currentFilter === 'all'
          ? true
          : this.currentFilter === 'completed'
            ? todo.completed
            : !todo.completed,
      ),
    );
    this.checkListManager.syncCheckAll();
    return this;
  }

  get currentFilter() {
    return this.filterView.selectedSegment().value;
  }
}

export function main() {
  const todos = [
    { title: '코딩', completed: true },
    { title: '식사', completed: true },
    { title: '회의', completed: true },
  ];

  document.querySelector('#tutorial')!.prepend(new TodoPage(todos).render());
}
