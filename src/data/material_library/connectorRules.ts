import { RoomModule, Connector, PlacedRoom } from '@/types';

/**
 * CONNECTOR READING RULES
 * 
 * This file serves as the single source of truth for interpreting
 * the connector details record stored within each material image/module.
 */

export const ConnectorRules = {
  /**
   * Extracts the connector details record from a module.
   * Ensures that we always get a valid array of connectors.
   */
  getConnectors: (module: RoomModule): Connector[] => {
    if (!module || !Array.isArray(module.connectors)) {
      return [];
    }
    return module.connectors;
  },

  /**
   * Calculates the absolute position (x, y) of a connector on the Canvas.
   * 
   * @param room The placed room instance on the canvas (contains x, y coordinates)
   * @param connector The specific connector details record from the module
   * @param moduleDimensions Optional dimensions if not available in room context
   */
  getConnectorPosition: (
    room: PlacedRoom, 
    connector: Connector, 
    moduleReference: RoomModule
  ): { x: number, y: number } => {
    const absX = room.x;
    const absY = room.y;
    
    // Note: This logic assumes 0 rotation for now. 
    // If rotation is implemented later, this rule file is the ONLY place 
    // that needs to be updated to support matrix rotation math.
    
    switch (connector.side) {
      case 'top':
        return { 
          x: absX + connector.offset, 
          y: absY 
        };
      case 'bottom':
        return { 
          x: absX + connector.offset, 
          y: absY + moduleReference.height 
        };
      case 'left':
        return { 
          x: absX, 
          y: absY + connector.offset 
        };
      case 'right':
        return { 
          x: absX + moduleReference.width, 
          y: absY + connector.offset 
        };
      default:
        return { x: absX, y: absY };
    }
  },

  /**
   * Validates if two connectors are compatible/snappable.
   * (e.g. Top connects to Bottom, Left connects to Right)
   */
  areConnectorsCompatible: (c1: Connector, c2: Connector): boolean => {
    return (
      (c1.side === 'left' && c2.side === 'right') ||
      (c1.side === 'right' && c2.side === 'left') ||
      (c1.side === 'top' && c2.side === 'bottom') ||
      (c1.side === 'bottom' && c2.side === 'top')
    );
  }
};
