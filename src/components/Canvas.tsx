/**
 * Canvas 组件
 * 画布主区域：负责放置与渲染房间模块，并处理平移 / 缩放 / 拖拽中的「幽灵」预览
 * 实现方式参考 home/Demo 的 house Canvas，但适配当前项目类型与路径
 */

import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { G, Rect, Image as SvgImage, Circle, Defs, Pattern } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { RoomModule, PlacedRoom, GRID_SIZE } from '@/types';
import { ICONS } from '@/components/icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CanvasProps {
  placedRooms: PlacedRoom[];
  modules: RoomModule[];
  scale: number;
  pan: { x: number; y: number };
  onScaleChange: (scale: number) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  dragItem: DragItem | null;
  dragPosition: { x: number; y: number } | null;
  canvasLayout: { x: number; y: number; width: number; height: number };
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string | null) => void;
  onCanvasPress: () => void;
  onRoomDragStart: (room: PlacedRoom, module: RoomModule, touchX: number, touchY: number) => void;
  onRoomDragMove?: (touchX: number, touchY: number) => void;
  onRoomDragEnd?: (touchX: number, touchY: number) => void;
}

export interface DragItem {
  type: 'existing' | 'new';
  module: RoomModule;
  instanceId?: string;
  offsetX: number;
  offsetY: number;
}

