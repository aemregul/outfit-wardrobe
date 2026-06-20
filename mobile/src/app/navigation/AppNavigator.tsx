import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Adım 14'te AppNavigator.native.tsx olarak NavigationContainer + RootStack ile değiştirilecek.
// Metro bu dosya yerine .native.tsx uzantılısını otomatik seçer.
export function AppNavigator() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Navigator — Adım 14'te hazır olacak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F7FF' },
  text: { fontSize: 14, color: '#6B7280' },
});
