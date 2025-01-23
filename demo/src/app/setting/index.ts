import { html, Page, View, ListView } from 'rune-ts';
import { ToggleListController } from '../lib/ToggleListController';
import { SwitchView } from '../lib/SwitchView';

export type Setting = {
  title: string;
  on: boolean;
};

class SettingItemView extends View<Setting> {
  switchView = new SwitchView(this.data);

  override template() {
    return html`
      <div>
        <span class="title">${this.data.title}</span>
        ${this.switchView}
      </div>
    `;
  }
}

class SettingListView extends ListView<SettingItemView> {
  ItemView = SettingItemView;
}

export class SettingPage extends Page<Setting[]> {
  private toggleAllView = new SwitchView();
  private listView = new SettingListView(this.data);

  private toggleListController = new ToggleListController(
    this.toggleAllView,
    this.listView,
    (itemView) => itemView.data.on, // getItemViewOn
    (itemView, bool) => itemView.switchView.setOn(bool), // setItemViewOn
  );

  override template() {
    return html`
      <div>
        <div class="header">
          <h2>Setting</h2>
          ${this.toggleListController.toggleAllView}
        </div>
        <div class="body">${this.toggleListController.listView}</div>
      </div>
    `;
  }
}
