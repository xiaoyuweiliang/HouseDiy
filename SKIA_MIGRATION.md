# Skia 迁移指南

## 安装步骤

### 1. 安装依赖

```bash
npx expo install @shopify/react-native-skia
```

### 2. iOS 安装 Pods

```bash
cd ios && pod install && cd ..
```

### 3. 重新构建应用

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## 使用 Skia 版本的 GridBackground

在 `app/main.tsx` 中替换导入：

```typescript
// 旧版本（SVG）
import GridBackground from '@/components/GridBackground';

// 新版本（Skia）
import GridBackground from '@/components/GridBackgroundSkia';
```

## 性能对比

| 特性 | SVG 版本 | Skia 版本 |
|------|---------|-----------|
| 渲染方式 | CPU | GPU |
| 大画布支持 | 有限制 | 优秀 |
| Transform 性能 | 一般 | 流畅 |
| 内存占用 | 较低 | 中等 |
| 兼容性 | 好 | 需要原生模块 |

## 注意事项

1. **首次安装需要重新构建**：Skia 是原生模块，需要重新编译
2. **包体积增加**：约 6MB (iOS) / 4MB (Android)
3. **Web 支持**：需要额外配置（参考 Skia 文档）

## 优化建议

如果点数量过多导致性能问题，可以考虑：

1. **使用 Path 批量绘制**：将所有点合并到一个 Path 中
2. **视口裁剪**：只渲染可见区域内的点
3. **降低点密度**：增大 GRID_SIZE
