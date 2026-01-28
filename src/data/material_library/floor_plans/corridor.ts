import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const CORRIDOR_MODULES: RoomModule[] = [
  defineModule(
    'corridor_1',
    'Short Hall',
    'corridor',
    "https://i.postimg.cc/nzhXqJmh/zou1.png",
    399, 126, // Vertical corridor segment
    ['top', 'bottom']
  ),
  defineModule(
    'corridor_2',
    'Long Hall',
    'corridor',
    "https://i.postimg.cc/nzhXqJmh/zou1.png",
    399, 126,
    ['top', 'bottom']
  ),
  defineModule(
    'corridor_3',
    'Corner Hall',
    'corridor',
    "https://i.postimg.cc/nzhXqJmh/zou1.png",
    399, 126,
    ['top', 'bottom']
  )
];