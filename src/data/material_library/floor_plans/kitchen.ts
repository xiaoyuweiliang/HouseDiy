import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const KITCHEN_MODULES: RoomModule[] = [
  defineModule(
    'kitchen_1',
    'Open Kitchen',
    'kitchen',
    "https://i.postimg.cc/KvkZXzF1/4444.png",
    181, 271,
    ['top']
  ),
  defineModule(
    'kitchen_2',
    'L-Shape Kitchen',
    'kitchen',
    "https://i.postimg.cc/KvkZXzF1/4444.png",
    181, 271,
    ['top']
  ),
  defineModule(
    'kitchen_3',
    'Island Kitchen',
    'kitchen',
    "https://i.postimg.cc/KvkZXzF1/4444.png",
    181, 271,
    ['top']
  )
];