import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  Dimensions,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { colors } from '@/styles/colors';
import { ROOM_MODULES } from '@/data/material_library';
import { PlacedRoom, RoomModule } from '@/types';
import { ICONS } from '@/components/icons';
import { MaterialIcons } from '@expo/vector-icons';
import GridBackground from '@/components/GridBackground';
import { WORLD_SIZE, MAX_SCALE, MIN_SCALE } from '@/config/canvas';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_SIZE = 20;
const SNAP_THRESHOLD = 15;

// Helper function to get image source
const getImageSource = (image: string | number): ImageSourcePropType => {
  if (typeof image === 'number') {
    return image as ImageSourcePropType; // require() result
  }
  return { uri: image as string }; // URI string
};

const CATEGORIES = [
  { id: 'living', label: 'Living', icon: ICONS.living, selectIcon: ICONS.livingSelect },
  { id: 'kitchen', label: 'Kitchen', icon: ICONS.kitchen, selectIcon: ICONS.kitchenSelect },
  { id: 'bedroom', label: 'Bedroom', icon: ICONS.bedroom, selectIcon: ICONS.bedroomSelect },
  { id: 'bath', label: 'Bath', icon: ICONS.bath, selectIcon: ICONS.bathSelect },
  { id: 'dining', label: 'Dining', icon: ICONS.dining, selectIcon: ICONS.diningSelect },
  { id: 'office', label: 'Office', icon: ICONS.office, selectIcon: ICONS.officeSelect },
  { id: 'kids', label: 'Kids', icon: ICONS.kids, selectIcon: ICONS.kidsSelect },
  { id: 'study', label: 'Study', icon: ICONS.study, selectIcon: ICONS.studySelect },
  { id: 'balcony', label: 'Balcony', icon: ICONS.balcony, selectIcon: ICONS.balconySelect },
  { id: 'entrance', label: 'Entrance', icon: ICONS.entrance, selectIcon: ICONS.entranceSelect },
  { id: 'corridor', label: 'Corridor', icon: ICONS.corridor, selectIcon: ICONS.corridorSelect },
];

