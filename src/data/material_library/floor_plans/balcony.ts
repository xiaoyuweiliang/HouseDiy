import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const BALCONY_MODULES: RoomModule[] = [
  defineModule(
    'balcony_1',
    'Small Balcony',
    'balcony',
    "https://i.postimg.cc/QtdFc37h/ce1.png",
    174, 272,
    ['top']
  ),
  defineModule(
    'balcony_2',
    'Wide Balcony',
    'balcony',
    "https://i.postimg.cc/tT4sFj69/ce2.png",
    152, 179,
    ['top']
  ),
  defineModule(
    'balcony_3',
    'Terrace',
    'balcony',
    "https://i.postimg.cc/tT4sFj69/ce2.png",
    152, 179,
    ['top']
  )
];