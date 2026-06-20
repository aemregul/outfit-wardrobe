import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({ style, ...props }: PressableScaleProps) {
  return (
    <Pressable
      style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.95 }] }]}
      {...props}
    />
  );
}
