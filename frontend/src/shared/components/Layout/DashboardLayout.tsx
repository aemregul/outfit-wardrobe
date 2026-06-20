import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sidebar } from './Sidebar';
import { theme } from '../../theme';

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  return (
    <View style={styles.root}>
      <Sidebar />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    overflow: 'scroll' as any,
  },
});
