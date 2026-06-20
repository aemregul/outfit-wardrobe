import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OutfitResponse, SEASON_LABELS } from '../../../shared/types/outfit.types';

interface Props {
  item: OutfitResponse;
  onPress: () => void;
  onFavorite: (id: string) => void;
  onUnfavorite: (id: string) => void;
}

export function OutfitCard({ item, onPress, onFavorite, onUnfavorite }: Props) {
  const itemCount = item.clothingItems?.length ?? 0;
  const previewNames = item.clothingItems?.slice(0, 3).map((c) => c.name) ?? [];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconCol}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>✨</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => item.isFavorite ? onUnfavorite(item.id) : onFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.favStar}>{item.isFavorite ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.badgeRow}>
          {item.aiGenerated && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
          {(item.seasons ?? []).slice(0, 2).map((s) => (
            <View key={s} style={styles.seasonBadge}>
              <Text style={styles.seasonBadgeText}>{SEASON_LABELS[s] ?? s}</Text>
            </View>
          ))}
          {(item.occasion ?? []).slice(0, 1).map((o) => (
            <View key={o} style={styles.occasionBadge}>
              <Text style={styles.occasionBadgeText}>{o}</Text>
            </View>
          ))}
          {(item.styles ?? []).slice(0, 1).map((st) => (
            <View key={st} style={styles.styleBadge}>
              <Text style={styles.styleBadgeText}>{st}</Text>
            </View>
          ))}
        </View>

        {previewNames.length > 0 && (
          <Text style={styles.items} numberOfLines={1}>
            {previewNames.join(' · ')}{itemCount > 3 ? ` +${itemCount - 3}` : ''}
          </Text>
        )}

        <Text style={styles.meta}>{itemCount} parça</Text>
      </View>

      <View style={styles.arrowCol}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCol: { marginRight: 14 },
  iconBox: {
    width: 52,
    height: 52,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 24 },
  info: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  name: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E1B4B' },
  favStar: { fontSize: 20, color: '#6366F1' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  aiBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  seasonBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  seasonBadgeText: { fontSize: 10, color: '#6366F1', fontWeight: '500' },
  occasionBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  occasionBadgeText: { fontSize: 10, color: '#92400E', fontWeight: '500' },
  styleBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  styleBadgeText: { fontSize: 10, color: '#4B5563', fontWeight: '500' },
  items: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  meta: { fontSize: 11, color: '#9CA3AF' },
  arrowCol: { marginLeft: 8 },
  arrow: { fontSize: 22, color: '#C7D2FE', fontWeight: '300' },
});
