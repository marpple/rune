import { html, on, View, ListView } from 'rune-ts';
import { CheckView } from './ui/CheckView';
import { CheckListManager } from './ui/CheckListManager';
import { InputTextReturned, InputTextReturnEnterView } from './ui/InputTextReturnEnterView';
import { SegmentControlView, SegmentSelected } from './ui/SegmentControlView';
import { Toggled } from './ui/ToggleView';

interface Todo {
  title: string;
  completed: boolean;
}

class RemoveRequested extends CustomEvent<undefined> {}

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

  @on(Toggled)
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
    this.dispatchEvent(RemoveRequested, { bubbles: true });
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

  filterView = new SegmentControlView([
    { title: 'All', value: 'all', selected: true },
    { title: 'Active', value: 'active' },
    { title: 'Completed', value: 'completed' },
  ]);

  override template() {
    return html`
      <div>
        <div class="header">
          ${this.checkListManager.checkAllView} ${new InputTextReturnEnterView({})}
        </div>
        ${this.checkListManager.listView}
        <div class="filter">${this.filterView}</div>
      </div>
    `;
  }

  override onRender() {
    this.addEventListener(InputTextReturned, (e: InputTextReturned) => this._append(e.detail));
    this.addEventListener(Toggled, () => this.redraw());
    this.addEventListener(SegmentSelected, () => this.redraw());
    this.delegate(
      RemoveRequested,
      TodoItemView,
      (e: RemoveRequested, todoItemView: TodoItemView) => {
        this._remove(todoItemView.data);
        this.checkListManager.syncCheckAll();
      },
    );
  }

  private _append(title: string) {
    const todo = {
      title,
      completed: this.currentFilter === 'completed',
    };
    this.data.push(todo);
    this.checkListManager.listView.append(todo);
    this.checkListManager.syncCheckAll();
  }

  private _remove(todo: Todo) {
    this.data.splice(this.data.indexOf(todo), 1);
    this.checkListManager.listView.remove(todo);
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
