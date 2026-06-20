import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';
import { ClothingCard } from '../components/ClothingCard';
import { useInfiniteWardrobe, useDeleteClothing, useMarkClean, useMarkDirty } from '../hooks/useWardrobe';
import {
  ClothingCategory, ClothingSeason, ClothingStyle,
  CLOTHING_CATEGORIES, CATEGORY_LABELS,
  CLOTHING_SEASONS, CLOTHING_SEASON_LABELS,
  CLOTHING_STYLES, CLOTHING_STYLE_LABELS,
} from '../../../shared/types/clothing.types';

export function WardrobeListScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] });
    }, [queryClient]),
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ClothingCategory | null>(null);
  const [isCleanFilter, setIsCleanFilter] = useState<boolean | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<ClothingSeason | null>(null);
  const [styleFilter, setStyleFilter] = useState<ClothingStyle | null>(null);

  const filterParams = useMemo(() => ({
    ...(categoryFilter && { category: categoryFilter }),
    ...(isCleanFilter !== null && { isClean: isCleanFilter }),
    ...(seasonFilter && { season: seasonFilter }),
    ...(styleFilter && { style: styleFilter }),
  }), [categoryFilter, isCleanFilter, seasonFilter, styleFilter]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    refetch,
  } = useInfiniteWardrobe(filterParams);

  const { mutate: deleteItem } = useDeleteClothing();
  const { mutate: markClean } = useMarkClean();
  const { mutate: markDirty } = useMarkDirty();

  const serverItems = useMemo(
    () => data?.pages.flatMap(page => page.data.content) ?? [],
    [data],
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return serverItems;
    const q = searchQuery.trim().toLowerCase();
    return serverItems.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q) ||
      item.subCategory?.toLowerCase().includes(q),
    );
  }, [serverItems, searchQuery]);

  const totalCount = data?.pages[0]?.data.totalElements ?? 0;

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== null ||
    isCleanFilter !== null ||
    seasonFilter !== null ||
    styleFilter !== null;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function clearFilters() {
    setSearchQuery('');
    setCategoryFilter(null);
    setIsCleanFilter(null);
    setSeasonFilter(null);
    setStyleFilter(null);
  }

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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dolabım</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddClothing' as never)}>
            <Text style={styles.addBtnText}>+ Ekle</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Kıyafet adı, marka ara..."
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.filtersSection}>
          <Text style={styles.filterLabel}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, categoryFilter === null && styles.chipActive]}
                onPress={() => setCategoryFilter(null)}
              >
                <Text style={[styles.chipText, categoryFilter === null && styles.chipTextActive]}>Tümü</Text>
              </TouchableOpacity>
              {CLOTHING_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, categoryFilter === cat && styles.chipActive]}
                  onPress={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                >
                  <Text style={[styles.chipText, categoryFilter === cat && styles.chipTextActive]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.filterLabel}>Durum</Text>
          <View style={styles.chipRow}>
            {([null, true, false] as const).map(val => (
              <TouchableOpacity
                key={String(val)}
                style={[styles.chip, isCleanFilter === val && styles.chipActive]}
                onPress={() => setIsCleanFilter(isCleanFilter === val ? null : val)}
              >
                <Text style={[styles.chipText, isCleanFilter === val && styles.chipTextActive]}>
                  {val === null ? 'Hepsi' : val ? 'Temiz' : 'Kirli'}
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
              {CLOTHING_SEASONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, seasonFilter === s && styles.chipActive]}
                  onPress={() => setSeasonFilter(seasonFilter === s ? null : s)}
                >
                  <Text style={[styles.chipText, seasonFilter === s && styles.chipTextActive]}>
                    {CLOTHING_SEASON_LABELS[s]}
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

          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Filtreleri Temizle</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isLoading && !isError && totalCount > 0 && (
          <Text style={styles.countText}>
            {searchQuery.trim() ? `${filteredItems.length} / ${totalCount}` : totalCount} kıyafet
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
            <Text style={styles.emptyEmoji}>👗</Text>
            <Text style={styles.emptyText}>Henüz kıyafet eklemediniz.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddClothing' as never)}>
              <Text style={styles.addBtnText}>İlk Kıyafeti Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && filteredItems.length === 0 && hasActiveFilters && (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Filtrelerle eşleşen kıyafet bulunamadı.</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Filtreleri Temizle</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && filteredItems.length > 0 && (
          <FlatList
            style={styles.list}
            data={filteredItems}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ClothingCard
                item={item}
                onMarkClean={markClean}
                onMarkDirty={markDirty}
                onDelete={deleteItem}
                onPress={() => (navigation.navigate as (screen: string, params?: object) => void)('ClothingDetail', { id: item.id })}
              />
            )}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1E1B4B' },
  addBtn: { backgroundColor: '#6366F1', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
  },
  filtersSection: { marginBottom: 8 },
  filterLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginTop: 8, marginBottom: 5 },
  chipRow: { flexDirection: 'row', gap: 7, paddingBottom: 4 },
  chip: { backgroundColor: '#EDE9FE', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  chipActive: { backgroundColor: '#6366F1' },
  chipText: { fontSize: 11, color: '#6366F1', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  clearBtn: {
    alignSelf: 'flex-start', marginTop: 8,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: '#6366F1',
  },
  clearBtnText: { color: '#6366F1', fontSize: 12, fontWeight: '600' },
  countText: { fontSize: 11, color: '#9CA3AF', marginBottom: 10 },
  list: { flex: 1 },
  listContent: { paddingBottom: 24 },
  footer: { paddingVertical: 14, alignItems: 'center' },
  footerText: { fontSize: 11, color: '#9CA3AF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 40 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: '#6B7280' },
  errorText: { fontSize: 14, color: '#EF4444' },
  retryText: { fontSize: 13, color: '#6366F1', textDecorationLine: 'underline' },
});
