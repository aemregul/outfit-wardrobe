import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';
import { useInfiniteWearLogs } from '../hooks/useWearLogs';
import { WearLogResponse } from '../../../shared/types/outfit.types';
import { formatShortDate } from '../../../shared/utils/date';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function RatingStars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Text key={s} style={[styles.star, s <= rating && styles.starFilled]}>★</Text>
      ))}
    </View>
  );
}

function WearLogCard({ item, onPress }: { item: WearLogResponse; onPress: () => void }) {
  const { day, month, year } = formatShortDate(item.wornAt);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.dateCol}>
        <Text style={styles.dateDay}>{day}</Text>
        <Text style={styles.dateMonth}>{month}</Text>
        <Text style={styles.dateYear}>{year}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.content}>
        {item.occasion ? (
          <View style={styles.occasionBadge}>
            <Text style={styles.occasionText}>{item.occasion}</Text>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          {item.location ? (
            <Text style={styles.metaItem}>📍 {item.location}</Text>
          ) : null}
          {item.wouldWearAgain === true ? (
            <View style={styles.wearAgainBadge}>
              <Text style={styles.wearAgainText}>Tekrar Giyerim</Text>
            </View>
          ) : item.wouldWearAgain === false ? (
            <View style={[styles.wearAgainBadge, styles.wearAgainNo]}>
              <Text style={[styles.wearAgainText, styles.wearAgainNoText]}>Giymem</Text>
            </View>
          ) : null}
        </View>

        <RatingStars rating={item.rating} />

        {item.note ? (
          <Text style={styles.note} numberOfLines={2}>{item.note}</Text>
        ) : null}
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

export function WearLogListScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WEAR_LOGS] });
    }, [queryClient]),
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [wouldWearFilter, setWouldWearFilter] = useState<boolean | null>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    refetch,
  } = useInfiniteWearLogs();

  const allItems = useMemo(
    () => data?.pages.flatMap((page) => page.data.content) ?? [],
    [data],
  );

  const filteredItems = useMemo(() => {
    let result = allItems;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((item) =>
        item.occasion?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q) ||
        item.note?.toLowerCase().includes(q) ||
        item.wornAt.slice(0, 10).includes(q)
      );
    }

    if (minRating !== null) {
      result = result.filter(
        (item) => item.rating !== undefined && item.rating >= minRating
      );
    }

    if (wouldWearFilter !== null) {
      result = result.filter((item) => item.wouldWearAgain === wouldWearFilter);
    }

    return result;
  }, [allItems, searchQuery, minRating, wouldWearFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    minRating !== null ||
    wouldWearFilter !== null;

  function clearFilters() {
    setSearchQuery('');
    setMinRating(null);
    setWouldWearFilter(null);
  }

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => (
    <View style={styles.footer}>
      {isFetchingNextPage
        ? <ActivityIndicator size="small" color="#6366F1" />
        : !hasNextPage && allItems.length > 0
          ? <Text style={styles.footerText}>Tüm sonuçlar yüklendi</Text>
          : null}
    </View>
  ), [isFetchingNextPage, hasNextPage, allItems.length]);

  const ListHeader = (
    <View>
      <Text style={styles.title}>Giyilme Geçmişi</Text>

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Etkinlik, lokasyon veya tarih ara..."
        placeholderTextColor="#9CA3AF"
      />

      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Min. Puan</Text>
        <View style={styles.chipRow}>
          {[1, 2, 3, 4, 5].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, minRating === r && styles.chipActive]}
              onPress={() => setMinRating(minRating === r ? null : r)}
            >
              <Text style={[styles.chipText, minRating === r && styles.chipTextActive]}>
                {'★'.repeat(r)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Tekrar Giyerim mi?</Text>
        <View style={styles.chipRow}>
          {([
            { label: 'Tümü', value: null },
            { label: 'Tekrar Giyerim', value: true },
            { label: 'Giymem', value: false },
          ] as const).map(({ label, value }) => (
            <TouchableOpacity
              key={String(value)}
              style={[styles.chip, wouldWearFilter === value && styles.chipActive]}
              onPress={() => setWouldWearFilter(wouldWearFilter === value ? null : value)}
            >
              <Text style={[styles.chipText, wouldWearFilter === value && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isLoading && !isError && allItems.length > 0 && (
        <Text style={styles.countText}>
          {filteredItems.length} kayıt
          {hasActiveFilters && allItems.length !== filteredItems.length
            ? ` (${allItems.length} toplamdan)`
            : ''}
        </Text>
      )}

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Geçmiş yüklenemedi.</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && allItems.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>👗</Text>
          <Text style={styles.emptyText}>Henüz hiç kombin giyilmedi.</Text>
          <Text style={styles.emptyHint}>
            Kombin detay ekranından "Giyildi İşaretle" butonunu kullanın.
          </Text>
          <TouchableOpacity
            style={styles.outfitBtn}
            onPress={() => navigation.navigate('OutfitList')}
          >
            <Text style={styles.outfitBtnText}>Kombinlere Git</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && allItems.length > 0 && filteredItems.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>Filtrelerle eşleşen kayıt bulunamadı.</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WearLogCard
            item={item}
            onPress={() => navigation.navigate('WearLogDetail', { id: item.id })}
          />
        )}
        ListHeaderComponent={ListHeader}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#1E1B4B', marginBottom: 16 },
  outfitBtn: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  outfitBtnText: { color: '#6366F1', fontWeight: '600', fontSize: 13 },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 16,
  },
  filtersSection: { marginBottom: 12 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginTop: 10, marginBottom: 6 },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 4, flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: '#6366F1' },
  chipText: { fontSize: 12, color: '#6366F1', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  clearBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  clearBtnText: { color: '#6366F1', fontSize: 13, fontWeight: '600' },
  countText: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  dateCol: { alignItems: 'center', minWidth: 42, marginRight: 4 },
  dateDay: { fontSize: 22, fontWeight: '700', color: '#6366F1', lineHeight: 26 },
  dateMonth: { fontSize: 11, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' },
  dateYear: { fontSize: 10, color: '#9CA3AF' },
  divider: { width: 1, height: 48, backgroundColor: '#E5E7EB', marginHorizontal: 14 },
  content: { flex: 1 },
  occasionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  occasionText: { fontSize: 12, color: '#6366F1', fontWeight: '600' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaItem: { fontSize: 12, color: '#6B7280' },
  wearAgainBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  wearAgainNo: { backgroundColor: '#FEE2E2' },
  wearAgainText: { fontSize: 11, color: '#065F46', fontWeight: '600' },
  wearAgainNoText: { color: '#991B1B' },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 4 },
  star: { fontSize: 14, color: '#D1D5DB' },
  starFilled: { color: '#FBBF24' },
  note: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },
  arrow: { fontSize: 22, color: '#C7D2FE', marginLeft: 8 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9CA3AF' },
  center: { justifyContent: 'center', alignItems: 'center', gap: 10, paddingTop: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  emptyHint: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32 },
  errorText: { fontSize: 15, color: '#EF4444' },
  retryText: { fontSize: 14, color: '#6366F1', textDecorationLine: 'underline' },
});
