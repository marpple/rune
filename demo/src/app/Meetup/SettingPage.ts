import { html, on, View } from 'rune-ts';
import { each, pipe, zip } from '@fxts/core';
import { SwitchView } from './ui/SwitchView';
import { ListView } from './ui/ListView';
import { CheckableViewController } from './ui/CheckableViewController';

interface Setting {
  title: string;
  on: boolean;
}

class SettingItemView extends View<Setting> {
  switchView = new SwitchView(this.data);

  override template(setting: Setting) {
    return html`
      <div>
        <span class="title">${setting.title}</span>
        ${this.switchView}
      </div>
    `;
  }
}

class SettingListView extends ListView<Setting, SettingItemView> {
  override createItemView(item: Setting) {
    return new SettingItemView(item);
  }
}

class SettingPage extends View<Setting[]> {
  listView = new SettingListView(this.data.map((setting) => ({ ...setting })));
  checkAllView = new SwitchView({ on: false });
  checkableViewController = new CheckableViewController(this);

  getItemViewChecked(itemView: SettingItemView) {
    return itemView.data.on;
  }

  setItemViewChecked(itemView: SettingItemView, bool: boolean) {
    itemView.switchView.setOn(bool);
  }

  override template() {
    return html`
      <div>
        <div class="header">
          <h2>Setting</h2>
          ${this.checkAllView}
        </div>
        ${this.listView}
        <div class="footer">
          <button class="reset">Reset</button>
        </div>
      </div>
    `;
  }

  @on('click', '.reset')
  reset() {
    pipe(
      zip(this.data, this.listView.itemViews),
      each(([{ on }, itemView]) => itemView.switchView.setOn(on)),
    );
    this.checkableViewController.syncCheckAll();
  }
}

export function main() {
  const settings = [
    { title: 'Wi-fi', on: false },
    { title: 'Bluetooth', on: true },
    { title: 'Airdrop', on: true },
  ];

  document.querySelector('#tutorial')!.append(new SettingPage(settings).render());
}
