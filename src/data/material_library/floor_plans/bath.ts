import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const BATH_MODULES: RoomModule[] = [
  defineModule(
    'bath_1',
    'Big Bath',
    'bath',
    "https://i.postimg.cc/cHLvfS3s/yang1.png",
    112, 241,
    ['top', 'right']
  ),
  defineModule(
    'bath_2',
    'Small Bath',
    'bath',
    "https://i.postimg.cc/tT4sFj69/ce2.png",
    152, 179,
    ['top', 'right']
  ),
  defineModule(
    'bath_3',
    'Guest Bath',
    'bath',
    "https://i.postimg.cc/tT4sFj69/ce2.png",
    152, 179,
    ['top', 'right']
  )
];