import React, { useMemo } from 'react';
import { Canvas, Circle, Group, Path } from '@shopify/react-native-skia';
import { WORLD_SIZE } from '@/config/canvas';

const GRID_SIZE = 24;
const DOT_RADIUS = 2;

/**
 * 使用 Skia 渲染的点状网格背景
 * 
 * 优势：
 * - GPU 渲染，性能更好
 * - 支持超大画布（4096x4096）
 * - transform 更流畅
 * - 可控边界
 * 
 * 优化策略：
 * - 使用 Path 批量绘制点，减少组件数量
 * - 或者使用 Group + 循环渲染（当前方案）
 */
export default function GridBackgroundSkia() {
  // 使用 useMemo 缓存点的生成，避免每次渲染都重新计算
  const dots = useMemo(() => {
    const cols = Math.ceil(WORLD_SIZE / GRID_SIZE);
    const rows = Math.ceil(WORLD_SIZE / GRID_SIZE);
    const result: Array<{ x: number; y: number }> = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        result.push({
          x: col * GRID_SIZE + GRID_SIZE / 2,
          y: row * GRID_SIZE + GRID_SIZE / 2,
        });
      }
    }
    return result;
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
      <Group>
        {dots.map((dot, index) => (
          <Circle
            key={`dot-${index}`}
            cx={dot.x}
            cy={dot.y}
            r={DOT_RADIUS}
            color="#000000"
          />
        ))}
      </Group>
    </Canvas>
  );
}
