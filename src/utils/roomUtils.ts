import { RoomModule, Direction, Connector } from '@/types';

/**
 * 创建房间模块，并根据原始图片尺寸等比缩放。
 *
 * @param id         唯一 ID
 * @param name       展示名称
 * @param type       类别（living / kitchen 等）
 * @param image      图片资源（require() 或远程 URL）
 * @param originalW  图片原始宽度（像素）
 * @param originalH  图片原始高度（像素）
 * @param sides      哪些边有默认连接点
 * @param customConnectors 自定义连接点（可选）
 */
// 控制新放入画布时模块整体缩放比例，越小图片越小
const BASE_SCALE = 0.4;

export const defineModule = (
  id: string,
  name: string,
  type: string,
  image: string | number, // Support both URI strings and require() results
  originalW: number,
  originalH: number,
  sides: Direction[],
  customConnectors?: Connector[] // New Parameter for detailed records
): RoomModule => {
  // 按比例缩放原始宽高，使不同图片自适应自身比例，而不是固定高度
  const scaledWidth = Math.round(originalW * BASE_SCALE);
  const scaledHeight = Math.round(originalH * BASE_SCALE);

  let connectors: Connector[] = [];

  if (customConnectors && customConnectors.length > 0) {
    // If specific details are provided (e.g. from Editor save or detailed manual config), use them.
    connectors = customConnectors;
  } else {
    // Generate connectors automatically at the center of each side (Legacy behavior)
    connectors = sides.map((side, index) => {
      let offset = 0;
      
      // For Top/Bottom, offset is along the Width (X axis)
      if (side === 'top' || side === 'bottom') {
        offset = scaledWidth / 2;
      } 
      // For Left/Right, offset is along the Height (Y axis)
      else {
        offset = scaledHeight / 2;
      }

      return {
        id: `${id}_c${index}`,
        side: side,
        offset: offset
      };
    });
  }

  return {
    id,
    name,
    type,
    width: scaledWidth,
    height: scaledHeight,
    image,
    connectors
  };
};
