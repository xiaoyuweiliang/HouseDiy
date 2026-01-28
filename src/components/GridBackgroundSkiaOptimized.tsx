import React, { useMemo } from 'react';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { WORLD_SIZE } from '@/config/canvas';

const GRID_SIZE = 24;
const DOT_RADIUS = 2;

/**
 * 使用 Skia Path 批量绘制的点状网格背景（优化版）
 * 
 * 优势：
 * - 使用单个 Path 批量绘制所有点，性能更好
 * - GPU 渲染
 * - 适合超大画布
 */
export default function GridBackgroundSkiaOptimized() {
  // 使用 useMemo 缓存 Path 的生成
  const path = useMemo(() => {
    const skiaPath = Skia.Path.Make();
    const cols = Math.ceil(WORLD_SIZE / GRID_SIZE);
    const rows = Math.ceil(WORLD_SIZE / GRID_SIZE);

    // 使用 addCircle 批量添加所有点
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * GRID_SIZE + GRID_SIZE / 2;
        const y = row * GRID_SIZE + GRID_SIZE / 2;
        skiaPath.addCircle(x, y, DOT_RADIUS);
      }
    }

    return skiaPath;
  }, []);

  return (
    <Canvas
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: WORLD_SIZE,
        height: WORLD_SIZE,
      }}
    >
      <Path
        path={path}
        color="#000000"
        style="fill"
      />
    </Canvas>
  );
}
