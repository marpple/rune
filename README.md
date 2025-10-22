<p><img src="https://raw.githubusercontent.com/marpple/rune/main/packages/docs/img/logo.png" width="50%" alt="rune"></p>

# Rune - Web API based Front-end SDK

Rune is a fast and robust library for building high-quality frontend applications, serving as a modern web technology-based SDK.

- Object-oriented programming-based architecture
- Type-safe Generic Views & Enable
- Single-component Server-Side Rendering
- Sleek UI component development kit
- High portability and performance

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

class SettingListView extends ListView<SettingItemView> {
  ItemView = SettingItemView;
}

class SettingPage extends View<Setting[]> {
  private listView = new SettingListView(this.data);
  private toggleAllView = new SwitchView({ on: this.isAllOn() });

  override template() {
    return html`
      <div>
        <div class="header">
          <h2>Setting</h2>
          ${this.toggleAllView}
        </div>
        <div class="body">${this.listView}</div>
      </div>
    `;
  }

  protected override onRender() {
    this.toggleAllView.addEventListener(Toggled, (e) => this.toggleAll(e.detail.on));
    this.listView.addEventListener(Toggled, () => this.syncToggleAllView());
  }

  private toggleAll(on: boolean) {
    this.listView.itemViews
      .filter((itemView) => itemView.data.on !== on)
      .forEach((itemView) => itemView.switchView.setOn(on));
  }

  private syncToggleAllView() {
    this.toggleAllView.setOn(this.isAllOn());
  }

  private isAllOn() {
    return this.data.every(({ on }) => on);
  }
}
```

<img src="https://raw.githubusercontent.com/marpple/rune/main/docs/img/setting_controller.gif" alt="setting_controller">
