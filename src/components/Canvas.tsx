/**
 * Canvas 组件
 * 画布主区域：负责放置与渲染房间模块，并处理平移 / 缩放 / 拖拽中的「幽灵」预览
 * 实现方式参考 home/Demo 的 house Canvas，但适配当前项目类型与路径
 */

import React, { useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Svg, { G, Rect, Image as SvgImage, Circle, Defs, Pattern } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { RoomModule, PlacedRoom, GRID_SIZE } from '@/types';
import { ICONS } from '@/components/icons';
import { WORLD_SIZE } from '@/config/canvas';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// 点阵背景范围（半径），用于让背景在平移/缩放时覆盖足够大区域
// 与 WORLD_SIZE 保持一致：世界坐标范围为 [-WORLD_HALF, WORLD_HALF]
const GRID_BG_SIZE = WORLD_SIZE;
const GRID_BG_HALF = WORLD_SIZE / 2;

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
    // 标记本次触摸是否落在房间上，用于画布 tap 不误清选中
    const touchStartedOnRoom = useSharedValue(false);

    // props 变化时同步到共享值
    React.useEffect(() => {
      scaleValue.value = scale;
      panX.value = pan.x;
      panY.value = pan.y;
    }, [scale, pan.x, pan.y]);

    // 监听选中状态变化，打印每个房间的 isSelected
    React.useEffect(() => {
      console.log('[Canvas] selectedRoomId 变化:', selectedRoomId);
      placedRooms.forEach((room) => {
        const isSelected = selectedRoomId === room.instanceId;
        console.log(`[Canvas] 房间 ${room.instanceId} (${room.moduleId}) isSelected:`, isSelected);
      });
    }, [selectedRoomId, placedRooms]);

    // 画布平移手势（拖动画布）
    // 使用 manualActivation 和条件判断，确保只在触摸空白处时激活
    const canvasPanGesture = Gesture.Pan()
      .manualActivation(true)
      .onTouchesDown((event, state) => {
        'worklet';
        // 如果触摸落在房间上，不激活画布平移
        if (touchStartedOnRoom.value) {
          console.log('[Canvas] 画布平移 onTouchesDown: touchStartedOnRoom----------------:', touchStartedOnRoom.value);
          state.fail();
          return;
        }
        // 如果正在拖动房间，不激活画布平移
        if (isDraggingRoom.value) {
          console.log('[Canvas] 画布平移 onTouchesDown: isDraggingRoom----------------:', isDraggingRoom.value);
          state.fail();
          return;
        }
        // 触摸在空白处，激活画布平移
        state.activate();
      })
      .onTouchesMove((event, state) => {
        'worklet';
        // 如果触摸落在房间上或正在拖动房间，保持失败状态
        if (touchStartedOnRoom.value || isDraggingRoom.value) {
          state.fail();
          return;
        }
        state.activate();
      })
      .onStart(() => {
        'worklet';
        console.log('[Canvas] 画布平移开始');
        savedPanX.value = panX.value;
        savedPanY.value = panY.value;
      })
      .onUpdate((event) => {
        'worklet';
        // 双重检查：如果正在拖动房间，不更新画布位置
        if (isDraggingRoom.value || touchStartedOnRoom.value) {
          return;
        }
        panX.value = savedPanX.value + event.translationX;
        panY.value = savedPanY.value + event.translationY;
      })
      .onEnd(() => {
        'worklet';
        if (!isDraggingRoom.value && !touchStartedOnRoom.value) {
          console.log('[Canvas] 画布平移结束');
          runOnJS(onPanChange)({ x: panX.value, y: panY.value });
        }
      });

    // 画布点击手势（点击空白处清除选中）
    const canvasTapGesture = Gesture.Tap()
      .onTouchesDown(() => {
        'worklet';
        // 如果触摸落在房间上，标记但不阻止（Tap 手势不支持 manualActivation）
        // 在 onEnd 中会检查 touchStartedOnRoom
      })
      .onEnd(() => {
        'worklet';
        // 只有触摸未落在房间上时才清除选中
        if (!touchStartedOnRoom.value) {
          console.log('[Canvas] 画布点击：清除选中');
          isDraggingRoom.value = false;
          runOnJS(onCanvasPress)();
        }
        touchStartedOnRoom.value = false;
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

    // 组合画布手势：平移、缩放、点击
    const canvasGestures = Gesture.Simultaneous(
      canvasPanGesture,
      pinchGesture,
      canvasTapGesture,
    );

    // 画布整体 transform
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        // 注意顺序：先 scale 再 translate，使坐标换算可用 world = (canvas - pan) / scale
        // 且平移不随缩放被额外放大，保证缩放后拖拽仍能“触点即所见”
        { scale: scaleValue.value },
        { translateX: panX.value },
        { translateY: panY.value },
      ],
    }));

    // 渲染点阵网格：Defs 必须在 <Svg> 直接子节点里，几何体在 worldGroup 里
    const renderGridDefs = () => (
      <Defs>
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
      </Defs>
    );

    // 已放置房间渲染
    const renderedRooms = useMemo(() => {
      return placedRooms.map((room) => {
        // 当前正在拖拽的房间由 drag ghost 渲染，这里跳过
        if (dragItem?.type === 'existing' && dragItem.instanceId === room.instanceId) {
          return null;
        }

        const module = moduleMap.get(room.moduleId);
        if (!module) return null;

        const rx = Number(room.x);
        const ry = Number(room.y);
        const mw = Number(module.width);
        const mh = Number(module.height);
        if (!Number.isFinite(rx) || !Number.isFinite(ry) || !Number.isFinite(mw) || !Number.isFinite(mh) || mw <= 0 || mh <= 0) {
          return null;
        }

        const isSelected = selectedRoomId === room.instanceId;

        return (
          <G key={room.instanceId} transform={`translate(${rx}, ${ry})`}>
            <SvgImage
              href={module.image}
              width={mw}
              height={mh}
              preserveAspectRatio="xMidYMid slice"
            />
            {/* 选中边框 */}
            {isSelected && (
              <Rect
                x={-2}
                y={-2}
                width={mw + 4}
                height={mh + 4}
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

    // 拖拽中的幽灵图像（屏幕坐标覆盖层）
    // 直接用触点位置 + offset*scale 计算 left/top，避免缩放/平移后 SVG 世界坐标换算误差
    const dragGhostOverlay = useMemo(() => {
      if (!dragItem || !dragPosition) return null;

      const dx = Number(dragPosition.x);
      const dy = Number(dragPosition.y);
      const lx = Number(canvasLayout.x);
      const ly = Number(canvasLayout.y);
      const s = Number(scale);
      const ox = Number(dragItem.offsetX);
      const oy = Number(dragItem.offsetY);
      const mw = Number(dragItem.module.width);
      const mh = Number(dragItem.module.height);

      const image = dragItem.module.image;
      const hasImage = image != null && (typeof image === 'string' || typeof image === 'number');

      if (
        !hasImage ||
        !Number.isFinite(dx) ||
        !Number.isFinite(dy) ||
        !Number.isFinite(lx) ||
        !Number.isFinite(ly) ||
        !Number.isFinite(s) ||
        s === 0 ||
        !Number.isFinite(ox) ||
        !Number.isFinite(oy) ||
        !Number.isFinite(mw) ||
        !Number.isFinite(mh) ||
        mw <= 0 ||
        mh <= 0
      ) {
        return null;
      }

      const localX = dx - lx;
      const localY = dy - ly;

      const width = mw * s;
      const height = mh * s;
      const left = localX - ox * s;
      const top = localY - oy * s;

      const source = typeof image === 'string' ? { uri: image } : image;

      return (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Image
            source={source as any}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              opacity: 0.7,
            }}
            resizeMode="cover"
          />
        </View>
      );
    }, [canvasLayout.x, canvasLayout.y, dragItem, dragPosition, scale]);

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

        // 房间点击手势（点击图片选中）
        const roomTapGesture = Gesture.Tap()
          .maxDuration(200)
          .maxDistance(10)
          .enabled(!isSelected) // 已选中的房间不触发 Tap
          .onTouchesDown(() => {
            'worklet';
            // 标记触摸落在房间上，阻止画布手势激活
            touchStartedOnRoom.value = true;
          })
          .onEnd(() => {
            'worklet';
            console.log('[Room] 房间点击：选中房间', room.instanceId);
            // 点击房间，选中它（只有在没有拖动的情况下才触发）
            if (!isDraggingRoom.value) {
              runOnJS(onRoomSelect)(room.instanceId);
            }
            touchStartedOnRoom.value = false;
          });

        // 房间拖动手势（拖动图片）
        const roomPanGesture = Gesture.Pan()
          .manualActivation(true)
          .onTouchesDown((event, state) => {
            'worklet';
            console.log('[Room] 房间拖动手势 onTouchesDown，isSelected:', isSelected);
            // 标记触摸落在房间上，阻止画布手势激活
            touchStartedOnRoom.value = true;
            roomDragStartTime.value = Date.now();
            roomDragStartPos.value = { x: event.allTouches[0].x, y: event.allTouches[0].y };
            isDraggingRoom.value = false;
            
            // 已选中时立即标记为拖动并激活，可以直接拖动
            if (isSelected) {
              isDraggingRoom.value = true;
              state.activate();
            } else {
              // 未选中时先激活，等待移动距离判断
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
              // 移动距离超过阈值，激活拖动
              state.activate();
            } else {
              // 移动距离小，不激活房间拖动手势，让 Tap 手势处理（点击选中）
              state.fail();
            }
          })
          .onStart((event) => {
            'worklet';
            console.log('[Room] 房间拖动开始，isDraggingRoom:', isDraggingRoom.value);
            roomDragStartTime.value = Date.now();
            roomDragStartPos.value = { x: event.x, y: event.y };
            // 已选中时 isDraggingRoom 已在 onTouchesDown 设为 true，这里直接发起拖动
            if (isDraggingRoom.value) {
              // 缩放时 event.x/y 可能是变换后的局部坐标，易造成拖拽偏移；优先使用屏幕坐标
              const ax = event.absoluteX;
              const ay = event.absoluteY;
              const screenX = Number.isFinite(ax) ? ax : event.x + canvasLayout.x;
              const screenY = Number.isFinite(ay) ? ay : event.y + canvasLayout.y;
              runOnJS(onRoomDragStart)(room, module, screenX, screenY);
            }
          })
          .onUpdate((event) => {
            'worklet';
            // 如果已经在拖动，更新拖动位置
            if (isDraggingRoom.value) {
              const ax = event.absoluteX;
              const ay = event.absoluteY;
              const screenX = Number.isFinite(ax) ? ax : event.x + canvasLayout.x;
              const screenY = Number.isFinite(ay) ? ay : event.y + canvasLayout.y;
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
              const ax = event.absoluteX;
              const ay = event.absoluteY;
              const screenX = Number.isFinite(ax) ? ax : event.x + canvasLayout.x;
              const screenY = Number.isFinite(ay) ? ay : event.y + canvasLayout.y;
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
              console.log('[Room] 房间拖动结束');
              isDraggingRoom.value = false;
              touchStartedOnRoom.value = false; // 重置标记
              const ax = event.absoluteX;
              const ay = event.absoluteY;
              const screenX = Number.isFinite(ax) ? ax : event.x + canvasLayout.x;
              const screenY = Number.isFinite(ay) ? ay : event.y + canvasLayout.y;
              if (onRoomDragEnd) {
                runOnJS(onRoomDragEnd)(screenX, screenY);
              }
            } else {
              // 如果没有拖动，重置标记
              touchStartedOnRoom.value = false;
            }
          });

        // 组合 Tap 和 Pan 手势：使用 Exclusive 让它们互斥
        // 如果移动距离小（点击），Tap 手势触发（选中）
        // 如果移动距离大（拖动），Pan 手势触发（拖动）
        const roomGesture = Gesture.Exclusive(roomTapGesture, roomPanGesture);

        const styleLeft = Number.isFinite(Number(room.x)) ? Number(room.x) : 0;
        const styleTop = Number.isFinite(Number(room.y)) ? Number(room.y) : 0;
        const styleW = Number.isFinite(Number(module.width)) && module.width > 0 ? module.width : 1;
        const styleH = Number.isFinite(Number(module.height)) && module.height > 0 ? module.height : 1;

        return (
          <GestureDetector key={`gesture-${room.instanceId}`} gesture={roomGesture}>
            <Animated.View
              style={{
                position: 'absolute',
                // world 坐标系原点在网格中心，需要整体平移到 SVG 中心
                left: styleLeft + GRID_BG_HALF,
                top: styleTop + GRID_BG_HALF,
                width: styleW,
                height: styleH,
                backgroundColor: 'transparent',
              }}
              pointerEvents="box-only"
            />
          </GestureDetector>
        );
      });
    }, [placedRooms, dragItem, moduleMap, selectedRoomId, onRoomSelect, onRoomDragStart, onRoomDragMove, onRoomDragEnd, canvasLayout]);

    // 将画布平移/缩放/点击与房间覆盖层包在同一 GestureDetector 内，
    // 这样触摸空白处时命中画布子节点，平移手势能正确触发
    return (
      <View style={styles.container} ref={canvasRef}>
        <GestureDetector gesture={canvasGestures}>
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.canvas, animatedStyle]} pointerEvents="box-none">
              <Svg width={GRID_BG_SIZE} height={GRID_BG_SIZE}>
                {renderGridDefs()}
                {/* world 坐标系 (0,0) 放在 SVG 视口中心 */}
                <G transform={`translate(${GRID_BG_HALF}, ${GRID_BG_HALF})`}>
                  <Rect
                    x={-GRID_BG_HALF}
                    y={-GRID_BG_HALF}
                    width={GRID_BG_SIZE}
                    height={GRID_BG_SIZE}
                    fill="url(#grid)"
                  />
                  {renderedRooms}
                </G>
              </Svg>
            </Animated.View>

            {dragGhostOverlay}

            {/* 房间手势覆盖层：仅房间区域可点，空白处触摸会落到下方画布从而触发平移 */}
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} pointerEvents="box-none">
              {roomTouchOverlays}
            </Animated.View>
          </View>
        </GestureDetector>
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

