# What is Rune?

Rune은 품질 좋은 프론트엔드 앱을 개발하기 위한 라이브러리이자 SDK입니다. Rune 유려한 UI 개발, 재사용 가능한 컴포넌트 개발, 부드러운 렌더링 지원, 고품질 라이브러리를 제작하기 용이하도록 설계되었습니다. 

오늘날 타입스크립트와 자바스크립트는 발전을 거듭하여 객체지향 언어와 함수형 언어의 패러다임들을 두 언어의 특징에 맞게 잘 적용했고, 타입스크립트에 힘입어 안정성 있고 유연한 타입 시스템을 갖춘 훌륭한 멀티 패러다임 언어가 되었습니다. 또한 Web API(VanillaJS)의 발전과 브라우저의 표준화, 모듈 시스템 표준화 등으로 프론트엔드 앱을 더욱 풍성하고 안전하게 개발할 수 있게 되었습니다.

Rune은 이러한 두 언어의 특성을 잘 이해하며 잘 적용됩니다. 과도하게 언어를 확장하려고 하거나 언어의 패러다임에서 벗어나지 않고 정통성 있는 프로그래밍 패러다임을 따르며 자바스크립트 코어 기술인 Web API를 다루기 용이하도록 설계되었습니다. 이는 Rune을 이용하는 개발자로 하여금 고도화된 컴포넌트와 애플리케이션 개발을 가능하게 하며 시간이 지날수록 코드의 재사용률을 높이고 유지보수를 용이하게 하고 고품질 소프트웨어를 좋은 생산성으로 개발할 수 있도록 돕습니다.

```typescript
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

<img src="/img/setting_controller.gif" width="100%">


Rune은 그 자체로는 리액티브 하지 않습니다. 대신 컴포넌트의 조합을 거듭하면서 리액티브 한 특성을 갖게 되며 DOM 조작 코드는 점점 추상화됩니다. 이때 각 컴포넌트는 각자에 맞는 최적화된 렌더링 로직을 갖게 됩니다. 라이브러리 레벨에서의 자동적인 리렌더와 그로 인한 사이드 이펙트가 없기 때문에 유려한 UI 개발에 필요한 복잡성을 제어하기 용이하고 고도화에 유리합니다.

```typescript
interface Setting {
  title: string;
  on: boolean;
}

class SettingView extends View<Setting> {
  switchView = new SwitchView(this.data);

  override template(setting: Setting) {
    return html`
      <li>
        <span class="title">${setting.title}</span>
        ${this.switchView}
      </li>
    `;
  }
}

class SettingListView extends ListView<Setting, SettingView> {
  override ItemView = SettingView;
}

class SwitchView extends View<{ on: boolean }> {
  override template() {
    return html`
      <button class="${this.data.on ? 'on' : ''}">
        <div class="toggle"></div>
      </button>
    `;
  }

  @on('click')
  private _toggle() {
    this.setOn(!this.data.on);
    this.dispatchEvent(new CustomEvent('switch:change', { bubbles: true }));
  }

  setOn(on: boolean): this {
    this.data.on = on;
    return this.redraw();
  }

  override redraw() {
    const { classList } = this.element();
    this.data.on ? classList.add('on') : classList.remove('on');
    return this;
  }
}
```

Rune은 웹의 최신 표준 기술과 전통적인 프로그래밍 패러다임과 같은 단단한 기반을 따르고 있습니다. Rune 컴포넌트는 순수한 자바스크립트만으로 동작하며 [컴포넌트 혼자서도 서버사이드 렌더링을 지원](/tutorial/solo-component-ssr.html)하는 등 이식성이 높습니다. 그렇기 때문에 Rune은 Vanilla JS 기반의 고품질 컴포넌트들을 만들어볼 만한 새로운 도구입니다. Rune이 많은 개발자들과 함께 프론트엔드 개발 생태계에 기여해 볼 수 있기를 기대합니다.