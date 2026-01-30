/**
 * Main Canvas Screen
 * 画布主页：参考 home/Demo 的主画布逻辑实现
 * 包含：历史记录、设置入口、画布缩放/重置、底部物料库拖拽到画布
 */

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Canvas, { DragItem } from '../src/components/Canvas';
import { PlacedRoom, RoomModule } from '@/types';
import { ROOM_MODULES } from '@/data/material_library';
import { saveActiveDraft, loadActiveDraft, saveDesign } from '@/services/storageService';
import { calculateGridSnap, calculateMagneticSnap } from '@/utils/snappingUtils';
import { ICONS } from '@/components/icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 房间分类配置（使用本项目本地 PNG 图标）
const CATEGORIES = [
  { id: 'living', label: 'Living', iconDefault: ICONS.living, iconActive: ICONS.livingSelect },
  { id: 'kitchen', label: 'Kitchen', iconDefault: ICONS.kitchen, iconActive: ICONS.kitchenSelect },
  { id: 'bedroom', label: 'Bedroom', iconDefault: ICONS.bedroom, iconActive: ICONS.bedroomSelect },
  { id: 'bath', label: 'Bath', iconDefault: ICONS.bath, iconActive: ICONS.bathSelect },
  { id: 'dining', label: 'Dining', iconDefault: ICONS.dining, iconActive: ICONS.diningSelect },
  { id: 'office', label: 'Office', iconDefault: ICONS.office, iconActive: ICONS.officeSelect },
  { id: 'kids', label: 'Kids', iconDefault: ICONS.kids, iconActive: ICONS.kidsSelect },
  { id: 'study', label: 'Study', iconDefault: ICONS.study, iconActive: ICONS.studySelect },
  { id: 'balcony', label: 'Balcony', iconDefault: ICONS.balcony, iconActive: ICONS.balconySelect },
  { id: 'entrance', label: 'Entrance', iconDefault: ICONS.entrance, iconActive: ICONS.entranceSelect },
  { id: 'corridor', label: 'Corridor', iconDefault: ICONS.corridor, iconActive: ICONS.corridorSelect },
] as const;

