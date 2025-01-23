import { html, Page, View, ListView, on } from 'rune-ts';
import { CheckView } from '../lib/CheckView';
import { Toggled } from '../lib/ToggleView';
import { ToggleListController } from '../lib/ToggleListController';
import { SegmentControlView, SegmentSelected } from '../lib/SegmentControlView';
import { TextSubmitted, TextSubmitView } from '../lib/TextSubmitView';

export type Todo = {
  title: string;
  completed: boolean;
};

class RemoveRequested extends CustomEvent<undefined> {}

class TodoItemView extends View<Todo> {
  private checkView = new CheckView({ on: this.data.completed });

  override template() {
    return html`
      <div>
        ${this.checkView}
        <span class="title">${this.data.title}</span>
        <button class="remove">x</button>
      </div>
    `;
  }

  protected override onRender() {
    this.addEventListener(Toggled, (e) => this.syncCompleted());
  }

  private syncCompleted() {
    this.data.completed = this.checkView.data.on;
  }

  setCompleted(bool: boolean) {
    this.checkView.setOn(bool);
    this.syncCompleted();
  }

  @on('click', '.remove')
  private remove() {
    this.dispatchEvent(RemoveRequested, { bubbles: true });
  }
}

export class TodoListView extends ListView<TodoItemView> {
  ItemView = TodoItemView;
}

interface FilterState {
  title: string;
  predicate: (todo: Todo) => boolean;
}

export class TodoPage extends Page<Todo[]> {
  private listView = new TodoListView([...this.data]);

  private toggleListController = new ToggleListController(
    new CheckView(),
    this.listView,
    (itemView) => itemView.data.completed,
    (itemView, bool) => itemView.setCompleted(bool),
  );

  private filterView = new SegmentControlView([
    { title: 'All', predicate: () => true },
    { title: 'Active', predicate: (todo) => !todo.completed },
    { title: 'Completed', predicate: (todo) => todo.completed },
  ] as FilterState[]);

  addFilterState(filterState: FilterState) {
    this.filterView.append(filterState);
  }

  private get filterState() {
    return this.filterView.selectedSegment();
  }

  override template() {
    return html`
      <div>
        <div class="header">
          ${this.toggleListController.toggleAllView} ${new TextSubmitView({})}
        </div>
        <div class="body">
          ${this.listView}
          <div class="filter">${this.filterView}</div>
        </div>
      </div>
    `;
  }

  @on(TextSubmitted)
  private append({ detail: title }: TextSubmitted) {
    const todo: Todo = { title, completed: false };
    this.data.push(todo);
    if (this.filterState.predicate(todo)) {
      this.listView.append(todo);
      this.toggleListController.syncToggleAllView();
    }
  }

  @on(Toggled)
  @on(SegmentSelected)
  private refresh() {
    const todos = this.data.filter(this.filterState.predicate);
    this.listView.set(todos);
    this.toggleListController.syncToggleAllView();
  }

  protected override onRender() {
    this.delegate(RemoveRequested, TodoItemView, (e, todoItemView) =>
      this.remove(todoItemView.data),
    );
  }

  private remove(todo: Todo) {
    this.data.splice(this.data.indexOf(todo), 1);
    this.listView.remove(todo);
    this.toggleListController.syncToggleAllView();
  }
}
