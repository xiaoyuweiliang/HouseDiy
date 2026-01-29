/**
 * 吸附工具方法
 * 负责网格吸附与房间之间的磁性边缘吸附
 */

import {
  Point,
  PlacedRoom,
  RoomModule,
  EdgeAlignment,
  Direction,
  GRID_SIZE,
  SNAP_THRESHOLD,
} from '@/types';

/**
 * 将点吸附到最近的网格
 */
export function snapToGrid(point: Point, gridSize: number = GRID_SIZE): Point {
  const snapped = {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
  console.warn('[snappingUtils] snapToGrid:', { from: point, to: snapped, gridSize });
  return snapped;
}

/**
 * 计算房间模块的网格吸附位置（以左上角为基准）
 */
export function calculateGridSnap(position: Point, module: RoomModule): Point {
  const snapped = snapToGrid(position);
  console.warn('[snappingUtils] calculateGridSnap:', {
    position,
    moduleId: module.id,
    result: snapped,
  });
  return snapped;
}

/**
 * 获取房间在画布中的包围盒
 */
export function getRoomBounds(room: PlacedRoom, module: RoomModule) {
  // 当前只支持 0° 旋转，如果以后支持旋转，可以在这里统一扩展
  const width = module.width;
  const height = module.height;

  return {
    left: room.x,
    right: room.x + width,
    top: room.y,
    bottom: room.y + height,
    centerX: room.x + width / 2,
    centerY: room.y + height / 2,
  };
}

/**
 * 计算两点间距离
 */
function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * 计算一个即将放置的新模块与已存在房间之间所有可能的边缘对齐方案
 */
export function findEdgeAlignments(
  position: Point,
  newModule: RoomModule,
  placedRooms: PlacedRoom[],
  modules: RoomModule[],
): EdgeAlignment[] {
  const alignments: EdgeAlignment[] = [];
  const newWidth = newModule.width;
  const newHeight = newModule.height;

  for (const room of placedRooms) {
    const existingModule = modules.find((m) => m.id === room.moduleId);
    if (!existingModule) continue;

    const existingBounds = getRoomBounds(room, existingModule);

    // 1. 新模块 LEFT 对齐已有 RIGHT
    const leftToRight: Point = {
      x: existingBounds.right,
      y: position.y,
    };
    const leftToRightDist = Math.abs(position.x - leftToRight.x);
    if (leftToRightDist <= SNAP_THRESHOLD) {
      alignments.push({
        sourceEdge: 'left',
        targetEdge: 'right',
        alignedPosition: leftToRight,
        distance: leftToRightDist,
      });
    }

    // 2. 新模块 RIGHT 对齐已有 LEFT
    const rightToLeft: Point = {
      x: existingBounds.left - newWidth,
      y: position.y,
    };
    const rightToLeftDist = Math.abs(position.x - rightToLeft.x);
    if (rightToLeftDist <= SNAP_THRESHOLD) {
      alignments.push({
        sourceEdge: 'right',
        targetEdge: 'left',
        alignedPosition: rightToLeft,
        distance: rightToLeftDist,
      });
    }

    // 3. 新模块 TOP 对齐已有 BOTTOM
    const topToBottom: Point = {
      x: position.x,
      y: existingBounds.bottom,
    };
    const topToBottomDist = Math.abs(position.y - topToBottom.y);
    if (topToBottomDist <= SNAP_THRESHOLD) {
      alignments.push({
        sourceEdge: 'top',
        targetEdge: 'bottom',
        alignedPosition: topToBottom,
        distance: topToBottomDist,
      });
    }

    // 4. 新模块 BOTTOM 对齐已有 TOP
    const bottomToTop: Point = {
      x: position.x,
      y: existingBounds.top - newHeight,
    };
    const bottomToTopDist = Math.abs(position.y - bottomToTop.y);
    if (bottomToTopDist <= SNAP_THRESHOLD) {
      alignments.push({
        sourceEdge: 'bottom',
        targetEdge: 'top',
        alignedPosition: bottomToTop,
        distance: bottomToTopDist,
      });
    }

    // 同边对齐（left-left / right-right / top-top / bottom-bottom）

    // 5. LEFT 对 LEFT
    const leftToLeft: Point = {
      x: existingBounds.left,
      y: position.y,
    };
    const leftToLeftDist = Math.abs(position.x - leftToLeft.x);
    if (leftToLeftDist <= SNAP_THRESHOLD) {
      alignments.push({
        sourceEdge: 'left',
        targetEdge: 'left',
        alignedPosition: leftToLeft,
        distance: leftToLeftDist,
      });
    }

    // 6. RIGHT 对 RIGHT
    const rightToRight: Point = {
      x: existingBounds.right - newWidth,
      y: position.y,
    };
    const rightToRightDist = Math.abs(position.x - rightToRight.x);
    if (rightToRightDist <= SNAP_THRESHOLD) {
      alignments.push({
        sourceEdge: 'right',
        targetEdge: 'right',
        alignedPosition: rightToRight,
        distance: rightToRightDist,
      });
    }

    // 7. TOP 对 TOP
    const topToTop: Point = {
      x: position.x,
      y: existingBounds.top,
    };
    const topToTopDist = Math.abs(position.y - topToTop.y);
    if (topToTopDist <= SNAP_THRESHOLD) {
      alignments.push({
        sourceEdge: 'top',
        targetEdge: 'top',
        alignedPosition: topToTop,
        distance: topToTopDist,
      });
    }

    // 8. BOTTOM 对 BOTTOM
    const bottomToBottom: Point = {
      x: position.x,
      y: existingBounds.bottom - newHeight,
    };
    const bottomToBottomDist = Math.abs(position.y - bottomToBottom.y);
    if (bottomToBottomDist <= SNAP_THRESHOLD) {
      alignments.push({
        sourceEdge: 'bottom',
        targetEdge: 'bottom',
        alignedPosition: bottomToBottom,
        distance: bottomToBottomDist,
      });
    }
  }

  console.warn('[snappingUtils] findEdgeAlignments:', {
    position,
    newModuleId: newModule.id,
    placements: placedRooms.length,
    alignments: alignments.length,
  });
  return alignments;
}

/**
 * 计算磁性吸附位置
 * 返回最近的一组边缘对齐坐标，如果没有合适目标则返回 null
 */
export function calculateMagneticSnap(
  position: Point,
  module: RoomModule,
  placedRooms: PlacedRoom[],
  modules: RoomModule[],
): Point | null {
  const alignments = findEdgeAlignments(position, module, placedRooms, modules);

  if (alignments.length === 0) {
    console.warn('[snappingUtils] calculateMagneticSnap: no alignment', {
      position,
      moduleId: module.id,
      placed: placedRooms.length,
    });
    return null;
  }

  alignments.sort((a, b) => a.distance - b.distance);
  const picked = alignments[0];
  console.warn('[snappingUtils] calculateMagneticSnap: picked', {
    position,
    moduleId: module.id,
    target: picked.alignedPosition,
    distance: picked.distance,
  });
  return picked.alignedPosition;
}

/**
 * 综合磁性吸附与网格吸附，返回最终吸附位置
 */
export function calculateSnapPosition(
  position: Point,
  module: RoomModule,
  placedRooms: PlacedRoom[],
  modules: RoomModule[],
): Point {
  const magneticSnap = calculateMagneticSnap(position, module, placedRooms, modules);
  if (magneticSnap) {
    console.warn('[snappingUtils] calculateSnapPosition: magnetic', {
      position,
      moduleId: module.id,
      result: magneticSnap,
    });
    return magneticSnap;
  }
  const grid = calculateGridSnap(position, module);
  console.warn('[snappingUtils] calculateSnapPosition: grid', {
    position,
    moduleId: module.id,
    result: grid,
  });
  return grid;
}

/**
 * 判断当前位置的房间是否与已有房间发生重叠
 */
export function checkOverlap(
  position: Point,
  module: RoomModule,
  placedRooms: PlacedRoom[],
  modules: RoomModule[],
  excludeRoomId?: string,
): boolean {
  const newBounds = {
    left: position.x,
    right: position.x + module.width,
    top: position.y,
    bottom: position.y + module.height,
  };

  for (const room of placedRooms) {
    if (excludeRoomId && room.instanceId === excludeRoomId) {
      continue;
    }

    const existingModule = modules.find((m) => m.id === room.moduleId);
    if (!existingModule) continue;

    const existingBounds = getRoomBounds(room, existingModule);

    const overlap =
      newBounds.left < existingBounds.right &&
      newBounds.right > existingBounds.left &&
      newBounds.top < existingBounds.bottom &&
      newBounds.bottom > existingBounds.top;

    if (overlap) {
      console.warn('[snappingUtils] checkOverlap: overlapped', {
        position,
        moduleId: module.id,
        with: room.instanceId,
      });
      return true;
    }
  }

  console.warn('[snappingUtils] checkOverlap: no overlap', {
    position,
    moduleId: module.id,
    placed: placedRooms.length,
  });
  return false;
}

