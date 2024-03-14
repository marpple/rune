# Getting Started
```shell
pnpm add rune-ts
npm install rune-ts
```

# SettingsView
```typescript
interface Setting {
  title: string;
  on: boolean;
}

class SettingsView extends ListView<Setting> {
  override template() {
    return html`
      <div>
        <div class="header">
          <span class="title">Check All</span>
          ${new SwitchView({ on: this.isAllChecked() })}
        </div>
        <div class="body">
          ${this.data.map(
            (setting) => html`
              <div class="setting-item">
                <span class="title">${setting.title}</span>
                ${new SwitchView(setting)}
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  @on('switch:change', '> .header')
  checkAll() {
    const { on } = this.subViewIn('> .header', SwitchView)!.data;
    this.subViewsIn('> .body', SwitchView)
      .filter((view) => on !== view.data.on)
      .forEach((view) => view.setOn(on));
  }

  @on('switch:change', '> .body')
  settingViewChanged() {
    this.subViewIn('> .header', SwitchView)!.setOn(this.isAllChecked());
  }

  isAllChecked() {
    return this.data.every(({ on }) => on);
  }
}
```

# DOCS
- [RUNE VIEW TUTORIAL](https://github.com/marpple/Rune/blob/main/docs/core/rune.View/%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC.md)
- [RUNE $ TUTORIAL](https://github.com/marpple/Rune/blob/main/docs/core/rune.%24/%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC.md)