export default function MainPage() {
  const router = useRouter();
  const canvasRef = useRef<View>(null);
  const containerRef = useRef<View>(null);
  const containerLayout = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
  const canvasContainerLayout = useSharedValue({ x: 0, y: 0, width: 0, height: 0 });
  const isInitialized = useSharedValue(false);
  
  // 辅助函数：数值钳制到 [min, max] 区间
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max);
  
  /**
   * 画布缩放核心算法：
   * - 给定一个“世界坐标锚点”（anchorWorldX/Y），希望它始终落在屏幕中心
   * - 计算在目标缩放值 targetScale 下，对应的平移量 translateX/translateY
   * - 再结合画布边界做钳制，保证不会露出空白区域
   */
  const zoomAtAnchorWorld = (anchorWorldX: number, anchorWorldY: number, targetScale: number) => {
    'worklet';
    // 1. 强制限制缩放范围（结合 Metal 纹理尺寸上限）
    const clampedScale = clamp(targetScale, MIN_SCALE, MAX_SCALE);
    
    const containerWidth = canvasContainerLayout.value.width || SCREEN_WIDTH;
    const containerHeight = canvasContainerLayout.value.height || SCREEN_HEIGHT;
    
    // 2. 视图中心点在屏幕坐标系中的位置
    const viewCenterX = containerWidth / 2;
    const viewCenterY = containerHeight / 2;

    // 3. 标准变换公式：screen = world * scale + translate
    //    反推 translate，使得给定世界点 anchorWorld 正好落在屏幕中心
    let newTranslateX = viewCenterX - anchorWorldX * clampedScale;
    let newTranslateY = viewCenterY - anchorWorldY * clampedScale;
    
    // 4. 按目标缩放计算画布在屏幕中的宽高
    const scaledWidth = WORLD_SIZE * clampedScale;
    const scaledHeight = WORLD_SIZE * clampedScale;
    
    // 5. 计算横向平移可用范围：
    //    - 画布大于视图：允许在 [-(scaledWidth - containerWidth), 0] 区间内移动
    //    - 画布小于视图：只能居中显示
    const minX = scaledWidth > containerWidth
      ? -(scaledWidth - containerWidth)
      : (containerWidth - scaledWidth) / 2;
    const minY = scaledHeight > containerHeight
      ? -(scaledHeight - containerHeight)
      : (containerHeight - scaledHeight) / 2;
    
    const maxX = scaledWidth > containerWidth ? 0 : minX;
    const maxY = scaledHeight > containerHeight ? 0 : minY;
    
    // 6. 将刚才算出的平移量钳制到 [min, max]，保证画布不露白
    newTranslateX = clamp(newTranslateX, minX, maxX);
    newTranslateY = clamp(newTranslateY, minY, maxY);
    
    // 7. 回写 SharedValue，并同步到 React state（用于 HUD 等展示）
    scaleValue.value = clampedScale;
    translateX.value = newTranslateX;
    translateY.value = newTranslateY;
    
    runOnJS(setScale)(clampedScale);
    runOnJS(setPan)({
      x: newTranslateX,
      y: newTranslateY,
    });
  };

  // 以“当前视图中心世界坐标”为锚点缩放（给按钮点击等离散缩放调用）
  const zoomAtViewCenter = (targetScale: number) => {
    'worklet';
    const containerWidth = canvasContainerLayout.value.width || SCREEN_WIDTH;
    const containerHeight = canvasContainerLayout.value.height || SCREEN_HEIGHT;
    const viewCenterX = containerWidth / 2;
    const viewCenterY = containerHeight / 2;
    const anchorWorldX = (viewCenterX - translateX.value) / scaleValue.value;
    const anchorWorldY = (viewCenterY - translateY.value) / scaleValue.value;
    zoomAtAnchorWorld(anchorWorldX, anchorWorldY, targetScale);
  };

  // State
  const [history, setHistory] = useState<PlacedRoom[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const placedRooms = history[historyIndex];

  // 使用 Reanimated 的 SharedValue 替代 useState
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const dragItemRef = useSharedValue<typeof dragItem>(null);
  const deleteModeRef = useSharedValue(false);

  // 保留 state 用于非动画值
  const [isPanning, setIsPanning] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('living');

  // 为了兼容现有代码，保留 pan 和 scale 的计算值
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Drag state
  const [dragItem, setDragItem] = useState<{
    type: 'existing' | 'new';
    module: RoomModule;
    instanceId?: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  const [hudCenterWorld, setHudCenterWorld] = useState({ x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 });
  const [hudScale, setHudScale] = useState(1);

  // 同步 dragItem 到 SharedValue
  React.useEffect(() => {
    dragItemRef.value = dragItem;
  }, [dragItem]);

  // 同步 deleteMode 到 SharedValue
  React.useEffect(() => {
    deleteModeRef.value = deleteMode;
  }, [deleteMode]);

  const activeModules = useMemo(() => {
    return ROOM_MODULES.filter((m) => m.type === selectedCategory);
  }, [selectedCategory]);

  // Actions
  const addToHistory = (newRooms: PlacedRoom[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newRooms);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const step = 0.1;
    const currentScale = scaleValue.value;
    const nextScale = direction === 'in'
      ? Math.min(currentScale + step, MAX_SCALE)
      : Math.max(currentScale - step, MIN_SCALE);
    
    zoomAtViewCenter(nextScale);
  };

  const handleNewPlan = () => {
    setHistory([[]]);
    setHistoryIndex(0);
    scaleValue.value = 1;
    setScale(1);
    
    // 重置：让画布中心回到视图中心，缩放恢复为 1
    const containerWidth = canvasContainerLayout.value.width || SCREEN_WIDTH;
    const containerHeight = canvasContainerLayout.value.height || SCREEN_HEIGHT;
    const canvasCenterX = WORLD_SIZE / 2;
    const canvasCenterY = WORLD_SIZE / 2;
    const viewCenterX = containerWidth / 2;
    const viewCenterY = containerHeight / 2;
    
    const initialTranslateX = viewCenterX - canvasCenterX * 1;
    const initialTranslateY = viewCenterY - canvasCenterY * 1;
    
    translateX.value = initialTranslateX;
    translateY.value = initialTranslateY;
    setPan({ x: initialTranslateX, y: initialTranslateY });
  };

  // 画布平移与缩放的内部状态（用于手势计算）
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startTranslateX = useSharedValue(0);
  const startTranslateY = useSharedValue(0);
  // pinch 开始时记录下来的“视图中心锚点世界坐标”（保证同一次 pinch 中锚点不漂移）
  const pinchAnchorWorldX = useSharedValue(WORLD_SIZE / 2);
  const pinchAnchorWorldY = useSharedValue(WORLD_SIZE / 2);

  const panGesture = Gesture.Pan()
    .minDistance(5) // 至少移动 5 像素才认为在拖动画布
    .maxPointers(1) // 只允许单指参与画布平移
    .onStart(() => {
      // 记录本次手势开始时的平移起点，用于增量计算
      startX.value = translateX.value;
      startY.value = translateY.value;
      runOnJS(setIsPanning)(true);
    })
    .onUpdate((e) => {
      // 根据当前缩放和画布尺寸，限制平移范围（避免把画布拖出视图）
      // 画布世界尺寸：4096x4096，世界原点在左上角 (0,0)
      const scale = scaleValue.value;
      const scaledWidth = WORLD_SIZE * scale;
      const scaledHeight = WORLD_SIZE * scale;

      // 本次手势对应的目标平移值（未做边界限制前）
      let nextX = startX.value + e.translationX;
      let nextY = startY.value + e.translationY;

      // 横向边界限制：
      // - 画布宽度大于屏幕：允许在 [-(scaledWidth - SCREEN_WIDTH), 0] 区间内移动
      // - 画布宽度小于屏幕：强制居中，禁止平移
      if (scaledWidth > SCREEN_WIDTH) {
        const minX = -(scaledWidth - SCREEN_WIDTH);
        const maxX = 0;
        if (nextX < minX) nextX = minX;
        if (nextX > maxX) nextX = maxX;
      } else {
        // 画布比屏幕小，居中显示，不允许平移
        nextX = 0;
      }

      if (scaledHeight > SCREEN_HEIGHT) {
        const minY = -(scaledHeight - SCREEN_HEIGHT);
        const maxY = 0;
        if (nextY < minY) nextY = minY;
        if (nextY > maxY) nextY = maxY;
      } else {
        // 画布比屏幕小，居中显示，不允许平移
        nextY = 0;
      }

      translateX.value = nextX;
      translateY.value = nextY;
      runOnJS(setPan)({
        x: nextX,
        y: nextY,
      });
    })
    .onEnd(() => {
      runOnJS(setIsPanning)(false);
    });

  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      'worklet';
      startScale.value = scaleValue.value;
      // pinch 开始时只算一次：当前“视图中心”的世界坐标
      // 整个 pinch 过程中都以这个世界点为锚点，保证缩放前后该点世界坐标不变（物理可行范围内）
      const containerWidth = canvasContainerLayout.value.width || SCREEN_WIDTH;
      const containerHeight = canvasContainerLayout.value.height || SCREEN_HEIGHT;
      const viewCenterX = containerWidth / 2;
      const viewCenterY = containerHeight / 2;
      pinchAnchorWorldX.value = (viewCenterX - translateX.value) / scaleValue.value;
      pinchAnchorWorldY.value = (viewCenterY - translateY.value) / scaleValue.value;
    })
    .onUpdate((e) => {
      'worklet';
      const nextScale = clamp(
        startScale.value * e.scale,
        MIN_SCALE,
        MAX_SCALE
      );
      zoomAtAnchorWorld(pinchAnchorWorldX.value, pinchAnchorWorldY.value, nextScale);
    });

  // 点击手势 - 打印位置信息
  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      // 获取点击位置在屏幕上的坐标（相对于 canvasContainer）
      const screenX = e.x;
      const screenY = e.y;
      
      // 将屏幕坐标转换为世界坐标
      // 公式：world = (screen - translate) / scale
      const worldX = (screenX - translateX.value) / scaleValue.value;
      const worldY = (screenY - translateY.value) / scaleValue.value;
      
      // 打印位置信息
      console.log('=== 画布点击位置信息 ===');
      console.log('屏幕坐标:', { x: screenX.toFixed(2), y: screenY.toFixed(2) });
      console.log('世界坐标:', { x: worldX.toFixed(2), y: worldY.toFixed(2) });
      console.log('当前缩放:', scaleValue.value.toFixed(2));
      console.log('当前平移:', { x: translateX.value.toFixed(2), y: translateY.value.toFixed(2) });
      console.log('画布尺寸:', { width: WORLD_SIZE, height: WORLD_SIZE });
      console.log('========================');
    });

  const canvasGesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    tapGesture
  );

  // JavaScript 线程处理房间拖拽开始
  const handleRoomDragStartJS = (
    x: number,
    y: number,
    instanceId: string,
    roomX: number,
    roomY: number,
    moduleId: string
  ) => {
    if (!canvasRef.current) return;

    const module = ROOM_MODULES.find((m) => m.id === moduleId);

    console.log('module', module);

    if (!module) return;

    canvasRef.current.measure((fx, fy, width, height, pageX, pageY) => {
      const worldX = (x - pageX - translateX.value) / scaleValue.value;
      const worldY = (y - pageY - translateY.value) / scaleValue.value;
      const dragItemData = {
        type: 'existing' as const,
        module,
        instanceId,
        offsetX: worldX - roomX,
        offsetY: worldY - roomY,
      };
      dragItemRef.value = dragItemData;
      setDragItem(dragItemData);
      setDragPosition({ x, y });
    });
  };

  // 处理删除房间
  const handleDeleteRoom = (instanceId: string) => {
    const newRooms = placedRooms.filter((r) => r.instanceId !== instanceId);
    addToHistory(newRooms);
  };

  // 处理模块拖拽开始（x/y 为屏幕绝对坐标 absoluteX/absoluteY）
  const handleModuleDragStartJS = (x: number, y: number, moduleId: string) => {
    const module = ROOM_MODULES.find((m) => m.id === moduleId);
    if (!module) return;

    // 计算图片中心点相对于触摸点的偏移（世界坐标）
    // 使用世界尺寸，避免缩放造成坐标换算错误
    const offsetX = module.width / 2;
    const offsetY = module.height / 2;

    const dragItemData = {
      type: 'new' as const,
      module,
      offsetX, // 屏幕坐标中的偏移
      offsetY, // 屏幕坐标中的偏移
    };
    dragItemRef.value = dragItemData;
    setDragItem(dragItemData);
    setDragPosition({ x, y });
  };

  // 创建模块拖拽手势（长按后拖拽）
  const createModuleDragGesture = (moduleId: string) => {
    const LONG_PRESS_DURATION = 300; // 长按时间（毫秒）
    const MIN_DRAG_DISTANCE = 10; // 最小拖拽距离

    // 拖拽手势 - 使用 activateAfterLongPress 确保只在长按后激活
    // 这样如果用户快速滑动 ScrollView，拖拽手势不会激活
    const dragGesture = Gesture.Pan()
      .minDistance(MIN_DRAG_DISTANCE)
      .activateAfterLongPress(LONG_PRESS_DURATION)
      .onStart((e) => {
        'worklet';
        // 拖拽激活时（长按后），开始拖拽
        // 使用 absoluteX/absoluteY，确保为屏幕坐标
        runOnJS(handleModuleDragStartJS)(e.absoluteX, e.absoluteY, moduleId);
      })
      .onUpdate((e) => {
        'worklet';
        if (dragItemRef.value) {
          runOnJS(setDragPosition)({ x: e.absoluteX, y: e.absoluteY });
        }
      })
      .onEnd((e) => {
        'worklet';
        if (dragItemRef.value) {
          runOnJS(handleDragEnd)({ x: e.absoluteX, y: e.absoluteY });
        }
      });

    return dragGesture;
  };

  // 房间拖拽手势工厂：为每个房间实例创建一套“长按进入拖拽”的手势组合
  const createRoomDragGesture = (room: PlacedRoom, module: RoomModule) => {
    // 长按后再拖拽房间，避免与画布平移冲突
    const LONG_PRESS_DURATION = 300;
    const MIN_DRAG_DISTANCE = 5;

    // 长按开始：判断是否是删除模式，或者进入拖拽准备阶段
    const longPress = Gesture.LongPress()
      .minDuration(LONG_PRESS_DURATION)
      .onStart((e) => {
        'worklet';
        if (deleteModeRef.value) {
          runOnJS(handleDeleteRoom)(room.instanceId);
          return;
        }
        runOnJS(handleRoomDragStartJS)(
          e.absoluteX ?? e.x,
          e.absoluteY ?? e.y,
          room.instanceId,
          room.x,
          room.y,
          module.id
        );
      });

    // 实际拖拽手势：只有在长按成功后才会激活，避免和画布平移冲突
    const pan = Gesture.Pan()
      .minDistance(MIN_DRAG_DISTANCE)
      .activateAfterLongPress(LONG_PRESS_DURATION)
      .onUpdate((e) => {
        'worklet';
        if (dragItemRef.value) {
          runOnJS(setDragPosition)({ x: e.absoluteX ?? e.x, y: e.absoluteY ?? e.y });
        }
      })
      .onEnd((e) => {
        'worklet';
        if (dragItemRef.value) {
          runOnJS(handleDragEnd)({ x: e.absoluteX ?? e.x, y: e.absoluteY ?? e.y });
        }
      });

    // 将“长按确认拖拽目标”和“拖拽移动”两个手势组合在一起
    return Gesture.Simultaneous(longPress, pan);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // HUD 使用 SharedValue 实时计算“视图中心世界坐标 + 缩放”，避免 JS 层状态延迟
  useAnimatedReaction(
    () => {
      const containerWidth = canvasContainerLayout.value.width || SCREEN_WIDTH;
      const containerHeight = canvasContainerLayout.value.height || SCREEN_HEIGHT;
      const viewCenterX = containerWidth / 2;
      const viewCenterY = containerHeight / 2;
      const s = scaleValue.value;
      const x = (viewCenterX - translateX.value) / s;
      const y = (viewCenterY - translateY.value) / s;
      return { x, y, s };
    },
    (next) => {
      runOnJS(setHudCenterWorld)({ x: next.x, y: next.y });
      runOnJS(setHudScale)(next.s);
    }
  );

  // 拖拽位置 SharedValue：用于在 Reanimated UI 线程中驱动拖拽预览
  const dragPositionX = useSharedValue(0);
  const dragPositionY = useSharedValue(0);

  // 将 React state 中的 dragPosition 同步到 SharedValue，供动画样式使用
  React.useEffect(() => {
    dragPositionX.value = dragPosition.x;
    dragPositionY.value = dragPosition.y;
  }, [dragPosition]);

  // 拖拽时悬浮预览“幽灵卡片”的样式（用屏幕坐标 + 当前缩放计算）
  const dragGhostAnimatedStyle = useAnimatedStyle(() => {
    if (!dragItemRef.value) {
      return { opacity: 0, left: 0, top: 0, width: 0, height: 0 };
    }
    const item = dragItemRef.value;
    console.log('item', item);
    // offsetX / offsetY 为世界坐标，在屏幕坐标中需要乘以当前缩放
    return {
      opacity: 1,
      left: dragPositionX.value - containerLayout.value.x - (item.offsetX || 0) * scaleValue.value,
      top: dragPositionY.value - containerLayout.value.y - (item.offsetY || 0) * scaleValue.value,
      width: (item.module.width || 0) * scaleValue.value,
      height: (item.module.height || 0) * scaleValue.value,
    };
  });

  // Calculate snap position
  const calculateSnapPosition = (
    rawX: number,
    rawY: number,
    dragW: number,
    dragH: number,
    excludeId?: string
  ) => {
    let finalX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
    let finalY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;

    const stationaryRooms = excludeId
      ? placedRooms.filter((r) => r.instanceId !== excludeId)
      : placedRooms;

    let snappedX = false;
    let snappedY = false;

    for (const room of stationaryRooms) {
      const staticModule = ROOM_MODULES.find((m) => m.id === room.moduleId);
      if (!staticModule) continue;

      const staticX = room.x;
      const staticY = room.y;
      const staticW = staticModule.width;
      const staticH = staticModule.height;

      // X-axis snapping
      if (!snappedX) {
        if (Math.abs(rawX - (staticX + staticW)) < SNAP_THRESHOLD) {
          finalX = staticX + staticW;
          snappedX = true;
        } else if (Math.abs(rawX + dragW - staticX) < SNAP_THRESHOLD) {
          finalX = staticX - dragW;
          snappedX = true;
        } else if (Math.abs(rawX - staticX) < SNAP_THRESHOLD) {
          finalX = staticX;
          snappedX = true;
        } else if (Math.abs(rawX + dragW - (staticX + staticW)) < SNAP_THRESHOLD) {
          finalX = staticX + staticW - dragW;
          snappedX = true;
        }
      }

      // Y-axis snapping
      if (!snappedY) {
        if (Math.abs(rawY - (staticY + staticH)) < SNAP_THRESHOLD) {
          finalY = staticY + staticH;
          snappedY = true;
        } else if (Math.abs(rawY + dragH - staticY) < SNAP_THRESHOLD) {
          finalY = staticY - dragH;
          snappedY = true;
        } else if (Math.abs(rawY - staticY) < SNAP_THRESHOLD) {
          finalY = staticY;
          snappedY = true;
        } else if (Math.abs(rawY + dragH - (staticY + staticH)) < SNAP_THRESHOLD) {
          finalY = staticY + staticH - dragH;
          snappedY = true;
        }
      }

      if (snappedX && snappedY) break;
    }

    return { x: finalX, y: finalY };
  };


  // Handle drag end
  const handleDragEnd = (gesture: any) => {
    if (!dragItem || !canvasRef.current) {
      dragItemRef.value = null;
      setDragItem(null);
      return;
    }

    canvasRef.current.measure((x, y, width, height, pageX, pageY) => {
      const worldX = (gesture.x - pageX - translateX.value) / scaleValue.value;
      const worldY = (gesture.y - pageY - translateY.value) / scaleValue.value;

      const rawX = worldX - dragItem.offsetX;
      const rawY = worldY - dragItem.offsetY;

      const { x: finalX, y: finalY } = calculateSnapPosition(
        rawX,
        rawY,
        dragItem.module.width,
        dragItem.module.height,
        dragItem.instanceId
      );

      const isBase =
        dragItem.type === 'existing'
          ? placedRooms.find((r) => r.instanceId === dragItem.instanceId)?.isBase
          : placedRooms.length === 0;

      const newRoom: PlacedRoom = {
        instanceId:
          dragItem.type === 'existing'
            ? dragItem.instanceId!
            : Math.random().toString(36).substr(2, 9),
        moduleId: dragItem.module.id,
        x: finalX,
        y: finalY,
        rotation: 0,
        isBase: !!isBase,
      };

      let newRooms: PlacedRoom[];
      if (dragItem.type === 'existing') {
        newRooms = placedRooms.map((r) =>
          r.instanceId === newRoom.instanceId ? newRoom : r
        );
      } else {
        newRooms = [...placedRooms, newRoom];
      }

      addToHistory(newRooms);
      dragItemRef.value = null;
      setDragItem(null);
    });
  };

  return (
    <View
      ref={containerRef}
      style={styles.container}
      onLayout={(event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        containerLayout.value = { x, y, width, height };
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/history')}
          style={styles.headerButton}
        >
          <Image source={ICONS.history} style={styles.headerIcon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Floor Plan Puzzle</Text>

        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.headerButton}
        >
          <Image source={ICONS.settings} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <GestureDetector gesture={canvasGesture}>
        <View
          ref={canvasRef}
          style={styles.canvasContainer}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            canvasContainerLayout.value = { x, y, width, height };
            setCanvasSize({ width, height });
            
            // 初始化：使视图中心对应画布中心点
            if (!isInitialized.value && width > 0 && height > 0) {
              isInitialized.value = true;
              
              // 视图中心点的屏幕坐标
              const viewCenterX = width / 2;
              const viewCenterY = height / 2;
              
              // 画布中心点的世界坐标
              const canvasCenterX = WORLD_SIZE / 2;
              const canvasCenterY = WORLD_SIZE / 2;
              
              // 计算初始平移值，使画布中心点位于视图中心
              // 公式：viewCenter = canvasCenter * scale + translate
              // 因此：translate = viewCenter - canvasCenter * scale
              const initialTranslateX = viewCenterX - canvasCenterX * scaleValue.value;
              const initialTranslateY = viewCenterY - canvasCenterY * scaleValue.value;
              
              translateX.value = initialTranslateX;
              translateY.value = initialTranslateY;
              
              runOnJS(setPan)({
                x: initialTranslateX,
                y: initialTranslateY,
              });
            }
          }}
        >
          <Animated.View
            style={[
              styles.canvas,
              animatedStyle,
            ]}
          >
            {/* Grid Background - SVG Dot Pattern */}
            <GridBackground />

            {/* Placed Rooms */}
            {placedRooms.map((room) => {
              if (dragItem?.type === 'existing' && dragItem.instanceId === room.instanceId) {
                return null;
              }

              const module = ROOM_MODULES.find((m) => m.id === room.moduleId);
              if (!module) return null;

              const roomDragGesture = createRoomDragGesture(room, module);

              return (
                <GestureDetector key={room.instanceId} gesture={roomDragGesture}>
                  <View
                    style={[
                      styles.room,
                      {
                        left: room.x,
                        top: room.y,
                        width: module.width,
                        height: module.height,
                      },
                      room.isBase && styles.roomBase,
                    ]}
                  >
                    <Image
                      source={getImageSource(module.image)}
                      style={styles.roomImage}
                      resizeMode="cover"
                    />
                    {room.isBase && (
                      <View style={styles.baseIndicator}>
                        <MaterialIcons name="star" size={12} color={colors.white} />
                      </View>
                    )}
                  </View>
                </GestureDetector>
              );
            })}

          </Animated.View>

          {/* 视图中心准星（不跟随画布 transform） */}
          <View pointerEvents="none" style={styles.viewCenterOverlay}>
            <View style={styles.viewCenterVLine} />
            <View style={styles.viewCenterHLine} />
            <View style={styles.viewCenterDot} />
          </View>

          {/* HUD: 当前视图中心世界坐标 / 缩放 */}
          <View pointerEvents="none" style={styles.hud}>
            <Text style={styles.hudText}>
              Center: (
              {Math.round(hudCenterWorld.x)},
              {' '}
              {Math.round(hudCenterWorld.y)}
              )   Scale: {hudScale.toFixed(2)}
            </Text>
          </View>

          {/* Floating Controls */}
          <View style={styles.floatingControls}>
            {/* Top Group */}
            <View style={styles.controlGroup}>
              <TouchableOpacity
                style={[styles.controlButton, deleteMode && styles.controlButtonActive]}
                onPress={() => setDeleteMode(!deleteMode)}
              >
                <Image
                  source={deleteMode ? ICONS.deleteSelect : ICONS.delete}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={handleNewPlan}>
                <Image
                  source={ICONS.newPlan}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => router.push('/save-preview')}
              >
                <Image
                  source={ICONS.saveImage}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Middle Group - Zoom */}
            <View style={styles.controlGroup}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleZoom('in')}
              >
                <Image
                  source={ICONS.zoomIn}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleZoom('out')}
              >
                <Image
                  source={ICONS.zoomOut}
                  style={styles.controlIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Bottom - Reset */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                translateX.value = 0;
                translateY.value = 0;
                scaleValue.value = 1;
                setScale(1);
                setPan({ x: 0, y: 0 });
              }}
            >
              <Image
                source={ICONS.layers}
                style={styles.resetIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </GestureDetector>

      {/* Material Library */}
      <View style={styles.library}>
        {/* Categories */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryNav}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  style={[
                    styles.categoryButton,
                    active && styles.categoryButtonActive,
                  ]}
                >
                  <Image
                    source={active ? cat.selectIcon : cat.icon}
                    style={[
                      styles.categoryIcon,
                      !active && { opacity: 0.6 },
                    ]}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      active && styles.categoryLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        {/* Module List */}
        <View style={styles.moduleListContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moduleList}
          >
            {activeModules.length === 0 ? (
              <Text style={styles.emptyText}>
                No items in this category.
              </Text>
            ) : (
              <>
                {activeModules.map((module) => {
                  const moduleDragGesture = createModuleDragGesture(module.id);

                  return (
                    <GestureDetector key={module.id} gesture={moduleDragGesture}>
                      <Pressable
                        onPressIn={() => { }}
                        style={({ pressed }) => [
                          styles.card,
                          pressed && styles.cardPressed,
                        ]}
                      >
                        <View style={styles.cardImageWrapper}>
                          <Image
                            source={getImageSource(module.image)}
                            style={styles.cardImage}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.cardFooter}>
                          <Text style={styles.cardTitle} numberOfLines={1}>
                            {module.name}
                          </Text>
                        </View>
                      </Pressable>
                    </GestureDetector>
                  );
                })}
                <View style={{ width: 8 }} />
              </>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Drag Ghost - 放在最外层，使用屏幕坐标 */}
      {dragItem && (
        <Animated.View
          style={[
            styles.dragGhost,
            dragGhostAnimatedStyle,
          ]}
          pointerEvents="none"
        >
          <Image
            source={dragItem?.module.image ? getImageSource(dragItem.module.image) : require('../assets/images/icon.png')}
            style={styles.dragGhostImage}
            resizeMode="cover"
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 30,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: -0.5,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    width: WORLD_SIZE,
    height: WORLD_SIZE,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  room: {
    position: 'absolute',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray300,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roomBase: {
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  baseIndicator: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  dragGhost: {
    position: 'absolute',
    opacity: 0.9,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  dragGhostImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  floatingControls: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    alignItems: 'center',
    gap: 12,
    zIndex: 30,
  },
  hud: {
    position: 'absolute',
    left: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    zIndex: 50,
  },
  hudText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  viewCenterOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCenterVLine: {
    position: 'absolute',
    width: 2,
    top: 0,
    bottom: 0,
    backgroundColor: '#FF0000',
    opacity: 0.6,
  },
  viewCenterHLine: {
    position: 'absolute',
    height: 2,
    left: 0,
    right: 0,
    backgroundColor: '#FF0000',
    opacity: 0.6,
  },
  viewCenterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF0000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  controlGroup: {
    gap: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.gray50,
  },
  controlButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  controlIcon: {
    width: 40,
    height: 40,
  },
  controlIconActive: {
    opacity: 1,
  },
  resetIcon: {
    width: 40,
    height: 40,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  library: {
    height: 280,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    flexDirection: 'column',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    zIndex: 40,
  },
  // container: {
  //   flex: 1,
  //   backgroundColor: colors.white,
  // },
  categoryNav: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    backgroundColor: colors.white,
  },
  categoryButton: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray400,
  },
  categoryLabelActive: {
    color: '#007AFF',
  },
  moduleListContainer: {
    flex: 1,
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
    minHeight: 0,
  },
  moduleList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 16,
    flexDirection: 'row',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.gray400,
    textAlign: 'center',
    paddingVertical: 40,
  },
  card: {
    width: 110,
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.gray200,
    flexShrink: 0,
  },
  cardPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  categoryContainer: {
    height: 90,
  },
  moduleCard: {
    width: 130,
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.gray200,
    flexShrink: 0,
  },
  cardImageWrapper: {
    width: '100%',
    height: 90,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardFooter: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray700,
    textAlign: 'center',
  },
  centerLine: {
    position: 'absolute',
    backgroundColor: '#FF0000',
    opacity: 0.6,
    zIndex: 5,
  },
  centerLineVertical: {
    width: 2,
  },
  centerLineHorizontal: {
    height: 2,
  },
  centerPointMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerPointDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF0000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  centerPointLabel: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  centerPointText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF0000',
  },
});
