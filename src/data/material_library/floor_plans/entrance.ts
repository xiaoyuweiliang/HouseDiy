import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const ENTRANCE_MODULES: RoomModule[] = [
  defineModule(
    'entrance_1',
    'Main Door',
    'entrance',
    "https://i.postimg.cc/hjtXVBmG/ru1.png",
    91, 177, // Ratio leads to wider than tall typically for top-down view of door swing area + threshold
    ['bottom']
  ),
  defineModule(
    'entrance_2',
    'Double Door',
    'entrance',
    "https://i.postimg.cc/hjtXVBmG/ru1.png",
    91, 177,
    ['bottom']
  ),
  defineModule(
    'entrance_3',
    'Side Entry',
    'entrance',
    "https://i.postimg.cc/hjtXVBmG/ru1.png",
    91, 177,
    ['bottom']
  )
];