import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardLayout } from '../../../shared/components/Layout/DashboardLayout';
import { OutfitCard } from '../components/OutfitCard';
import { FilterPanel } from '../../../shared/components/FilterPanel';
import type { FilterGroupConfig, ActiveChip } from '../../../shared/components/FilterPanel';
import { useInfiniteOutfits, useAddFavorite, useRemoveFavorite } from '../hooks/useOutfits';
import {
  OUTFIT_SEASONS, OUTFIT_OCCASIONS, SEASON_LABELS,
} from '../../../shared/types/outfit.types';
import {
  CLOTHING_STYLES, CLOTHING_STYLE_LABELS,
} from '../../../shared/types/clothing.types';
import { theme } from '../../../shared/theme';
import type { RootStackParamList } from '../../../app/navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OutfitListScreen() {
  const navigation = useNavigation<Nav>();

  const [searchQuery, setSearchQuery]       = useState('');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | null>(null);
  const [aiFilter, setAiFilter]             = useState<boolean | null>(null);
  const [seasonFilter, setSeasonFilter]     = useState<string | null>(null);
  const [styleFilter, setStyleFilter]       = useState<string | null>(null);
  const [occasionFilter, setOccasionFilter] = useState<string | null>(null);

  const filterParams = useMemo(() => ({
    ...(favoriteFilter !== null && { isFavorite: favoriteFilter }),
    ...(aiFilter !== null && { aiGenerated: aiFilter }),
    ...(seasonFilter && { season: seasonFilter }),
    ...(styleFilter && { style: styleFilter }),
    ...(occasionFilter && { occasion: occasionFilter }),
  }), [favoriteFilter, aiFilter, seasonFilter, styleFilter, occasionFilter]);

  const {
    data, isLoading, isFetchingNextPage, fetchNextPage,
    hasNextPage, isError, refetch,
  } = useInfiniteOutfits(filterParams);

  const { mutate: addFavorite } = useAddFavorite();
  const { mutate: removeFavorite } = useRemoveFavorite();

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

  function clearFilters() {
    setSearchQuery('');
    setFavoriteFilter(null);
    setAiFilter(null);
    setSeasonFilter(null);
    setStyleFilter(null);
    setOccasionFilter(null);
  }

  const filterGroups = useMemo<FilterGroupConfig[]>(() => [
    {
      label: 'Favoriler',
      options: [
        { label: 'Tümü',       isActive: favoriteFilter === null, onPress: () => setFavoriteFilter(null) },
        { label: '★ Favoriler', isActive: favoriteFilter === true, onPress: () => setFavoriteFilter(favoriteFilter === true ? null : true), color: '#F59E0B' },
      ],
    },
    {
      label: 'Kaynak',
      options: [
        { label: 'Tümü',          isActive: aiFilter === null,  onPress: () => setAiFilter(null) },
        { label: '✨ AI Üretildi', isActive: aiFilter === true,  onPress: () => setAiFilter(aiFilter === true  ? null : true),  color: theme.colors.accent },
        { label: 'Manuel',        isActive: aiFilter === false, onPress: () => setAiFilter(aiFilter === false ? null : false) },
      ],
    },
    {
      label: 'Mevsim',
      scrollable: true,
      options: [
        { label: 'Tümü', isActive: seasonFilter === null, onPress: () => setSeasonFilter(null) },
        ...OUTFIT_SEASONS.map(s => ({
          label: SEASON_LABELS[s] ?? s,
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
    {
      label: 'Etkinlik',
      scrollable: true,
      options: [
        { label: 'Tümü', isActive: occasionFilter === null, onPress: () => setOccasionFilter(null) },
        ...OUTFIT_OCCASIONS.map(o => ({
          label: o,
          isActive: occasionFilter === o,
          onPress: () => setOccasionFilter(occasionFilter === o ? null : o),
        })),
      ],
    },
  ], [favoriteFilter, aiFilter, seasonFilter, styleFilter, occasionFilter]);

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];
    if (favoriteFilter === true) chips.push({ label: '★ Favoriler', onRemove: () => setFavoriteFilter(null) });
    if (aiFilter === true)  chips.push({ label: '✨ AI Üretildi', onRemove: () => setAiFilter(null) });
    if (aiFilter === false) chips.push({ label: 'Manuel', onRemove: () => setAiFilter(null) });
    if (seasonFilter !== null) chips.push({ label: SEASON_LABELS[seasonFilter] ?? seasonFilter, onRemove: () => setSeasonFilter(null) });
    if (styleFilter !== null)  chips.push({ label: CLOTHING_STYLE_LABELS[styleFilter as keyof typeof CLOTHING_STYLE_LABELS] ?? styleFilter, onRemove: () => setStyleFilter(null) });
    if (occasionFilter !== null) chips.push({ label: occasionFilter, onRemove: () => setOccasionFilter(null) });
    return chips;
  }, [favoriteFilter, aiFilter, seasonFilter, styleFilter, occasionFilter]);

  const activeCount =
    (favoriteFilter !== null ? 1 : 0) +
    (aiFilter !== null ? 1 : 0) +
    (seasonFilter !== null ? 1 : 0) +
    (styleFilter !== null ? 1 : 0) +
    (occasionFilter !== null ? 1 : 0);

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
            <Text style={styles.title}>Kombinlerim</Text>
            {!isLoading && totalCount > 0 && (
              <Text style={styles.countText}>
                {hasActiveFilters ? `${filteredItems.length} / ${totalCount}` : totalCount} kombin
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={() => navigation.navigate('GenerateOutfit')}
            activeOpacity={0.85}
          >
            <Text style={styles.generateBtnText}>✦ AI Kombin</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>⊕</Text>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Kombin adı veya açıklama ara..."
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

        {/* Initial loading */}
        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Kombinler yükleniyor...</Text>
          </View>
        )}

        {/* Error */}
        {isError && (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>⚠</Text>
            <Text style={styles.errorText}>Bir hata oluştu.</Text>
            <TouchableOpacity onPress={() => refetch()} activeOpacity={0.7}>
              <Text style={styles.retryText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !isError && totalCount === 0 && !hasActiveFilters && (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>✦</Text>
            <Text style={styles.emptyTitle}>Henüz kombin yok</Text>
            <Text style={styles.emptySubtitle}>AI ile ilk kombini oluştur.</Text>
            <TouchableOpacity
              style={styles.generateBtn}
              onPress={() => navigation.navigate('GenerateOutfit')}
              activeOpacity={0.85}
            >
              <Text style={styles.generateBtnText}>✦ AI Kombin Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty filter result */}
        {!isLoading && !isError && filteredItems.length === 0 && hasActiveFilters && (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>⊕</Text>
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptySubtitle}>Filtrelerle eşleşen kombin yok.</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>✕ Filtreleri Temizle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* List */}
        {!isLoading && !isError && filteredItems.length > 0 && (
          <FlatList
            style={styles.list}
            data={filteredItems}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <OutfitCard
                item={item}
                onPress={() => navigation.navigate('OutfitDetail', { id: item.id })}
                onFavorite={addFavorite}
                onUnfavorite={removeFavorite}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.text, lineHeight: 30 },
  countText: { fontSize: 12, color: theme.colors.textMuted, marginTop: 3 },
  generateBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: theme.radius.md },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, paddingHorizontal: 14, marginBottom: 14, gap: 10,
  },
  searchIcon: { fontSize: 15, color: theme.colors.textMuted },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: theme.colors.text },
  clearIcon: { fontSize: 13, color: theme.colors.textMuted, padding: 4 },
  filterWrapper: { marginBottom: 16 },
  clearBtn: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7, borderRadius: theme.radius.full, backgroundColor: theme.colors.errorBg },
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
