import { RoomModule } from '@/types';
import { LIVING_MODULES } from './floor_plans/living';
import { KITCHEN_MODULES } from './floor_plans/kitchen';
import { BEDROOM_MODULES } from './floor_plans/bedroom';
import { BATH_MODULES } from './floor_plans/bath';
import { DINING_MODULES } from './floor_plans/dining';
import { OFFICE_MODULES } from './floor_plans/office';
import { KIDS_MODULES } from './floor_plans/kids';
import { STUDY_MODULES } from './floor_plans/study';
import { BALCONY_MODULES } from './floor_plans/balcony';
import { ENTRANCE_MODULES } from './floor_plans/entrance';
import { CORRIDOR_MODULES } from './floor_plans/corridor';

export const ROOM_MODULES: RoomModule[] = [
  ...LIVING_MODULES,
  ...KITCHEN_MODULES,
  ...BEDROOM_MODULES,
  ...BATH_MODULES,
  ...DINING_MODULES,
  ...OFFICE_MODULES,
  ...KIDS_MODULES,
  ...STUDY_MODULES,
  ...BALCONY_MODULES,
  ...ENTRANCE_MODULES,
  ...CORRIDOR_MODULES
];
