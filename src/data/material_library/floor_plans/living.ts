import { RoomModule } from '@/types';
import { defineModule } from '@/utils/roomUtils';
// Navigate to Connector Reading Rules
import { ConnectorRules } from '../connectorRules'; 

export const LIVING_MODULES: RoomModule[] = [
  defineModule(
    'living_1',
    'Cozy Living',
    'living',
    require('../../../../assets/images/livingroom/livingroom-1.png'),
    367, 191, // Original W, H (defines ratio)
    ['right'], // Default sides (Legacy)
    undefined 
  ),
  defineModule(
    'living_2',
    'Modern Living',
    'living',
    require('../../../../assets/images/livingroom/livingroom-2.png'),
    367, 420, 
    ['right']
  ),
  defineModule(
    'living_3',
    'Large Living',
    'living',
    require('../../../../assets/images/livingroom/livingroom-3.png'),
    367, 191, 
    ['right']
  )
];