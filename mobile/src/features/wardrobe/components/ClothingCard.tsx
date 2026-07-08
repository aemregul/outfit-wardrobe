import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClothingItemResponse, CATEGORY_LABELS } from '../../../shared/types/clothing.types';
import { ImagePreview } from '../../../shared/components/ImagePreview';

interface Props {
  item: ClothingItemResponse;
  onMarkClean: (id: string) => void;
  onMarkDirty: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: () => void;
}

export function ClothingCard({ item, onMarkClean, onMarkDirty, onDelete, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={styles.card}
    >
      <ImagePreview uri={item.imageUrl} size="thumb" />

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.statusBadge, !item.isClean && styles.statusBadgeDirty]}>
            <Text style={[styles.statusText, !item.isClean && styles.statusTextDirty]}>
              {item.isClean ? 'Temiz' : 'Kirli'}
            </Text>
          </View>
        </View>

        <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>

        {item.brand && (
          <Text style={styles.meta}>{item.brand}{item.size ? ` · ${item.size}` : ''}</Text>
        )}

        <Text style={styles.wearCount}>{item.wearCount} kez giyildi</Text>

        <View style={styles.actions}>
          {item.isClean ? (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onMarkDirty(item.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="water-outline" size={12} color="#9C8C84" />
              <Text style={styles.actionBtnText}>Kirli İşaretle</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnClean]}
              onPress={() => onMarkClean(item.id)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark" size={12} color="#16A34A" />
              <Text style={[styles.actionBtnText, styles.actionBtnTextClean]}>Temiz İşaretle</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDelete]}
            onPress={() => onDelete(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={12} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  info: {
    flex: 1,
    padding: 14,
    gap: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  name: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    color: '#4A403A',
  },
  statusBadge: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  statusBadgeDirty: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  statusText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#16A34A',
  },
  statusTextDirty: {
    color: '#DC2626',
  },
  category: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#C9A86A',
  },
  meta: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#9C8C84',
  },
  wearCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#9C8C84',
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0EDE8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  actionBtnClean: {
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  actionBtnDelete: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    paddingHorizontal: 8,
  },
  actionBtnText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#9C8C84',
  },
  actionBtnTextClean: {
    color: '#16A34A',
  },
});
