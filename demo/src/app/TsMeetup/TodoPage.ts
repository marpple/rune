import { html, on, View, ListView } from 'rune-ts';
import { CheckView } from './ui/CheckView';
import { CheckListManager } from './ui/CheckListManager';

interface Todo {
  title: string;
  completed: boolean;
}

class TodoItemView extends View<Todo> {
  private checkView = new CheckView({ on: this.data.completed });

  override template() {
    return html`
      <div>
        ${this.checkView}
        <span class="title">${this.data.title}</span>
      </div>
    `;
  }

  @on('change')
  private _sync() {
    this.data.completed = this.checkView.data.on;
  }

  setCompleted(bool: boolean) {
    this.data.completed = bool;
    this.checkView.setOn(bool);
  }
}

class TodoListView extends ListView<Todo, TodoItemView> {
  ItemView = TodoItemView;
}

class TodoPage extends View<Todo[]> {
  checkListManager = new CheckListManager(
    new CheckView({ on: false }),
    new TodoListView(this.data),
    (itemView: TodoItemView) => itemView.data.completed,
    (itemView: TodoItemView, bool: boolean) => itemView.setCompleted(bool),
  );

  override template() {
    return html`
      <div>
        <div class="header">
          ${this.checkListManager.checkAllView}
          <input type="text" />
        </div>
        ${this.checkListManager.listView}
      </div>
    `;
  }

  @on('keypress')
  private _keypress(e: KeyboardEvent) {
    if (e.code === 'Enter') {
      const input = e.target as HTMLInputElement;
      this.checkListManager.listView.append({
        title: input.value,
        completed: false,
      });
      input.value = '';
    }
  }
}

export function main() {
  const todos = [
    { title: '코딩', completed: false },
    { title: '식사', completed: true },
    { title: '회의', completed: false },
  ];

  document.querySelector('#tutorial')!.prepend(new TodoPage(todos).render());
}
