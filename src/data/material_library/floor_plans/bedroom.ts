import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const BEDROOM_MODULES: RoomModule[] = [
  defineModule(
    'bed_1',
    'Master Bed',
    'bedroom',
    "https://i.postimg.cc/pTLmKHjW/wo1.png",
    297, 179,
    ['bottom', 'left']
  ),
  defineModule(
    'bed_2',
    'Guest Room',
    'bedroom',
    "https://i.postimg.cc/NMjKRcXG/wo2.png",
    295, 242,
    ['top']
  ),
  defineModule(
    'bed_3',
    'Kids Room',
    'bedroom',
    "https://i.postimg.cc/NMjKRcXG/wo2.png",
    295, 242,
    ['top']
  )
];