# What is Rune?

Rune is both a library and an SDK for developing high-quality frontend applications. It’s designed to facilitate elegant UI development, the creation of reusable components, smooth rendering, and the production of robust, high-quality libraries.

Today, TypeScript and JavaScript have evolved considerably, effectively adopting object-oriented and functional programming paradigms in ways well suited to each language’s unique characteristics. Thanks in part to TypeScript, they’ve become outstanding multi-paradigm languages with stable and flexible type systems. Furthermore, advances in the Web API (Vanilla JS), browser standardization, and module system standardization have made frontend app development more feature-rich and secure than ever.

Rune fully embraces and applies the strengths of these two languages. Rather than excessively extending the language or straying from established paradigms, Rune follows a traditional programming approach and is designed to seamlessly handle Web APIs—a core JavaScript technology. As a result, developers using Rune can build advanced components and applications, steadily increase code reusability over time, simplify maintenance, and develop high-quality software with strong productivity.

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
  private checkAllView = new SwitchView({ on: this.isAllOn() });

  override template() {
    return html`
      <div>
        <div class="header">
          <h2>Setting</h2>
          ${this.checkAllView}
        </div>
        <div class="body">${this.listView}</div>
      </div>
    `;
  }

  protected override onRender() {
    this.checkAllView.addEventListener(Toggled, (e) => this.checkAll(e.detail.on));
    this.listView.addEventListener(Toggled, () => this.syncCheckAllView());
  }

  private checkAll(on: boolean) {
    this.listView.itemViews
      .filter(itemView => itemView.data.on !== on)
      .forEach(itemView => itemView.switchView.setOn(on));
  }

  private syncCheckAllView() {
    this.checkAllView.setOn(this.isAllOn());
  }

  private isAllOn() {
    return this.data.every(({ on }) => on);
  }
}
```

Rune itself is not reactive. Instead, it becomes reactive through successive composition of components, progressively abstracting away DOM manipulation code. At this stage, each component has its own optimized rendering logic. Because there is no automatic re-rendering at the library level—and thus no side effects from it—it’s easier to control the complexity required for building smooth UIs and better suited for more sophisticated development.

```typescript
interface Toggle {
  on: boolean;
}

class Toggled extends CustomEventWithDetail<Toggle> {}

abstract class ToggleView extends View<Toggle> {
  @on('click')
  private toggle() {
    this.setOn(!this.data.on);
    this.dispatchEvent(Toggled, { bubbles: true, detail: this.data });
  }

  setOn(bool: boolean) {
    this.data.on = bool;
    this.element().classList.toggle('on', bool);
  }
}

class SwitchView extends ToggleView {
  override template() {
    return html`
      <button class="${this.data.on ? 'on' : ''}">
        <span class="toggle"></span>
      </button>
    `;
  }
}
```

Rune is built on strong foundations, such as the latest web standards and traditional programming paradigms. Rune components operate purely in JavaScript and are highly portable—for instance, [a standalone component can support server-side rendering](/tutorial/solo-component-ssr.html). This makes Rune a promising new tool for creating high-quality, Vanilla JS–based components. We look forward to seeing Rune contribute to the frontend development ecosystem together with many developers.