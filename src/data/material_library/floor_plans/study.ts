import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';

export const STUDY_MODULES: RoomModule[] = [
  defineModule(
    'study_1',
    'Quiet Study',
    'study',
    "https://img.icons8.com/ios/200/000000/book-shelf.png",
    120, 140,
    ['left']
  ),
  defineModule(
    'study_2',
    'Library',
    'study',
    "https://img.icons8.com/ios/200/000000/book-shelf.png",
    120, 140,
    ['left']
  ),
  defineModule(
    'study_3',
    'Reading Corner',
    'study',
    "https://img.icons8.com/ios/200/000000/book-shelf.png",
    120, 140,
    ['left']
  )
];