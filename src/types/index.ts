export enum Screen {
  SPLASH = 'SPLASH',
  // Initial Guide Flow
  WELCOME = 'WELCOME',
  FEATURE_INTRO_1 = 'FEATURE_INTRO_1',
  FEATURE_INTRO_2 = 'FEATURE_INTRO_2',
  FEATURE_INTRO_3 = 'FEATURE_INTRO_3',
  // Main App
  MAIN = 'MAIN',
  // Aux
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  SAVE_PREVIEW = 'SAVE_PREVIEW'
}

export type Direction = 'top' | 'bottom' | 'left' | 'right';

export interface Connector {
  id: string;
  side: Direction;
  offset: number; // Percentage or pixel offset from start of that side
}

export interface RoomModule {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  image: string | number; // string for URI, number for require() result
  connectors: Connector[];
}

export interface PlacedRoom {
  instanceId: string;
  moduleId: string;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  isBase: boolean;
}

export interface SavedDesign {
  id: string;
  title: string;
  date: string;
  rooms: number;
  image: string;
  data?: PlacedRoom[]; // The actual layout data
}

// 基础几何类型
export interface Point {
  x: number;
  y: number;
}

// 画布 / 吸附相关常量
export const GRID_SIZE = 20;        // 网格间距（像素）
export const SNAP_THRESHOLD = 15;   // 吸附判定阈值（像素）

// 吸附与对齐类型（主要用于拖拽算法）
export interface SnapTarget {
  position: Point;
  distance: number;
  type: 'grid' | 'edge' | 'alignment';
  targetRoomId?: string;
  edge?: Direction;
}

export interface EdgeAlignment {
  sourceEdge: Direction;
  targetEdge: Direction;
  alignedPosition: Point;
  distance: number;
}
