<p><img src="https://raw.githubusercontent.com/marpple/rune/main/docs/img/logo.png" width="50%" alt="rune"></p>

# Rune - Web API based Front-end SDK

Rune is a fast and robust library for building high-quality frontend applications, serving as a modern web technology-based SDK.

- Type-safe Generic Views & Enable
- Single-component Server-Side Rendering
- Sleek UI component development kit
- High portability and performance
- Object-oriented programming-based architecture

# Getting Started

```shell
pnpm add rune-ts
npm install rune-ts
```

# Documentation

- [Website](https://marpple.github.io/rune/)
- [What is Rune?](https://marpple.github.io/rune/guide/what-is-rune.html)
- [Tutorial](https://marpple.github.io/rune/tutorial/view.html)

# Example

```typescript
interface Setting {
  title: string;
  on: boolean;
}

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

class SettingListView extends ListView<Setting, SettingItemView> {
  ItemView = SettingItemView;
}

class SettingPage extends View<Setting[]> {
  private _listView = new SettingListView(this.data);
  private _checkAllView = new SwitchView({ on: this._isCheckAll() });

  override template() {
    return html`
      <div>
        <div class="header">
          <h2>Setting</h2>
          ${this._checkAllView}
        </div>
        <div class="body">${this._listView}</div>
      </div>
    `;
  }

  protected override onRender() {
    this._checkAllView.addEventListener(Toggled, (e) => this._checkAll(e.detail.on));
    this._listView.addEventListener(Toggled, () => this._syncCheckAll());
  }

  private _checkAll(on: boolean) {
    this._listView.itemViews
      .filter((itemView) => itemView.data.on !== on)
      .forEach((itemView) => itemView.switchView.setOn(on));
  }

  private _syncCheckAll() {
    this._checkAllView.setOn(this._isCheckAll());
  }

  private _isCheckAll() {
    return this.data.every(({ on }) => on);
  }
}
```

<img src="https://raw.githubusercontent.com/marpple/rune/main/docs/img/setting_controller.gif" alt="setting_controller">
