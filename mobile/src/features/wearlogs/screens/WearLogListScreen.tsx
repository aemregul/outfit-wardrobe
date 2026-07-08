import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
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
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

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
        ? <ActivityIndicator size="small" color="#C9A86A" />
        : !hasNextPage && allItems.length > 0
          ? <Text style={styles.footerText}>Tüm sonuçlar yüklendi</Text>
          : null}
    </View>
  ), [isFetchingNextPage, hasNextPage, allItems.length]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FDFBF7' }} />;

  const ListHeader = (
    <View>
      <Text style={styles.title}>Giyilme Geçmişi</Text>

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Etkinlik, lokasyon veya tarih ara..."
        placeholderTextColor="#C4B8AF"
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
          <ActivityIndicator size="large" color="#C9A86A" />
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
  safe: { flex: 1, backgroundColor: '#FDFBF7' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: '#4A403A', marginBottom: 16 },
  outfitBtn: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  outfitBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 13 },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(74,64,58,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4A403A',
    marginBottom: 16,
  },
  filtersSection: { marginBottom: 12 },
  filterLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#9C8C84',
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 4, flexWrap: 'wrap' },
  chip: { backgroundColor: '#F0EDE8', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  chipActive: { backgroundColor: '#C9A86A' },
  chipText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#9C8C84' },
  chipTextActive: { color: '#fff' },
  clearBtn: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C9A86A',
  },
  clearBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#C9A86A', fontSize: 13 },
  countText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9C8C84', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  dateCol: { alignItems: 'center', minWidth: 42, marginRight: 4 },
  dateDay: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: '#C9A86A', lineHeight: 26 },
  dateMonth: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#9C8C84', textTransform: 'uppercase' },
  dateYear: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#C4B8AF' },
  divider: { width: 1, height: 48, backgroundColor: 'rgba(74,64,58,0.10)', marginHorizontal: 14 },
  content: { flex: 1 },
  occasionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0EDE8',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  occasionText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#9C8C84' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaItem: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9C8C84' },
  wearAgainBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  wearAgainNo: { backgroundColor: '#FEE2E2' },
  wearAgainText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#065F46' },
  wearAgainNoText: { color: '#991B1B' },
  starsRow: { flexDirection: 'row', gap: 2, marginBottom: 4 },
  star: { fontSize: 14, color: '#E8DCC8' },
  starFilled: { color: '#C9A86A' },
  note: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9C8C84', fontStyle: 'italic' },
  arrow: { fontFamily: 'Poppins_400Regular', fontSize: 22, color: '#D4BC8C', marginLeft: 8 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9C8C84' },
  center: { justifyContent: 'center', alignItems: 'center', gap: 10, paddingTop: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#9C8C84' },
  emptyHint: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#C4B8AF', textAlign: 'center', paddingHorizontal: 32 },
  errorText: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#EF4444' },
  retryText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#C9A86A', textDecorationLine: 'underline' },
});
