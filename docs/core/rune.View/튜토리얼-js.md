# 시작하기

## View

Rune에서는 View를 상속하여 컴포넌트를 만듭니다.

##### TS
```typescript
class ColorView extends View<string> {
  template(color: string) {
    return this.html`
        <div class="color" style="background-color: ${color}"></div>
      `;
    }
}
```


```javascript
class ColorView extends View {
  template(color) {
    return this.html`
        <div class="color" style="background-color: ${color}"></div>
      `;
    }
}
```


```javascript
const view = new ColorView('red');
view.data = 'blue';
view.redraw();
```