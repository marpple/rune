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

class SettingsView extends View<Setting[]> {
  override template() {
    return html`
      <div>
        <div class="header">
          <span class="title">Check All</span>
          ${new SwitchView({ on: this.isAllChecked() })}
        </div>
        <ul class="body">
          ${this.data.map((setting) => html`
            <li>
              <span class="title">${setting.title}</span>
              ${new SwitchView(setting)}
            </li>
          `)}
        </ul>
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
  private _changed() {
    this.subViewIn('> .header', SwitchView)!.setOn(this.isAllChecked());
  }

  isAllChecked() {
    return this.data.every(({ on }) => on);
  }
}
```