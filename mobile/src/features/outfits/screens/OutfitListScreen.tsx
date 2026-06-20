import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';
import { OutfitCard } from '../components/OutfitCard';
import { useInfiniteOutfits, useToggleFavorite } from '../hooks/useOutfits';
import {
  OUTFIT_SEASONS, OUTFIT_OCCASIONS, SEASON_LABELS,
} from '../../../shared/types/outfit.types';
import {
  CLOTHING_STYLES, CLOTHING_STYLE_LABELS,
} from '../../../shared/types/clothing.types';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OutfitListScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OUTFITS] });
    }, [queryClient]),
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | null>(null);
  const [aiFilter, setAiFilter] = useState<boolean | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);
  const [styleFilter, setStyleFilter] = useState<string | null>(null);
  const [occasionFilter, setOccasionFilter] = useState<string | null>(null);

  const filterParams = useMemo(() => ({
    ...(favoriteFilter !== null && { isFavorite: favoriteFilter }),
    ...(aiFilter !== null && { aiGenerated: aiFilter }),
    ...(seasonFilter && { season: seasonFilter }),
    ...(styleFilter && { style: styleFilter }),
    ...(occasionFilter && { occasion: occasionFilter }),
  }), [favoriteFilter, aiFilter, seasonFilter, styleFilter, occasionFilter]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    refetch,
  } = useInfiniteOutfits(filterParams);

  const { mutate: toggleFavorite } = useToggleFavorite();

  const serverItems = useMemo(
    () => data?.pages.flatMap(page => page.data.content) ?? [],
    [data],
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return serverItems;
    const q = searchQuery.trim().toLowerCase();
    return serverItems.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q),
    );
  }, [serverItems, searchQuery]);

  const totalCount = data?.pages[0]?.data.totalElements ?? 0;

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    favoriteFilter !== null ||
    aiFilter !== null ||
    seasonFilter !== null ||
    styleFilter !== null ||
    occasionFilter !== null;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function clearFilters() {
    setSearchQuery('');
    setFavoriteFilter(null);
    setAiFilter(null);
    setSeasonFilter(null);
    setStyleFilter(null);
    setOccasionFilter(null);
  }

  const ListHeader = (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Kombinlerim</Text>
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={() => navigation.navigate('GenerateOutfit')}
        >
          <Text style={styles.generateBtnText}>AI Kombin</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Kombin adı veya açıklama ara..."
        placeholderTextColor="#9CA3AF"
      />

      <View style={styles.filtersSection}>
        <Text style={styles.filterLabel}>Favoriler</Text>
        <View style={styles.chipRow}>
          {([
            { label: 'Tümü', value: null },
            { label: '★ Favoriler', value: true },
          ] as const).map(f => (
            <TouchableOpacity
              key={String(f.value)}
              style={[styles.chip, favoriteFilter === f.value && styles.chipActive]}
              onPress={() => setFavoriteFilter(favoriteFilter === f.value ? null : f.value)}
            >
              <Text style={[styles.chipText, favoriteFilter === f.value && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Kaynak</Text>
        <View style={styles.chipRow}>
          {([
            { label: 'Tümü', value: null },
            { label: 'AI Üretildi', value: true },
            { label: 'Manuel', value: false },
          ] as const).map(f => (
            <TouchableOpacity
              key={String(f.value)}
              style={[styles.chip, aiFilter === f.value && styles.chipActive]}
              onPress={() => setAiFilter(aiFilter === f.value ? null : f.value)}
            >
              <Text style={[styles.chipText, aiFilter === f.value && styles.chipTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.filterLabel}>Mevsim</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, seasonFilter === null && styles.chipActive]}
              onPress={() => setSeasonFilter(null)}
            >
              <Text style={[styles.chipText, seasonFilter === null && styles.chipTextActive]}>Tümü</Text>
            </TouchableOpacity>
            {OUTFIT_SEASONS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, seasonFilter === s && styles.chipActive]}
                onPress={() => setSeasonFilter(seasonFilter === s ? null : s)}
              >
                <Text style={[styles.chipText, seasonFilter === s && styles.chipTextActive]}>
                  {SEASON_LABELS[s] ?? s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.filterLabel}>Stil</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, styleFilter === null && styles.chipActive]}
              onPress={() => setStyleFilter(null)}
            >
              <Text style={[styles.chipText, styleFilter === null && styles.chipTextActive]}>Tümü</Text>
            </TouchableOpacity>
            {CLOTHING_STYLES.map(st => (
              <TouchableOpacity
                key={st}
                style={[styles.chip, styleFilter === st && styles.chipActive]}
                onPress={() => setStyleFilter(styleFilter === st ? null : st)}
              >
                <Text style={[styles.chipText, styleFilter === st && styles.chipTextActive]}>
                  {CLOTHING_STYLE_LABELS[st]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={styles.filterLabel}>Etkinlik</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, occasionFilter === null && styles.chipActive]}
              onPress={() => setOccasionFilter(null)}
            >
              <Text style={[styles.chipText, occasionFilter === null && styles.chipTextActive]}>Tümü</Text>
            </TouchableOpacity>
            {OUTFIT_OCCASIONS.map(o => (
              <TouchableOpacity
                key={o}
                style={[styles.chip, occasionFilter === o && styles.chipActive]}
                onPress={() => setOccasionFilter(occasionFilter === o ? null : o)}
              >
                <Text style={[styles.chipText, occasionFilter === o && styles.chipTextActive]}>
                  {o}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isLoading && !isError && totalCount > 0 && (
        <Text style={styles.countText}>
          {searchQuery.trim() ? `${filteredItems.length} / ${totalCount}` : totalCount} kombin
        </Text>
      )}

      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Hata oluştu.</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && totalCount === 0 && !hasActiveFilters && (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyText}>Henüz kombin oluşturmadınız.</Text>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={() => navigation.navigate('GenerateOutfit')}
          >
            <Text style={styles.generateBtnText}>İlk Kombini Oluştur</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && filteredItems.length === 0 && hasActiveFilters && (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>Filtrelerle eşleşen kombin bulunamadı.</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <Text style={styles.clearBtnText}>Filtreleri Temizle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderFooter = useCallback(() => (
    <View style={styles.footer}>
      {isFetchingNextPage
        ? <ActivityIndicator size="small" color="#6366F1" />
        : !hasNextPage && filteredItems.length > 0
          ? <Text style={styles.footerText}>Tüm sonuçlar yüklendi</Text>
          : null}
    </View>
  ), [isFetchingNextPage, hasNextPage, filteredItems.length]);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OutfitCard
            item={item}
            onPress={() => navigation.navigate('OutfitDetail', { id: item.id })}
            onFavorite={(id) => toggleFavorite({ id, isFavorite: false })}
            onUnfavorite={(id) => toggleFavorite({ id, isFavorite: true })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1E1B4B' },
  generateBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  generateBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
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
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: { backgroundColor: '#EDE9FE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
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
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9CA3AF' },
  center: { justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#6B7280' },
  errorText: { fontSize: 15, color: '#EF4444' },
  retryText: { fontSize: 14, color: '#6366F1', textDecorationLine: 'underline' },
});
