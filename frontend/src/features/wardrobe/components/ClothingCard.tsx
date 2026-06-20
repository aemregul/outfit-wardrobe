import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ClothingItemResponse, CATEGORY_LABELS } from '../../../shared/types/clothing.types';
import { ImagePreview } from '../../../shared/components/ImagePreview';
import { theme } from '../../../shared/theme';

interface Props {
  item: ClothingItemResponse;
  onMarkClean: (id: string) => void;
  onMarkDirty: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: () => void;
}

export function ClothingCard({ item, onMarkClean, onMarkDirty, onDelete, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={onPress ? 0.75 : 1} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrapper}>
        <ImagePreview uri={item.imageUrl} size="thumb" />
        <View style={[styles.cleanBadge, !item.isClean && styles.dirtyBadge]}>
          <Text style={[styles.cleanText, !item.isClean && styles.dirtyText]}>
            {item.isClean ? '✓ Temiz' : '✗ Kirli'}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.category}>{CATEGORY_LABELS[item.category]}</Text>

        {item.brand && (
          <Text style={styles.meta}>{item.brand}{item.size ? ` · ${item.size}` : ''}</Text>
        )}

        <Text style={styles.wearCount}>
          {item.wearCount > 0 ? `${item.wearCount}× giyildi` : 'Hiç giyilmedi'}
        </Text>

        <View style={styles.actions}>
          {item.isClean ? (
            <TouchableOpacity style={[styles.actionBtn, styles.dirtyBtn]} onPress={() => onMarkDirty(item.id)} activeOpacity={0.7}>
              <Text style={styles.dirtyBtnText}>Kirli İşaretle</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionBtn, styles.cleanBtn]} onPress={() => onMarkClean(item.id)} activeOpacity={0.7}>
              <Text style={styles.cleanBtnText}>Temiz İşaretle</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => onDelete(item.id)} activeOpacity={0.7}>
            <Text style={styles.deleteBtnText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  imageWrapper: {
    position: 'relative',
  },
  cleanBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: theme.colors.successBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  dirtyBadge: { backgroundColor: theme.colors.errorBg },
  cleanText: { fontSize: 10, fontWeight: '700', color: theme.colors.successText },
  dirtyText: { color: theme.colors.errorText },

  info: { flex: 1, padding: 14, gap: 3 },
  name: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  category: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  meta: { fontSize: 12, color: theme.colors.textSecondary },
  wearCount: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },

  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
  },
  cleanBtn: { backgroundColor: theme.colors.successBg },
  cleanBtnText: { fontSize: 11, fontWeight: '700', color: theme.colors.successText },
  dirtyBtn: { backgroundColor: theme.colors.warningBg },
  dirtyBtnText: { fontSize: 11, fontWeight: '700', color: theme.colors.warningText },
  deleteBtn: { backgroundColor: theme.colors.errorBg },
  deleteBtnText: { fontSize: 11, fontWeight: '700', color: theme.colors.errorText },

  chevron: { paddingRight: 14 },
  chevronText: { fontSize: 22, color: theme.colors.indigo200, fontWeight: '300' },
});
