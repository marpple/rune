import { html, rune, View } from 'rune-ts';

export class StyleView extends View<object> {
  override template() {
    return html`<style>
      [data-rune] * {
        box-sizing: content-box;
      }
      #tutorial {
        padding: 120px;
        font-size: 18px;
      }

      #tutorial button.SwitchView {
        width: 44px;
        border-radius: 15px;
        border: 0 none;
        padding: 5px;
        box-sizing: border-box;
        transition-property: background-color;
        transition-duration: 0.2s;
        background-color: #aaa;
      }

      .SwitchView .toggle {
        width: 18px;
        height: 18px;
        margin: 0;
        border-radius: 9px;
        background: white;
        transform: translateX(0);
        transition-property: transform;
        transition-duration: 0.2s;
      }

      #tutorial button.SwitchView.on {
        background-color: #1d75ff;
      }

      .SwitchView.on .toggle {
        transform: translateX(16px);
      }

      .SettingPage,
      .SettingPage2 {
        margin-top: 40px;
        box-shadow: 0px 1px 10px #ddd;
        border: 1px solid #eee;
      }

      .SettingPage h2,
      .SettingPage2 h2 {
        text-align: center;
        margin: 0;
        padding: 0;
        font-size: 24px;
      }

      .SettingPage ul,
      .SettingPage ul li,
      .SettingPage2 ul,
      .SettingPage2 ul li {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .SettingPage ul li,
      .SettingPage2 ul li,
      .SettingItemView {
        position: relative;
        padding: 16px 16px 15px;
        height: 28px;
        line-height: 28px;
        border-top: 1px solid #eee;
      }

      .SettingPage .header .SwitchView,
      .SettingPage ul li .SwitchView,
      .SettingPage2 .header .SwitchView,
      .SettingPage2 ul li .SwitchView,
      .SettingItemView .SwitchView {
        position: absolute;
        top: 13px;
        right: 16px;
      }

      .SettingPage .header,
      .SettingPage2 .header {
        position: relative;
        padding: 16px 16px 15px;
        height: 24px;
        line-height: 24px;
      }

      .SettingPage .header .SwitchView,
      .SettingPage2 .header .SwitchView {
        position: absolute;
        top: 14px;
        right: 16px;
      }

      .SettingPage .footer,
      .SettingPage2 .footer,
      .TodoPage .filter {
        text-align: center;
        position: relative;
        padding: 16px;
        border-top: 1px solid #eee;
      }

      .SettingPage .footer button,
      .SettingPage2 .footer button,
      .TodoPage .filter button {
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 8px;
        cursor: pointer;
      }

      .SettingPage .footer button:active,
      .SettingPage2 .footer button:active,
      .TodoPage .filter button:active {
        border-color: #83b6ff;
      }

      .TodoPage .filter button.selected,
      .TodoPage .filter[data-current='all'] button[data-filter='all'],
      .TodoPage .filter[data-current='active'] button[data-filter='active'],
      .TodoPage .filter[data-current='completed'] button[data-filter='completed'] {
        border-color: #1d75ff;
      }

      .CheckView {
        border: 0 none;
        background-color: transparent;
        display: inline-block;
        width: 32px;
        height: 30px;
        background-image: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%22-10%20-18%20100%20135%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22none%22%20stroke%3D%22%23ededed%22%20stroke-width%3D%223%22/%3E%3C/svg%3E');
        background-repeat: no-repeat;
        background-position: -7px -5px;
      }

      .CheckView.on {
        background-image: url('data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%22-10%20-18%20100%20135%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22none%22%20stroke%3D%22%23bddad5%22%20stroke-width%3D%223%22/%3E%3Cpath%20fill%3D%22%235dc2af%22%20d%3D%22M72%2025L42%2071%2027%2056l-4%204%2020%2020%2034-52z%22/%3E%3C/svg%3E');
      }

      button.destroy {
        position: absolute;
        top: 0;
        right: 10px;
        bottom: 0;
        width: 40px;
        height: 40px;
        margin: auto 0;
        font-size: 30px;
        color: #949494;
        transition: color 0.2s ease-out;
      }

      .TodoItemView {
        position: relative;
        padding: 16px 16px 15px 58px;
        height: 30px;
        line-height: 30px;
        border-top: 1px solid #eee;
      }

      .TodoItemView.completed {
        color: #d9d9d9;
        text-decoration: line-through;
      }

      .TodoItemView .remove {
        position: absolute;
        top: 6px;
        right: 12px;
        background: none;
        border: 0 none;
        font-size: 18px;
        padding: 8px 12px;
        color: #666;
      }

      .TodoItemView .CheckView {
        position: absolute;
        top: 14px;
        left: 16px;
      }

      .TodoPage {
        margin-top: 40px;
        box-shadow: 0px 1px 10px #ddd;
        border: 1px solid #eee;
      }

      .TodoPage .editor,
      .TodoPage .header {
        position: relative;
        width: 100%;
        overflow: hidden;
      }

      .TodoPage .editor .CheckView,
      .TodoPage .header .CheckView {
        position: absolute;
        top: 16px;
        left: 16px;
      }

      .TodoPage .editor input,
      .TodoPage .header input {
        padding: 16px 16px 15px 58px;
        height: 30px;
        line-height: 30px;
        border: 0 none !important;
        font-size: 18px;
        width: 70%;
        outline: none;
      }
    </style>`;
  }
}
