import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OutfitResponse, SEASON_LABELS } from '../../../shared/types/outfit.types';
import { theme } from '../../../shared/theme';

interface Props {
  item: OutfitResponse;
  onPress: () => void;
  onFavorite: (id: string) => void;
  onUnfavorite: (id: string) => void;
}

export function OutfitCard({ item, onPress, onFavorite, onUnfavorite }: Props) {
  const itemCount    = item.clothingItems?.length ?? 0;
  const previewNames = item.clothingItems?.slice(0, 3).map((c) => c.name) ?? [];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.78}>
      {/* Left accent icon */}
      <View style={styles.iconCol}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>{item.aiGenerated ? '✦' : '◆'}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => item.isFavorite ? onUnfavorite(item.id) : onFavorite(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.favStar, item.isFavorite && styles.favStarActive]}>
              {item.isFavorite ? '★' : '☆'}
            </Text>
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 14,
    ...theme.shadow.card,
  },
  iconCol: { marginRight: 14 },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: theme.colors.indigo50,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.indigo100,
  },
  iconText: { fontSize: 22, color: theme.colors.primary },

  info: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  name: { flex: 1, fontSize: 15, fontWeight: '700', color: theme.colors.text },
  favStar: { fontSize: 21, color: theme.colors.indigo200 },
  favStarActive: { color: '#F59E0B' },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 7 },
  aiBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  aiBadgeText: { fontSize: 10, color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  seasonBadge: {
    backgroundColor: theme.colors.indigo50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  seasonBadgeText: { fontSize: 10, color: theme.colors.primary, fontWeight: '600' },
  occasionBadge: {
    backgroundColor: theme.colors.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  occasionBadgeText: { fontSize: 10, color: theme.colors.warningText, fontWeight: '600' },
  styleBadge: {
    backgroundColor: theme.colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  styleBadgeText: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: '600' },

  items: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 3 },
  meta: { fontSize: 11, color: theme.colors.textMuted },

  arrowCol: { marginLeft: 10 },
  arrow: { fontSize: 24, color: theme.colors.indigo200, fontWeight: '300' },
});
