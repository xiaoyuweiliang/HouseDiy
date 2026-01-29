/**
 * Storage Service（精简版）
 * 在 HouseAi 中负责画布草稿与设计历史的本地持久化
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedDesign, PlacedRoom } from '@/types';

const STORAGE_KEYS = {
  DESIGNS: '@house-ai:designs',
  ACTIVE_DRAFT: '@house-ai:active-draft',
} as const;

/**
 * 保存单个设计到历史列表
 * 如果已存在同 id，则更新；否则插入到列表开头
 */
export async function saveDesign(design: SavedDesign): Promise<void> {
  try {
    const existing = await loadDesigns();
    const idx = existing.findIndex((d) => d.id === design.id);
    if (idx >= 0) {
      existing[idx] = design;
    } else {
      existing.unshift(design);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(existing));
    console.warn('[storageService] saveDesign success:', {
      id: design.id,
      rooms: design.rooms,
    });
  } catch (error) {
    console.warn('[storageService] saveDesign error:', error);
    throw error;
  }
}

/**
 * 加载所有历史设计
 */
export async function loadDesigns(): Promise<SavedDesign[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DESIGNS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    console.warn('[storageService] loadDesigns success, count:', parsed.length);
    return parsed;
  } catch (error) {
    console.warn('[storageService] loadDesigns error:', error);
    return [];
  }
}

/**
 * 保存当前画布草稿（正在编辑的布局）
 */
export async function saveActiveDraft(rooms: PlacedRoom[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(rooms));
  } catch (error) {
    console.warn('[storageService] saveActiveDraft error:', error);
    throw error;
  }
}

/**
 * 加载当前画布草稿
 */
export async function loadActiveDraft(): Promise<PlacedRoom[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    console.warn('[storageService] loadActiveDraft success, rooms:', parsed.length);
    return parsed;
  } catch (error) {
    console.warn('[storageService] loadActiveDraft error:', error);
    return [];
  }
}

