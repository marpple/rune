# Getting Started
```shell
pnpm add rune-ts
npm install rune-ts
```

# SettingsView
```typescript
interface Setting {
  title: string;
  isOn: boolean;
}

class SettingsView extends ListView<Setting> {
  override ItemView = SwitchView;
  override itemViews: SwitchView[] = [];

  checkAllView: SwitchView = new SwitchView({
    title: 'Check All',
    isOn: false,
  });

  override template() {
    return html`
      <div>
        <div class="header">${this.checkAllView}</div>
        <div class="body">${this.createItemViews()}</div>
      </div>
    `;
  }

  @on('switch:change', '> .header')
  toggleCheckAll() {
    const { isOn } = this.checkAllView.data;
    this.itemViews
        .filter(({ data }) => isOn !== data.isOn)
        .forEach((settingView) => settingView.setOn(isOn));
  }

  @on('switch:change', '> .body')
  settingViewChanged() {
    this.checkAllView.setOn(this.itemViews.every(({ data: { isOn } }) => isOn));
  }
}
```

# DOCS
- [RUNE VIEW TUTORIAL](https://github.com/marpple/Rune/blob/main/docs/core/rune.View/%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC.md)
- [RUNE $ TUTORIAL](https://github.com/marpple/Rune/blob/main/docs/core/rune.%24/%ED%8A%9C%ED%86%A0%EB%A6%AC%EC%96%BC.md)
