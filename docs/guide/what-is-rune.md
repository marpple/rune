# What is Rune?

Rune is a library and SDK designed to develop high-quality frontend applications. It is tailored for creating elegant UIs, reusable components, supporting smooth rendering, and facilitating the creation of high-quality libraries.

In today's development landscape, TypeScript and JavaScript have evolved to integrate the paradigms of object-oriented and functional languages, leveraging their respective strengths. TypeScript, in particular, has become a versatile multi-paradigm language with a stable and flexible type system. Additionally, advancements in Web APIs (VanillaJS), browser standardization, and module system standardization have enriched frontend development, making it more robust and secure.

Rune embraces the characteristics of these two languages by understanding and applying them effectively. It adheres to authentic programming paradigms without overly extending the languages or deviating from their core principles. Designed to handle the JavaScript core technology, Web API, Rune enables developers to create sophisticated components and applications. Over time, this approach enhances code reusability, facilitates maintenance, and enables the development of high-quality software with excellent productivity.

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

<img src="https://raw.githubusercontent.com/marpple/rune/main/docs/img/setting_controller.gif" width="100%">

Rune itself is not inherently reactive. Instead, as components are composed, they gain reactive characteristics, and DOM manipulation code becomes increasingly abstracted. At this point, each component adopts its own optimized rendering logic. With automatic re-rendering at the library level and no associated side effects, controlling the complexity required for elegant UI development becomes manageable and advantageous for advancement.

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

Rune adheres to a solid foundation, embracing both the latest standard web technologies and traditional programming paradigms. Rune components operate solely with pure JavaScript and boast high portability, supporting [server-side rendering even when a component operates alone](/tutorial/solo-component-ssr.html). This versatility positions Rune as an exciting new tool for crafting high-quality components based on Vanilla JS. We look forward to Rune contributing to the frontend development ecosystem alongside many developers.