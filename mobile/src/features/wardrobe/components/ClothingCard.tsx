import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
    <TouchableOpacity activeOpacity={onPress ? 0.7 : 1} onPress={onPress} style={styles.card}>
      <ImagePreview uri={item.imageUrl} size="thumb" />

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.cleanBadge, !item.isClean && styles.dirtyBadge]}>
            <Text style={styles.cleanText}>{item.isClean ? 'Temiz' : 'Kirli'}</Text>
          </View>
        </View>

        <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>

        {item.brand && (
          <Text style={styles.meta}>{item.brand}{item.size ? ` · ${item.size}` : ''}</Text>
        )}

        <Text style={styles.wearCount}>{item.wearCount} kez giyildi</Text>

        <View style={styles.actions}>
          {item.isClean ? (
            <TouchableOpacity style={styles.actionBtn} onPress={() => onMarkDirty(item.id)}>
              <Text style={styles.actionBtnText}>Kirli İşaretle</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionBtn, styles.cleanBtn]} onPress={() => onMarkClean(item.id)}>
              <Text style={styles.actionBtnText}>Temiz İşaretle</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(item.id)}>
            <Text style={styles.actionBtnText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  info: { flex: 1, padding: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E1B4B' },
  cleanBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  dirtyBadge: { backgroundColor: '#FEE2E2' },
  cleanText: { fontSize: 11, fontWeight: '600', color: '#065F46' },
  category: { fontSize: 12, color: '#6366F1', fontWeight: '500', marginBottom: 2 },
  meta: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  wearCount: { fontSize: 11, color: '#9CA3AF', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { backgroundColor: '#EDE9FE', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  cleanBtn: { backgroundColor: '#D1FAE5' },
  deleteBtn: { backgroundColor: '#FEE2E2' },
  actionBtnText: { fontSize: 11, fontWeight: '600', color: '#374151' },
});