export default function MainScreen() {
  const router = useRouter();

  // --- 画布状态（含历史） ---
  const [history, setHistory] = useState<PlacedRoom[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const placedRooms = history[historyIndex];

  // 画布视图变换
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // 拖拽状态
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // 选中状态（最多只能有一个房间被选中）
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // 物料栏 / 分类
  const [selectedCategory, setSelectedCategory] = useState('living');
  const [isModuleScrollEnabled, setIsModuleScrollEnabled] = useState(true);

  // 引用与布局
  const categoryScrollRef = useRef<ScrollView>(null);
  const moduleScrollRef = useRef<ScrollView>(null);
  const canvasContainerRef = useRef<View>(null);
  const [canvasLayout, setCanvasLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  // 拖拽会话 ref：onRoomDragStart 与 onRoomDragMove 几乎同时触发，state 未刷新时用 ref 保证首帧就跟手
  const dragItemRef = useRef<DragItem | null>(null);

  // 初次加载时恢复草稿
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await loadActiveDraft();
        if (draft && draft.length > 0) {
          setHistory([draft]);
          setHistoryIndex(0);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    };
    loadDraft();
  }, []);

  // 画布内容变动时自动保存草稿（稍作 debounce）
  useEffect(() => {
    const timer = setTimeout(() => {
      saveActiveDraft(placedRooms).catch((error) => {
        console.error('Error saving draft:', error);
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [placedRooms]);

  // 监听选中状态变化
  useEffect(() => {
    console.log('[main] selectedRoomId 变化:', selectedRoomId);
  }, [selectedRoomId]);

  // 当前分类下的模块
  const activeModules = useMemo(
    () => ROOM_MODULES.filter((m) => m.type === selectedCategory),
    [selectedCategory],
  );

  // 将新状态加入历史栈
  const addToHistory = (newRooms: PlacedRoom[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newRooms);
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }
    setHistory(newHistory);
  };

  // --- 画布控制 ---

  const handleZoom = (direction: 'in' | 'out') => {
    setScale((prev) => {
      const next = direction === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.max(0.2, Math.min(next, 3.0));
    });
  };

  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePanChange = useCallback((newPan: { x: number; y: number }) => {
    setPan(newPan);
  }, []);

  const handleNewPlan = async () => {
    try {
      if (placedRooms.length > 0) {
        const design = {
          id: Date.now().toString(),
          title: `Design ${new Date().toLocaleDateString()}`,
          date: new Date().toISOString(),
          rooms: placedRooms.length,
          image: '',
          data: placedRooms,
        };
        await saveDesign(design);
      }
      setHistory([[]]);
      setHistoryIndex(0);
      setScale(1);
      setPan({ x: 0, y: 0 });
    } catch (error) {
      console.error('Error creating new plan:', error);
    }
  };

  const handleSaveImage = () => {
    router.push('/save-preview');
  };

  const handleHistory = () => {
    router.push('/history');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  // 选中房间
  const handleRoomSelect = useCallback((roomId: string | null) => {
    console.log('[main] handleRoomSelect 被调用，设置 selectedRoomId:', roomId);
    setSelectedRoomId(roomId);
  }, []);

  // 点击画布空白处清除选中
  const handleCanvasPress = useCallback(() => {
    console.log('[main] handleCanvasPress 被调用，清除选中');
    setSelectedRoomId(null);
  }, []);

  // --- 拖拽相关 ---

  // 从物料栏开始拖拽
  const handleStartDragFromLibrary = useCallback((module: RoomModule, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setIsModuleScrollEnabled(false);
    const item: DragItem = {
      type: 'new',
      module,
      offsetX: module.width / 2,
      offsetY: module.height / 2,
    };
    dragItemRef.current = item;
    setDragItem(item);
    setDragPosition({ x: pageX, y: pageY });
  }, []);

  // 从画布上的已有房间开始拖拽
  const handleStartDragFromRoom = useCallback(
    (room: PlacedRoom, module: RoomModule, touchX: number, touchY: number) => {
      const canvasX = touchX - canvasLayout.x;
      const canvasY = touchY - canvasLayout.y;
      const worldX = (canvasX - pan.x) / scale;
      const worldY = (canvasY - pan.y) / scale;

      const item: DragItem = {
        type: 'existing',
        module,
        instanceId: room.instanceId,
        offsetX: worldX - room.x,
        offsetY: worldY - room.y,
      };
      dragItemRef.current = item;
      setDragItem(item);
      setDragPosition({ x: touchX, y: touchY });
    },
    [canvasLayout, pan, scale],
  );

  // 拖拽移动中（用 ref 判断已开始拖拽，避免 onRoomDragStart 与 onRoomDragMove 几乎同时调用时 state 未刷新导致首帧不跟手）
  const handleDragMove = useCallback((touchX: number, touchY: number) => {
    if (dragItemRef.current) {
      setDragPosition({ x: touchX, y: touchY });
    }
  }, []);

  // 拖拽结束，计算最终吸附位置并落下（现在由 Canvas 手势直接调用，传入最终坐标）
  const handleDragEnd = useCallback((pageX: number, pageY: number) => {
    const currentDragItem = dragItemRef.current ?? dragItem;
    if (!currentDragItem) return;
    setIsModuleScrollEnabled(true);
    const canvasX = pageX - canvasLayout.x;
    const canvasY = pageY - canvasLayout.y;
    const worldX = (canvasX - pan.x) / scale;
    const worldY = (canvasY - pan.y) / scale;

    const rawX = worldX - currentDragItem.offsetX;
    const rawY = worldY - currentDragItem.offsetY;

    const stationaryRooms =
      currentDragItem.type === 'existing'
        ? placedRooms.filter((r) => r.instanceId !== currentDragItem.instanceId)
        : placedRooms;

    const magneticSnap = calculateMagneticSnap(
      { x: rawX, y: rawY },
      currentDragItem.module,
      stationaryRooms,
      ROOM_MODULES,
    );

    let finalX: number;
    let finalY: number;

    if (magneticSnap) {
      finalX = magneticSnap.x;
      finalY = magneticSnap.y;
    } else {
      const gridSnap = calculateGridSnap({ x: rawX, y: rawY }, currentDragItem.module);
      finalX = gridSnap.x;
      finalY = gridSnap.y;
    }

    const isBase =
      currentDragItem.type === 'existing'
        ? placedRooms.find((r) => r.instanceId === currentDragItem.instanceId)?.isBase
        : placedRooms.length === 0;

    const newRoom: PlacedRoom = {
      instanceId:
        currentDragItem.type === 'existing'
          ? currentDragItem.instanceId!
          : Math.random().toString(36).substring(2, 11),
      moduleId: currentDragItem.module.id,
      x: finalX,
      y: finalY,
      rotation: 0,
      isBase: !!isBase,
    };

    let newRooms: PlacedRoom[];
    if (currentDragItem.type === 'existing') {
      newRooms = placedRooms.map((r) => (r.instanceId === newRoom.instanceId ? newRoom : r));
    } else {
      newRooms = [...placedRooms, newRoom];
    }

    addToHistory(newRooms);
    dragItemRef.current = null;
    setDragItem(null);
    setDragPosition(null);
  }, [dragItem, canvasLayout, pan, scale, placedRooms]);

  // 从物料栏拖拽时，根 View 的 onTouchMove/onTouchEnd 传入的是事件对象，需要提取坐标后调用 handleDragMove/handleDragEnd
  const onTouchMoveForLibrary = useCallback(
    (e: any) => {
      const { pageX, pageY } = e.nativeEvent ?? {};
      if (typeof pageX === 'number' && typeof pageY === 'number') {
        handleDragMove(pageX, pageY);
      }
    },
    [handleDragMove],
  );
  const onTouchEndForLibrary = useCallback(
    (e: any) => {
      const { pageX, pageY } = e.nativeEvent ?? {};
      if (typeof pageX === 'number' && typeof pageY === 'number') {
        handleDragEnd(pageX, pageY);
      } else {
        setIsModuleScrollEnabled(true);
        setDragItem(null);
        setDragPosition(null);
      }
    },
    [handleDragEnd],
  );

  return (
    <View
      style={styles.container}
      onTouchMove={onTouchMoveForLibrary}
      onTouchEnd={onTouchEndForLibrary}
    >
      {/* 顶部状态栏占位，与其他页面视觉统一 */}
      <View style={styles.statusBar} />

      {/* 头部：历史 / 标题 / 设置 */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
          onPress={handleHistory}
        >
          <Image source={ICONS.history} style={styles.headerIcon} resizeMode="contain" />
        </Pressable>

        <Text style={styles.headerTitle}>Floor Plan Puzzle</Text>

        <Pressable
          style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
          onPress={handleSettings}
        >
          <Image source={ICONS.settings} style={styles.headerIcon} resizeMode="contain" />
        </Pressable>
      </View>

      {/* 画布区域 */}
      <View
        style={styles.canvasContainer}
        ref={canvasContainerRef}
        onLayout={() => {
          canvasContainerRef.current?.measureInWindow((x, y, width, height) => {
            setCanvasLayout({ x, y, width, height });
          });
        }}
      >
        <Canvas
          placedRooms={placedRooms}
          modules={ROOM_MODULES}
          scale={scale}
          pan={pan}
          onScaleChange={setScale}
          onPanChange={handlePanChange}
          dragItem={dragItem}
          dragPosition={dragPosition}
          canvasLayout={canvasLayout}
          selectedRoomId={selectedRoomId}
          onRoomSelect={handleRoomSelect}
          onCanvasPress={handleCanvasPress}
          onRoomDragStart={handleStartDragFromRoom}
          onRoomDragMove={handleDragMove}
          onRoomDragEnd={handleDragEnd}
        />

        {/* 浮动控制按钮组 */}
        <View style={styles.floatingControls}>
          {/* 新建 / 保存图片 */}
          <View style={styles.controlGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                pressed && styles.controlButtonPressed,
              ]}
              onPress={handleNewPlan}
            >
              <Image source={ICONS.newPlan} style={styles.controlIcon} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                pressed && styles.controlButtonPressed,
              ]}
              onPress={handleSaveImage}
            >
              <Image source={ICONS.saveImage} style={styles.controlIcon} />
            </Pressable>
          </View>

          {/* 缩放 */}
          <View style={styles.controlGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                pressed && styles.controlButtonPressed,
              ]}
              onPress={() => handleZoom('in')}
            >
              <Image source={ICONS.zoomIn} style={styles.controlIcon} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.controlButton,
                pressed && styles.controlButtonPressed,
              ]}
              onPress={() => handleZoom('out')}
            >
              <Image source={ICONS.zoomOut} style={styles.controlIcon} />
            </Pressable>
          </View>

          {/* 重置视图 */}
          <Pressable
            style={({ pressed }) => [styles.resetButton, pressed && styles.resetButtonPressed]}
            onPress={handleResetView}
          >
            <Image source={ICONS.layers} style={styles.controlIcon} />
          </Pressable>
        </View>
      </View>

      {/* 底部物料库 */}
      <View style={styles.materialLibrary}>
        {/* 分类列表 */}
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.id;
            const iconSource = active ? cat.iconActive : cat.iconDefault;
            return (
              <Pressable
                key={cat.id}
                style={({ pressed }) => [
                  styles.categoryButton,
                  active && styles.categoryButtonActive,
                  pressed && styles.categoryButtonPressed,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <View
                  style={[
                    styles.categoryIconContainer,
                    active && styles.categoryIconContainerActive,
                  ]}
                >
                  <Image
                    source={iconSource}
                    style={[styles.categoryIcon, active && styles.categoryIconActive]}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 模块列表 */}
        <ScrollView
          ref={moduleScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={isModuleScrollEnabled}
          style={styles.moduleScroll}
          contentContainerStyle={styles.moduleContent}
        >
          {activeModules.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No items in this category.</Text>
            </View>
          )}

          {activeModules.map((module) => (
            <Pressable
              key={module.id}
              style={({ pressed }) => [styles.moduleCard, pressed && styles.moduleCardPressed]}
              onPressIn={(e) => handleStartDragFromLibrary(module, e)}
            >
              <View style={styles.moduleImageContainer}>
                <Image
                  source={typeof module.image === 'number' ? module.image : { uri: module.image }}
                  style={styles.moduleImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.moduleFooter}>
                <Text style={styles.moduleName} numberOfLines={1}>
                  {module.name}
                </Text>
              </View>
            </Pressable>
          ))}
          <View style={styles.moduleScrollPadding} />
        </ScrollView>
      </View>

      {/* 底部安全区域占位 */}
      <View style={styles.bottomSpace} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBar: {
    width: '100%',
    height: 47,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(243, 244, 246, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 30,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  headerIcon: {
    width: 22,
    height: 22,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.3,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  floatingControls: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    alignItems: 'center',
    zIndex: 30,
  },
  controlGroup: {
    gap: 12,
    marginBottom: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  controlButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
  controlIcon: {
    width: 24,
    height: 24,
    opacity: 0.7,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  resetButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
  materialLibrary: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    zIndex: 40,
  },
  categoryScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  categoryContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 4,
  },
  categoryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#EFF6FF',
  },
  categoryButtonPressed: {
    opacity: 0.7,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryIconContainerActive: {
    backgroundColor: '#007AFF',
  },
  categoryIcon: {
    width: 18,
    height: 18,
    opacity: 0.6,
  },
  categoryIconActive: {
    opacity: 1,
    tintColor: '#FFFFFF',
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  categoryLabelActive: {
    color: '#007AFF',
  },
  moduleScroll: {
    flex: 1,
  },
  moduleContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
  },
  emptyState: {
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  moduleCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moduleCardPressed: {
    transform: [{ scale: 0.95 }],
  },
  moduleImageContainer: {
    width: '100%',
    height: 130,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  moduleImage: {
    width: '100%',
    height: '100%',
  },
  moduleFooter: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  moduleName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    paddingHorizontal: 8,
  },
  moduleScrollPadding: {
    width: 8,
  },
  bottomSpace: {
    height: 50,
    backgroundColor: '#FFFFFF',
    zIndex: 40,
  },
});

