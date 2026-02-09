// 统一管理画布尺寸，保证 canvas / grid 完全一致
export const WORLD_SIZE = 2048;

// Metal 纹理最大尺寸限制（iOS）
// 限制最大缩放比例，确保 WORLD_SIZE * MAX_SCALE <= 8192
export const MAX_SCALE = 2.0; // 4096 * 2.0 = 8192 (刚好在限制内)
export const MIN_SCALE = 0.5;

