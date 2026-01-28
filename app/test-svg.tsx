import Svg, { Defs, Pattern, Rect, Circle, G } from 'react-native-svg';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 24;
export default function TestSvg({ offsetX = 0, offsetY = 0 }) {
    return (
        <Svg
      width={width}
      height={height}
      style={{ position: 'absolute', left: 0, top: 0 }}
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
            r={1.5}
            fill="#D1D1D6"
          />
        </Pattern>
      </Defs>

      <G transform={`translate(${offsetX % GRID_SIZE}, ${offsetY % GRID_SIZE})`}>
        <Rect
          x={-GRID_SIZE}
          y={-GRID_SIZE}
          width={width + GRID_SIZE * 2}
          height={height + GRID_SIZE * 2}
          fill="url(#dotGrid)"
        />
      </G>
    </Svg>
    )
};