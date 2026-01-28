import React from 'react';
import Svg, { Defs, Pattern, Rect, Circle } from 'react-native-svg';
import { WORLD_SIZE } from '@/config/canvas';

const GRID_SIZE = 24;

export default function GridBackground() {
  return (
    <Svg
      width={WORLD_SIZE}
      height={WORLD_SIZE}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: WORLD_SIZE,
        height: WORLD_SIZE,
      }}
    >
      <Defs>
        <Pattern
          id="dotGrid"
          width={GRID_SIZE}
          height={GRID_SIZE}
          patternUnits="userSpaceOnUse"
        >
          <Circle
            cx={GRID_SIZE / 2}
            cy={GRID_SIZE / 2}
            r={2}
            fill="#000"
          />
        </Pattern>
      </Defs>
      <Rect
        x={0}
        y={0}
        width={WORLD_SIZE}
        height={WORLD_SIZE}
        fill="url(#dotGrid)"
      />
    </Svg>
  );
}