import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const OFFICE_MODULES: RoomModule[] = [
  defineModule(
    'office_1',
    'Home Office',
    'office',
    "https://img.icons8.com/ios/200/000000/desk.png",
    130, 130,
    ['right']
  ),
  defineModule(
    'office_2',
    'Work Studio',
    'office',
    "https://img.icons8.com/ios/200/000000/desk.png",
    130, 130,
    ['right']
  ),
  defineModule(
    'office_3',
    'Study Nook',
    'office',
    "https://img.icons8.com/ios/200/000000/desk.png",
    130, 130,
    ['right']
  )
];