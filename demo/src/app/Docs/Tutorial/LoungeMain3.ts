import { View, Enable, html, on, enable, ListView, rune } from 'rune-ts';
import { each, filter, map, pipe } from '@fxts/core';

export function main() {
  document.body.appendChild(
    new SettingsView([
      { title: 'Wi-fi', on: true },
      { title: 'Bluetooth', on: false },
      { title: 'Airplane mode', on: true },
    ]).render(),
  );
}

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
          ${this.data.map(
            (setting) => html`
              <li>
                <span class="title">${setting.title}</span>
                ${new SwitchView(setting)}
              </li>
            `,
          )}
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
  private _settingViewChanged() {
    this.subViewIn('> .header', SwitchView)!.setOn(this.isAllChecked());
  }

  isAllChecked() {
    return this.data.every(({ on }) => on);
  }
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
