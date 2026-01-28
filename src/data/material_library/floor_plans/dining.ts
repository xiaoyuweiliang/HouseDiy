import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const DINING_MODULES: RoomModule[] = [
  defineModule(
    'dining_1',
    'Dining Area',
    'dining',
    "https://i.postimg.cc/C1xRbg8Y/can1.png",
    171, 188,
    ['left', 'right', 'top']
  ),
  defineModule(
    'dining_2',
    'Family Dining',
    'dining',
    "https://i.postimg.cc/C1xRbg8Y/can1.png",
    171, 188,
    ['left', 'right', 'top']
  ),
  defineModule(
    'dining_3',
    'Formal Dining',
    'dining',
    "https://i.postimg.cc/C1xRbg8Y/can1.png",
    171, 188,
    ['left', 'right', 'top']
  )
];