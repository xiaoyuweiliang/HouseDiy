import React from 'react';
import { Image, ImageStyle, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle | ImageStyle;
  filled?: boolean;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#000000', 
  style,
  filled = false 
}) => {
  // For Material Icons
  return (
    <MaterialIcons 
      name={name as any} 
      size={size} 
      color={color} 
      style={style as any}
    />
  );
};
