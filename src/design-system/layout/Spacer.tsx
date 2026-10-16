import React from 'react';
import { View } from 'react-native';
import { spacing } from '../tokens/spacing';

interface SpacerProps {
  size?: keyof typeof spacing;
  horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ size = 'base', horizontal = false }) => {
  const dimension = spacing[size];
  return (
    <View
      style={
        horizontal
          ? { width: dimension, height: 1 }
          : { height: dimension, width: 1 }
      }
    />
  );
};