export const Canvas: React.FC<CanvasProps> = React.memo(
  ({
    placedRooms,
    modules,
    scale,
    pan,
    onScaleChange,
    onPanChange,
    dragItem,
    dragPosition,
    canvasLayout,
    selectedRoomId,
    onRoomSelect,
    onCanvasPress,
    onRoomDragStart,
    onRoomDragMove,
    onRoomDragEnd,
  }) => {
    const canvasRef = useRef<View>(null);

    // 构建模块 Map，便于 O(1) 查找
    const moduleMap = useMemo(() => {
      const map = new Map<string, RoomModule>();
      modules.forEach((m) => map.set(m.id, m));
      return map;
    }, [modules]);

    // 手势共享值
    const scaleValue = useSharedValue(scale);
    const panX = useSharedValue(pan.x);
    const panY = useSharedValue(pan.y);
    const savedScale = useSharedValue(scale);
    const savedPanX = useSharedValue(pan.x);
    const savedPanY = useSharedValue(pan.y);

    // 用于跟踪房间拖动的共享值（需要在 panGesture 之前定义）
    const isDraggingRoom = useSharedValue(false);
    const roomDragStartTime = useSharedValue(0);
    const roomDragStartPos = useSharedValue({ x: 0, y: 0 });

    // props 变化时同步到共享值
    React.useEffect(() => {
      scaleValue.value = scale;
      panX.value = pan.x;
      panY.value = pan.y;
    }, [scale, pan.x, pan.y]);

    // 平移手势（拖动画布）
    // 只有在没有拖拽房间时才启用画布平移
    const panGesture = Gesture.Pan()
      .enabled(!dragItem)
      .onStart(() => {
        'worklet';
        savedPanX.value = panX.value;
        savedPanY.value = panY.value;
      })
      .onUpdate((event) => {
        'worklet';
        // 如果正在拖动房间，不更新画布位置
        if (isDraggingRoom.value) {
          return;
        }
        panX.value = savedPanX.value + event.translationX;
        panY.value = savedPanY.value + event.translationY;
      })
      .onEnd(() => {
        'worklet';
        if (!isDraggingRoom.value) {
          runOnJS(onPanChange)({ x: panX.value, y: panY.value });
        }
      });

    // 点击画布空白处的手势（用于清除选中）
    const tapGesture = Gesture.Tap()
      .onEnd(() => {
        'worklet';
        // 点击画布空白处，清除选中
        runOnJS(onCanvasPress)();
      });

    // 双指缩放手势
    const pinchGesture = Gesture.Pinch()
      .onStart(() => {
        'worklet';
        savedScale.value = scaleValue.value;
      })
      .onUpdate((event) => {
        'worklet';
        const nextScale = savedScale.value * event.scale;
        scaleValue.value = Math.max(0.2, Math.min(nextScale, 3.0));
      })
      .onEnd(() => {
        'worklet';
        runOnJS(onScaleChange)(scaleValue.value);
      });

    const composed = Gesture.Simultaneous(panGesture, pinchGesture, tapGesture);

    // 画布整体 transform
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: panX.value },
        { translateY: panY.value },
        { scale: scaleValue.value },
      ],
    }));

    // 渲染点阵网格
    const renderGrid = () => {
      const gridPattern = (
        <Pattern
          id="grid"
          x="0"
          y="0"
          width={GRID_SIZE}
          height={GRID_SIZE}
          patternUnits="userSpaceOnUse"
        >
          <Circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r="1.5" fill="#D1D1D6" />
        </Pattern>
      );

      return (
        <>
          <Defs>{gridPattern}</Defs>
          <Rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />
        </>
      );
    };

    // 已放置房间渲染
    const renderedRooms = useMemo(() => {
      return placedRooms.map((room) => {
        // 当前正在拖拽的房间由 drag ghost 渲染，这里跳过
        if (dragItem?.type === 'existing' && dragItem.instanceId === room.instanceId) {
          return null;
        }

        const module = moduleMap.get(room.moduleId);
        if (!module) return null;

        const isSelected = selectedRoomId === room.instanceId;

        return (
          <G key={room.instanceId} transform={`translate(${room.x}, ${room.y})`}>
            <SvgImage
              href={module.image}
              width={module.width}
              height={module.height}
              preserveAspectRatio="xMidYMid slice"
            />
            {/* 选中边框 */}
            {isSelected && (
              <Rect
                x={-2}
                y={-2}
                width={module.width + 4}
                height={module.height + 4}
                fill="none"
                stroke="#007AFF"
                strokeWidth={3}
                strokeDasharray="8 4"
                opacity={0.8}
              />
            )}
            {room.isBase && (
              <G transform="translate(-8, -8)">
                <Circle cx={10} cy={10} r={10} fill="#007AFF" />
                <SvgImage href={ICONS.star} x={4} y={4} width={12} height={12} />
              </G>
            )}
          </G>
        );
      });
    }, [placedRooms, dragItem, moduleMap, selectedRoomId, onRoomSelect, onRoomDragStart, onRoomDragMove, onRoomDragEnd, canvasLayout]);

    // 拖拽中的幽灵图像
    const renderedDragGhost = useMemo(() => {
      if (!dragItem || !dragPosition) return null;

      // dragPosition 为屏幕坐标（pageX/pageY）
      // 需转换为 SVG 世界坐标

      // 1. 屏幕 → 画布容器坐标
      const canvasX = dragPosition.x - canvasLayout.x;
      const canvasY = dragPosition.y - canvasLayout.y;

      // 2. 画布容器 → 世界坐标（反向应用 pan & scale）
      const worldX = (canvasX - pan.x) / scale;
      const worldY = (canvasY - pan.y) / scale;

      // 3. 减去手指相对模块左上角的偏移
      const finalX = worldX - dragItem.offsetX;
      const finalY = worldY - dragItem.offsetY;

      return (
        <G transform={`translate(${finalX}, ${finalY})`} opacity={0.7}>
          <SvgImage
            href={dragItem.module.image}
            width={dragItem.module.width}
            height={dragItem.module.height}
            preserveAspectRatio="xMidYMid slice"
          />
        </G>
      );
    }, [dragItem, dragPosition, canvasLayout, pan, scale]);

    // 为每个房间创建独立的手势处理器
    // 逻辑：短按选中，移动超过阈值时拖动房间，快速滑动时滑动画布
    const roomTouchOverlays = useMemo(() => {
      return placedRooms.map((room) => {
        // 如果当前房间正在被拖拽，不渲染触摸层
        if (dragItem?.type === 'existing' && dragItem.instanceId === room.instanceId) {
          return null;
        }

        const module = moduleMap.get(room.moduleId);
        if (!module) return null;

        // 检查房间是否已选中
        const isSelected = selectedRoomId === room.instanceId;

        // 为每个房间创建独立的手势处理器
        // 使用 Tap 手势处理点击选中，Pan 手势处理拖动
        // Tap 手势：最大持续时间 200ms，最大移动距离 10px（超过这个距离就不算点击）
        // 如果房间已选中，不触发 Tap（避免点击已选中的房间时取消选中）
        const roomTapGesture = Gesture.Tap()
          .maxDuration(200)
          .maxDistance(10)
          .enabled(!isSelected) // 已选中的房间不触发 Tap
          .onEnd(() => {
            'worklet';
            // 点击房间，选中它（只有在没有拖动的情况下才触发）
            if (!isDraggingRoom.value) {
              runOnJS(onRoomSelect)(room.instanceId);
            }
          });

        const roomPanGesture = Gesture.Pan()
          .onStart((event) => {
            'worklet';
            // 记录触摸开始时间和位置
            roomDragStartTime.value = Date.now();
            roomDragStartPos.value = { x: event.x, y: event.y };
            isDraggingRoom.value = false;
            
            // 如果房间已选中，立即开始拖动准备（降低阈值）
            if (isSelected) {
              isDraggingRoom.value = true;
              const screenX = event.absoluteX || event.x + canvasLayout.x;
              const screenY = event.absoluteY || event.y + canvasLayout.y;
              runOnJS(onRoomDragStart)(room, module, screenX, screenY);
            }
          })
          .onUpdate((event) => {
            'worklet';
            // 如果已经在拖动，更新拖动位置
            if (isDraggingRoom.value) {
              const screenX = event.absoluteX || event.x + canvasLayout.x;
              const screenY = event.absoluteY || event.y + canvasLayout.y;
              if (onRoomDragMove) {
                runOnJS(onRoomDragMove)(screenX, screenY);
              }
              return;
            }

            // 计算移动距离
            const deltaX = Math.abs(event.translationX);
            const deltaY = Math.abs(event.translationY);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // 拖动阈值：已选中的房间阈值更低（3px），未选中的房间需要 8px
            const DRAG_THRESHOLD = isSelected ? 3 : 8;

            if (distance > DRAG_THRESHOLD) {
              // 触发拖动房间
              isDraggingRoom.value = true;
              const screenX = event.absoluteX || event.x + canvasLayout.x;
              const screenY = event.absoluteY || event.y + canvasLayout.y;
              runOnJS(onRoomDragStart)(room, module, screenX, screenY);
              
              if (onRoomDragMove) {
                runOnJS(onRoomDragMove)(screenX, screenY);
              }
            }
          })
          .onEnd((event) => {
            'worklet';
            // 如果正在拖动这个房间，结束拖动
            if (isDraggingRoom.value) {
              isDraggingRoom.value = false;
              const screenX = event.absoluteX || event.x + canvasLayout.x;
              const screenY = event.absoluteY || event.y + canvasLayout.y;
              if (onRoomDragEnd) {
                runOnJS(onRoomDragEnd)(screenX, screenY);
              }
            }
          })
          .manualActivation(true)
          .onTouchesDown((event, state) => {
            'worklet';
            // 记录触摸开始位置
            roomDragStartTime.value = Date.now();
            roomDragStartPos.value = { x: event.allTouches[0].x, y: event.allTouches[0].y };
            isDraggingRoom.value = false;
            
            // 如果房间已选中，立即激活手势（可以直接拖动）
            if (isSelected) {
              state.activate();
            } else {
              // 未选中的房间，先激活，等待移动判断
              state.activate();
            }
          })
          .onTouchesMove((event, state) => {
            'worklet';
            // 如果已经在拖动，保持激活
            if (isDraggingRoom.value) {
              state.activate();
              return;
            }

            // 如果房间已选中，立即激活（可以直接拖动）
            if (isSelected) {
              state.activate();
              return;
            }

            // 计算移动距离
            const touch = event.allTouches[0];
            const deltaX = Math.abs(touch.x - roomDragStartPos.value.x);
            const deltaY = Math.abs(touch.y - roomDragStartPos.value.y);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // 拖动阈值：已选中的房间阈值更低（3px），未选中的房间需要 8px
            const DRAG_THRESHOLD = isSelected ? 3 : 8;

            if (distance > DRAG_THRESHOLD) {
              state.activate();
            } else {
              // 移动距离小，不激活房间拖动手势，让 Tap 手势处理（点击选中）
              state.fail();
            }
          });

        // 组合 Tap 和 Pan 手势：使用 Exclusive 让它们互斥
        // 如果移动距离小（点击），Tap 手势触发（选中）
        // 如果移动距离大（拖动），Pan 手势触发（拖动）
        const roomGesture = Gesture.Exclusive(roomTapGesture, roomPanGesture);

        return (
          <GestureDetector key={`gesture-${room.instanceId}`} gesture={roomGesture}>
            <Animated.View
              style={{
                position: 'absolute',
                left: room.x,
                top: room.y,
                width: module.width,
                height: module.height,
                backgroundColor: 'transparent',
              }}
              pointerEvents="box-only"
            />
          </GestureDetector>
        );
      });
    }, [placedRooms, dragItem, moduleMap, onRoomDragStart, onRoomDragMove, onRoomDragEnd, canvasLayout]);

    return (
      <View style={styles.container} ref={canvasRef}>
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.canvas, animatedStyle]}>
            <Svg width={SCREEN_WIDTH * 2} height={SCREEN_HEIGHT * 2}>
              {renderGrid()}
              {renderedRooms}
              {renderedDragGhost}
            </Svg>
          </Animated.View>
        </GestureDetector>

        {/* 房间手势覆盖层 */}
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} pointerEvents="box-none">
          {roomTouchOverlays}
        </Animated.View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
});

export default Canvas;

