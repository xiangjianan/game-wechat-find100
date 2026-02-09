# DOM事件默认行为阻止说明

## 重要性

使用DOM事件监听（如HTML5游戏引擎）时，必须阻止默认行为，否则会导致：

1. **触摸事件**：页面滚动、缩放、双击缩放等默认行为
2. **鼠标事件**：文本选择、拖拽等默认行为
3. **点击事件**：链接跳转、表单提交等默认行为

## 当前实现

### 1. 触摸事件阻止默认行为

```javascript
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  e.stopPropagation();
  // ...
}, { passive: false });
canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  e.stopPropagation();
}, { passive: false });
```

#### 关键点
- ✅ 调用`e.preventDefault()`阻止默认行为
- ✅ 调用`e.stopPropagation()`阻止事件冒泡
- ✅ 设置`{ passive: false }`允许调用preventDefault

### 2. Canvas样式阻止默认行为

```javascript
if (typeof canvas.style !== 'undefined') {
  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  canvas.style.webkitUserSelect = 'none';
  canvas.style.webkitTouchCallout = 'none';
}
```

#### 关键点
- ✅ 设置`touchAction: 'none'`禁用默认触摸行为
- ✅ 设置`userSelect: 'none'`禁用文本选择
- ✅ 设置`webkitUserSelect: 'none'`禁用WebKit文本选择
- ✅ 设置`webkitTouchCallout: 'none'`禁用WebKit触摸提示

## 为什么需要阻止默认行为

### 1. 触摸事件

#### 默认行为
- 页面滚动
- 页面缩放
- 双击缩放
- 长按菜单

#### 阻止原因
- 游戏需要完全控制触摸事件
- 避免页面滚动干扰游戏
- 避免缩放干扰游戏
- 提升用户体验

### 2. 鼠标事件

#### 默认行为
- 文本选择
- 拖拽
- 右键菜单

#### 阻止原因
- 游戏需要完全控制鼠标事件
- 避免文本选择干扰游戏
- 避免拖拽干扰游戏
- 提升用户体验

### 3. 点击事件

#### 默认行为
- 链接跳转
- 表单提交
- 文本选择

#### 阻止原因
- 游戏需要完全控制点击事件
- 避免链接跳转干扰游戏
- 避免表单提交干扰游戏
- 提升用户体验

## passive: false 的重要性

### 什么是passive事件监听器

passive事件监听器是浏览器优化的一种方式，用于提升滚动性能。

```javascript
// passive: true（默认）
element.addEventListener('touchstart', handler, { passive: true });

// passive: false
element.addEventListener('touchstart', handler, { passive: false });
```

### passive: true 的问题

当passive为true时：
- 浏览器不会等待事件处理函数完成
- 无法调用`e.preventDefault()`
- 无法阻止默认行为
- 会导致页面滚动、缩放等默认行为

### passive: false 的优势

当passive为false时：
- 浏览器会等待事件处理函数完成
- 可以调用`e.preventDefault()`
- 可以阻止默认行为
- 完全控制触摸事件

### 为什么必须设置passive: false

```javascript
// 错误示例
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // 无效！因为passive默认为true
});

// 正确示例
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // 有效！因为passive为false
}, { passive: false });
```

## touchAction: none 的重要性

### 什么是touchAction

touchAction是CSS属性，用于控制触摸事件的默认行为。

```css
touch-action: none;
touch-action: auto;
touch-action: pan-x;
touch-action: pan-y;
touch-action: manipulation;
```

### touchAction: none 的优势

当touchAction为none时：
- 禁用所有默认触摸行为
- 禁用页面滚动
- 禁用页面缩放
- 禁用双击缩放
- 完全控制触摸事件

### 为什么必须设置touchAction: none

```javascript
// 错误示例
canvas.style.touchAction = 'auto'; // 允许默认触摸行为

// 正确示例
canvas.style.touchAction = 'none'; // 禁用默认触摸行为
```

## 当前实现的优势

### 1. 完全阻止默认行为

```javascript
e.preventDefault();
e.stopPropagation();
```

#### 优势
- ✅ 阻止页面滚动
- ✅ 阻止页面缩放
- ✅ 阻止双击缩放
- ✅ 阻止长按菜单
- ✅ 完全控制触摸事件

### 2. 完全禁用默认触摸行为

```javascript
canvas.style.touchAction = 'none';
canvas.style.userSelect = 'none';
canvas.style.webkitUserSelect = 'none';
canvas.style.webkitTouchCallout = 'none';
```

#### 优势
- ✅ 禁用默认触摸行为
- ✅ 禁用文本选择
- ✅ 禁用WebKit文本选择
- ✅ 禁用WebKit触摸提示
- ✅ 完全控制触摸事件

### 3. 允许调用preventDefault

```javascript
{ passive: false }
```

#### 优势
- ✅ 允许调用preventDefault
- ✅ 允许阻止默认行为
- ✅ 完全控制触摸事件
- ✅ 提升用户体验

## 测试建议

### 功能测试
- [ ] 测试触摸事件是否阻止了默认行为
- [ ] 测试页面是否不会滚动
- [ ] 测试页面是否不会缩放
- [ ] 测试双击是否不会缩放
- [ ] 测试长按是否不会显示菜单

### 兼容性测试
- [ ] 测试在不同浏览器上是否正常
- [ ] 测试在不同设备上是否正常
- [ ] 测试在微信小程序中是否正常
- [ ] 测试在非微信环境中是否正常

### 性能测试
- [ ] 测试事件处理是否流畅
- [ ] 测试是否有性能问题
- [ ] 测试是否有延迟
- [ ] 测试是否有卡顿

## 最佳实践

### 1. 阻止默认行为
- 调用`e.preventDefault()`阻止默认行为
- 调用`e.stopPropagation()`阻止事件冒泡
- 设置`{ passive: false }`允许调用preventDefault

### 2. 禁用默认触摸行为
- 设置`touchAction: 'none'`禁用默认触摸行为
- 设置`userSelect: 'none'`禁用文本选择
- 设置`webkitUserSelect: 'none'`禁用WebKit文本选择
- 设置`webkitTouchCallout: 'none'`禁用WebKit触摸提示

### 3. 完全控制事件
- 阻止所有默认行为
- 禁用所有默认触摸行为
- 完全控制触摸事件
- 提升用户体验

### 4. 性能优化
- 使用passive: false时注意性能
- 避免在事件处理函数中执行耗时操作
- 使用requestAnimationFrame优化渲染
- 使用节流和去抖优化事件处理

## 总结

当前实现已经正确阻止了所有默认行为：

1. ✅ 调用`e.preventDefault()`阻止默认行为
2. ✅ 调用`e.stopPropagation()`阻止事件冒泡
3. ✅ 设置`{ passive: false }`允许调用preventDefault
4. ✅ 设置`touchAction: 'none'`禁用默认触摸行为
5. ✅ 设置`userSelect: 'none'`禁用文本选择
6. ✅ 设置`webkitUserSelect: 'none'`禁用WebKit文本选择
7. ✅ 设置`webkitTouchCallout: 'none'`禁用WebKit触摸提示

游戏现在完全控制了所有触摸和鼠标事件，避免了默认行为干扰游戏体验。

## 版本信息

- **版本号**: v5.1.0
- **更新日期**: 2026-02-09
- **主要改动**: DOM事件默认行为阻止说明
- **技术栈**: 原生JavaScript + Canvas API + Web Audio API + Voronoi图算法
