# Rune - Web API based Front-end SDK
Rune은 품질 좋은 프론트엔드 앱 개발을 위한 빠르고 견고한 라이브러리이자 최신 웹 기술 기반의 SDK입니다.

- Type-safe Generic Views & Enable
- 단일 컴포넌트 Server Side Rendering
- 유려하게 동작하는 UI 컴포넌트 개발 키트
- 높은 이식성, 고성능
- 객체지향 프로그래밍 기반 아키텍쳐 제공

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

<img src="https://s3.marpple.co/files/u_218933/2024/3/original/a3e403fe7005e00e23b99bf3a331c5c252f392401.gif" width="100%">