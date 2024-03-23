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

class SettingController extends View<Setting[]> {
  private checkAllSwitchView = new SwitchView({ on: this.isAllChecked() });
  private settingListview = new SettingListView(this.data);

  override template() {
    return html`
      <div>
        <div class="header">
          <span class="title">Check All</span>
          ${this.checkAllSwitchView}
        </div>
        ${this.settingListview}
      </div>
    `;
  }

  @on('switch:change', '> .header')
  checkAll() {
    const { on } = this.checkAllSwitchView.data;
    this.settingListview.itemViews
        .filter((view) => on !== view.data.on)
        .forEach((view) => view.switchView.setOn(on));
  }

  @on('switch:change', `> .${SettingListView}`)
  private _changed() {
    this.checkAllSwitchView.setOn(this.isAllChecked());
  }

  isAllChecked() {
    return this.data.every(({ on }) => on);
  }
}
```

<img src="https://raw.githubusercontent.com/marpple/rune/main/docs/img/setting_controller.gif" alt="setting_controller">
