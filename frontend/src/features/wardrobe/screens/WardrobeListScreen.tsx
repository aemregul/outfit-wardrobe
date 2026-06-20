import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardLayout } from '../../../shared/components/Layout/DashboardLayout';
import { ClothingCard } from '../components/ClothingCard';
import { FilterPanel } from '../../../shared/components/FilterPanel';
import type { FilterGroupConfig, ActiveChip } from '../../../shared/components/FilterPanel';
import { useInfiniteWardrobe, useDeleteClothing, useMarkClean, useMarkDirty } from '../hooks/useWardrobe';
import {
  ClothingCategory, ClothingSeason, ClothingStyle,
  CLOTHING_CATEGORIES, CATEGORY_LABELS,
  CLOTHING_SEASONS, CLOTHING_SEASON_LABELS,
  CLOTHING_STYLES, CLOTHING_STYLE_LABELS,
} from '../../../shared/types/clothing.types';
import { theme } from '../../../shared/theme';
import type { RootStackParamList } from '../../../app/navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function WardrobeListScreen() {
  const navigation = useNavigation<Nav>();

  const [searchQuery, setSearchQuery]       = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ClothingCategory | null>(null);
  const [isCleanFilter, setIsCleanFilter]   = useState<boolean | null>(null);
  const [seasonFilter, setSeasonFilter]     = useState<ClothingSeason | null>(null);
  const [styleFilter, setStyleFilter]       = useState<ClothingStyle | null>(null);

  const filterParams = useMemo(() => ({
    ...(categoryFilter && { category: categoryFilter }),
    ...(isCleanFilter !== null && { isClean: isCleanFilter }),
    ...(seasonFilter && { season: seasonFilter }),
    ...(styleFilter && { style: styleFilter }),
  }), [categoryFilter, isCleanFilter, seasonFilter, styleFilter]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, isError, refetch } =
    useInfiniteWardrobe(filterParams);

  const { mutate: deleteItem } = useDeleteClothing();
  const { mutate: markClean  } = useMarkClean();
  const { mutate: markDirty  } = useMarkDirty();

  const serverItems = useMemo(() => data?.pages.flatMap(p => p.data.content) ?? [], [data]);

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
    searchQuery.trim() !== '' || categoryFilter !== null ||
    isCleanFilter !== null || seasonFilter !== null || styleFilter !== null;

  function clearFilters() {
    setSearchQuery('');
    setCategoryFilter(null);
    setIsCleanFilter(null);
    setSeasonFilter(null);
    setStyleFilter(null);
  }

  const filterGroups = useMemo<FilterGroupConfig[]>(() => [
    {
      label: 'Kategori',
      scrollable: true,
      options: [
        { label: 'Tümü', isActive: categoryFilter === null, onPress: () => setCategoryFilter(null) },
        ...CLOTHING_CATEGORIES.map(cat => ({
          label: CATEGORY_LABELS[cat],
          isActive: categoryFilter === cat,
          onPress: () => setCategoryFilter(categoryFilter === cat ? null : cat),
        })),
      ],
    },
    {
      label: 'Durum',
      options: [
        { label: 'Hepsi', isActive: isCleanFilter === null, onPress: () => setIsCleanFilter(null) },
        { label: 'Temiz', isActive: isCleanFilter === true,  onPress: () => setIsCleanFilter(isCleanFilter === true  ? null : true),  color: theme.colors.success },
        { label: 'Kirli', isActive: isCleanFilter === false, onPress: () => setIsCleanFilter(isCleanFilter === false ? null : false), color: theme.colors.error },
      ],
    },
    {
      label: 'Mevsim',
      scrollable: true,
      options: [
        { label: 'Tümü', isActive: seasonFilter === null, onPress: () => setSeasonFilter(null) },
        ...CLOTHING_SEASONS.map(s => ({
          label: CLOTHING_SEASON_LABELS[s],
          isActive: seasonFilter === s,
          onPress: () => setSeasonFilter(seasonFilter === s ? null : s),
        })),
      ],
    },
    {
      label: 'Stil',
      scrollable: true,
      options: [
        { label: 'Tümü', isActive: styleFilter === null, onPress: () => setStyleFilter(null) },
        ...CLOTHING_STYLES.map(st => ({
          label: CLOTHING_STYLE_LABELS[st],
          isActive: styleFilter === st,
          onPress: () => setStyleFilter(styleFilter === st ? null : st),
        })),
      ],
    },
  ], [categoryFilter, isCleanFilter, seasonFilter, styleFilter]);

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];
    if (categoryFilter !== null) chips.push({ label: CATEGORY_LABELS[categoryFilter], onRemove: () => setCategoryFilter(null) });
    if (isCleanFilter !== null) chips.push({ label: isCleanFilter ? 'Temiz' : 'Kirli', onRemove: () => setIsCleanFilter(null) });
    if (seasonFilter !== null) chips.push({ label: CLOTHING_SEASON_LABELS[seasonFilter], onRemove: () => setSeasonFilter(null) });
    if (styleFilter !== null) chips.push({ label: CLOTHING_STYLE_LABELS[styleFilter], onRemove: () => setStyleFilter(null) });
    return chips;
  }, [categoryFilter, isCleanFilter, seasonFilter, styleFilter]);

  const activeCount =
    (categoryFilter !== null ? 1 : 0) +
    (isCleanFilter !== null ? 1 : 0) +
    (seasonFilter !== null ? 1 : 0) +
    (styleFilter !== null ? 1 : 0);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => (
    <View style={styles.footer}>
      {isFetchingNextPage
        ? <ActivityIndicator size="small" color={theme.colors.primary} />
        : !hasNextPage && filteredItems.length > 0
          ? <Text style={styles.footerText}>Tüm sonuçlar yüklendi</Text>
          : null}
    </View>
  ), [isFetchingNextPage, hasNextPage, filteredItems.length]);

  return (
    <DashboardLayout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dolabım</Text>
            {!isLoading && totalCount > 0 && (
              <Text style={styles.countText}>
                {hasActiveFilters ? `${filteredItems.length} / ${totalCount}` : totalCount} kıyafet
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddClothing')} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Kıyafet Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>⊕</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Kıyafet adı, marka veya alt kategori..."
            placeholderTextColor={theme.colors.textMuted}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filterWrapper}>
          <FilterPanel
            groups={filterGroups}
            activeCount={activeCount}
            activeChips={activeChips}
            onClearAll={clearFilters}
          />
        </View>

        {/* States */}
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Kıyafetler yükleniyor...</Text>
          </View>
        )}

        {isError && (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>⚠</Text>
            <Text style={styles.errorText}>Bir hata oluştu.</Text>
            <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7}>
              <Text style={styles.retryText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && totalCount === 0 && !hasActiveFilters && (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>▣</Text>
            <Text style={styles.emptyTitle}>Dolap henüz boş</Text>
            <Text style={styles.emptySubtitle}>İlk kıyafetini ekleyerek başla.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddClothing')} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>+ İlk Kıyafeti Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && filteredItems.length === 0 && hasActiveFilters && (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>⊕</Text>
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptySubtitle}>Filtrelerle eşleşen kıyafet yok.</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>✕ Filtreleri Temizle</Text>
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
                onPress={() => navigation.navigate('ClothingDetail', { id: item.id })}
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
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 28, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.text, lineHeight: 30 },
  countText: { fontSize: 12, color: theme.colors.textMuted, marginTop: 3 },
  addBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    marginBottom: 14,
    gap: 10,
  },
  searchIcon: { fontSize: 15, color: theme.colors.textMuted },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: theme.colors.text },
  clearIcon: { fontSize: 13, color: theme.colors.textMuted, padding: 4 },

  filterWrapper: { marginBottom: 16 },

  clearBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.errorBg,
  },
  clearBtnText: { color: theme.colors.errorText, fontSize: 12, fontWeight: '700' },

  list: { flex: 1 },
  listContent: { paddingBottom: 24 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { fontSize: 12, color: theme.colors.textMuted },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingTop: 60 },
  emptyIcon: { fontSize: 48, color: theme.colors.indigo200, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  emptySubtitle: { fontSize: 14, color: theme.colors.textSecondary },
  loadingText: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 8 },
  errorText: { fontSize: 15, color: theme.colors.error, fontWeight: '600' },
  retryText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
});
