import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const KIDS_MODULES: RoomModule[] = [
  defineModule(
    'kids_1',
    'Play Room',
    'kids',
    "https://img.icons8.com/ios/200/000000/teddy-bear.png",
    150, 150,
    ['bottom']
  ),
  defineModule(
    'kids_2',
    'Nursery',
    'kids',
    "https://img.icons8.com/ios/200/000000/teddy-bear.png",
    150, 150,
    ['bottom']
  ),
  defineModule(
    'kids_3',
    'Teen Room',
    'kids',
    "https://img.icons8.com/ios/200/000000/teddy-bear.png",
    150, 150,
    ['bottom']
  )
];