# 从 Pixso 导出图标指南

## 需要导出的图标列表

### 功能图标 (icon/)
1. **icon/setting** → `assets/icons/icon/setting.png`
2. **icon/history** → `assets/icons/icon/history.png`
3. **icon/delete** → `assets/icons/icon/delete.png`
4. **icon/plus** → `assets/icons/icon/plus.png`
5. **icon/minus** → `assets/icons/icon/minus.png`
6. **icon/location** → `assets/icons/icon/location.png`
7. **icon/save-image** → `assets/icons/icon/save-image.png`
8. **icon/save-board** → `assets/icons/icon/save-board.png`
9. **icon/close** → `assets/icons/icon/close.png`
10. **icon/share** → `assets/icons/icon/share.png`
11. **icon/left** → `assets/icons/icon/left.png`

### 分类图标 (icon/)
每个分类需要两个版本：default 和 select

1. **icon/livingroom** → 
   - `assets/icons/nav/livingroom-default.png`
   - `assets/icons/nav/livingroom-select.png`

2. **icon/kitchen** →
   - `assets/icons/nav/kitchen-default.png`
   - `assets/icons/nav/kitchen-select.png`

3. **icon/bedroom** →
   - `assets/icons/nav/bedroom-default.png`
   - `assets/icons/nav/bedroom-select.png`

4. **icon/bathroom** →
   - `assets/icons/nav/bathroom-default.png`
   - `assets/icons/nav/bathroom-select.png`

5. **icon/diningroom** →
   - `assets/icons/nav/diningroom-default.png`
   - `assets/icons/nav/diningroom-select.png`

6. **icon/office** →
   - `assets/icons/nav/office-default.png`
   - `assets/icons/nav/office-select.png`

7. **icon/children'sroom** →
   - `assets/icons/nav/childrensroom-default.png`
   - `assets/icons/nav/childrensroom-select.png`

8. **icon/StudyRoom** →
   - `assets/icons/nav/studyroom-default.png`
   - `assets/icons/nav/studyroom-select.png`

9. **icon/balcony** →
   - `assets/icons/nav/balcony-default.png`
   - `assets/icons/nav/balcony-select.png`

10. **icon/gate** →
    - `assets/icons/nav/gate-default.png`
    - `assets/icons/nav/gate-select.png`

11. **icon/corridor** →
    - `assets/icons/nav/corridor-default.png`
    - `assets/icons/nav/corridor-select.png`

## 导出方法

### 方法 1: 提供节点 ID
在 Pixso 中：
1. 选中图标组件
2. 复制链接（包含 `item-id=...`）
3. 提供给我，我会自动导出

### 方法 2: 批量导出
如果图标都在同一个组件库中，可以提供组件库的链接，我会尝试批量导出。

## 导出后
导出完成后，我会：
1. 保存图标到对应的 `assets/icons/` 目录
2. 更新 `src/components/icons.ts` 使用本地资源
3. 确保所有引用都正确更新
