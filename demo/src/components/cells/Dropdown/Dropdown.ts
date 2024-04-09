import { type Html, html, on, View } from 'rune-ts';

import c from './Dropdown.module.scss';
import { htmlIf } from '../../../../shared/utls';
import { DropdownDownIcon } from '../../atoms/Icon/icons';
import { isSafari } from '../../../../shared/ua';
import { typo } from '../../../../common/typo';

// type - style mapping
const horizontal_class_map = {
  right: c.right,
  left: c.left,
};

const vertical_class_map = {
  bottom: c.bottom,
  top: c.top,
  auto: '',
};

export interface DropdownOption<T = unknown> {
  name: string | Html;
  value: T;
  key: string; // unique identifier
}

export class DropdownChangeEvent<T = unknown> extends CustomEvent<{
  option: DropdownOption<T> | null;
}> {}

export interface DropdownProps {
  horizontal: 'left' | 'right';
  vertical?: 'auto' | 'top' | 'bottom';
  is_opened?: boolean;
  default_name?: string;
  button_klass?: string;
  klass?: string;
  has_arrow?: boolean;
  closeOnFocusOut?: boolean; // 드랍다운 이외 영역 클릭했을 때, 열려있는 창을 닫을 것인지
}

export interface DropdownData<T = unknown> {
  selected_option_key?: string;
  options: DropdownOption<T>[];
}

export class Dropdown<T = unknown> extends View<DropdownData<T>> {
  state: DropdownProps & {
    is_opened: boolean;
    vertical: 'auto' | 'top' | 'bottom';
    has_arrow: boolean;
    closeOnFocusOut: boolean;
  };

  constructor(data: DropdownData<T>, options: DropdownProps) {
    super(data);

    this.state = {
      ...options,
      button_klass: options.button_klass ?? '',
      klass: options.klass ?? '',
      is_opened: options.is_opened ?? false,
      vertical: options.vertical ?? 'bottom',
      has_arrow: options.has_arrow ?? true,
      closeOnFocusOut: options.closeOnFocusOut ?? true,
    };
  }

  override onMount() {
    const is_safari = isSafari();
    this.addEventListener('focusout', function closeDropdown(e) {
      if (!this.state.closeOnFocusOut) return;
      if (is_safari) return; // safari 에서는 relatedTarget 이 제대로 안잡힘
      if (e.relatedTarget instanceof HTMLElement) {
        // click 한 곳이 현재 Dropdown 내부일 경우에는 무시
        const close_component_el = e.relatedTarget ? e.relatedTarget.closest(`.Dropdown`) : null;
        if (close_component_el == this.element()) return;
      }

      this.toggle(false);
    });
  }

  @on('click', `.${c.button}`)
  private _onButtonClick() {
    this.toggle(!this.state.is_opened);
  }

  @on('click', `.${c.option}`)
  private _onOptionClick(e) {
    const option_el = e.currentTarget;
    const key = (option_el.getAttribute('data-key') || '') as string;

    this.toggle(false);
    const selected_option = this.select(key);

    this.dispatchEvent(DropdownChangeEvent<T>, {
      bubbles: true,
      detail: {
        option: selected_option,
      },
    });
  }

  /*
   * Data & State Update
   */

  setStateIsOpened(should_open: boolean) {
    this.state.is_opened = should_open;
  }

  /*
   * Normal Method
   */

  findSelectedOption(selected_option_key?: string) {
    if (!selected_option_key) return null;
    return this.data.options.find((option) => option.key === selected_option_key) ?? null;
  }

  toggle(should_open: boolean) {
    this.setStateIsOpened(should_open);
    if (should_open) {
      this.element().classList.add(c.is_opened);
    } else {
      this.element().classList.remove(c.is_opened);
    }
  }

  select(selected_option_key: string): DropdownOption<T> | null {
    this.data.selected_option_key = selected_option_key;
    this.toggle(false);
    this.redraw();

    return this.findSelectedOption(selected_option_key);
  }

  override template() {
    const {
      data,
      state: { klass, horizontal, default_name, button_klass, has_arrow, is_opened, vertical },
    } = this;

    const selected_option = this.findSelectedOption(this.data.selected_option_key);
    const horizontal_class = horizontal_class_map[horizontal];
    const vertical_class = vertical_class_map[vertical];

    const dropdown_icon = html`<span class="${c.icon}"> ${DropdownDownIcon} </span>`;

    return html`
      <div class="${htmlIf(c.is_opened, is_opened)} ${c.dropdown} ${typo('14_medium')} ${klass}">
        <button class="${c.button} ${button_klass}">
          ${selected_option?.name || default_name} ${htmlIf(dropdown_icon, has_arrow)}
        </button>
        <div class="${c.option_container} ${horizontal_class} ${vertical_class}">
          ${data.options.map((option) => {
            const selected_class = selected_option == option ? c.selected : '';

            return html`<button class="${c.option} ${selected_class}" data-key="${option.key}">
              ${option.name}
            </button>`;
          })}
        </div>
      </div>
    `;
  }
}
