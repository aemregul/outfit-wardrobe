import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, StyleSheet, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts as usePoppins,
  Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import {
  useFonts as usePlayfair,
  PlayfairDisplay_600SemiBold,
} from '@expo-google-fonts/playfair-display';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';
import { useInfiniteWardrobe, useDeleteClothing } from '../hooks/useWardrobe';
import {
  ClothingCategory, ClothingItemResponse,
  CLOTHING_CATEGORIES, CATEGORY_LABELS,
} from '../../../shared/types/clothing.types';
import type { AppNavigationProp } from '../../../app/navigation/types';

const MOCK_ITEMS: ClothingItemResponse[] = [
  { id: 'm1', userId: '', name: 'İpek Bluz',      imageUrl: undefined, category: 'TOP',       brand: 'Zara',     isClean: true, wearCount: 0, createdAt: '', updatedAt: '', subCategory: 'Üstler' },
  { id: 'm2', userId: '', name: 'Bej Trenç',      imageUrl: undefined, category: 'OUTERWEAR', brand: 'Burberry', isClean: true, wearCount: 0, createdAt: '', updatedAt: '', subCategory: 'Dış Giyim' },
  { id: 'm3', userId: '', name: 'Klasik Ayakkabı',imageUrl: undefined, category: 'SHOES',     brand: 'Nike',     isClean: true, wearCount: 0, createdAt: '', updatedAt: '', subCategory: 'Ayakkabı' },
  { id: 'm4', userId: '', name: 'Altın Zincir',   imageUrl: undefined, category: 'JEWELRY',   brand: 'Mejuri',   isClean: true, wearCount: 0, createdAt: '', updatedAt: '', subCategory: 'Aksesuar' },
  { id: 'm5', userId: '', name: 'Düz Bacak Kot',  imageUrl: undefined, category: 'BOTTOM',    brand: "Levi's",   isClean: true, wearCount: 0, createdAt: '', updatedAt: '', subCategory: 'Altlar' },
  { id: 'm6', userId: '', name: 'Keten Gömlek',   imageUrl: undefined, category: 'TOP',       brand: 'Uniqlo',   isClean: true, wearCount: 0, createdAt: '', updatedAt: '', subCategory: 'Üstler' },
];

const MOCK_IMAGES: Record<string, any> = {
  m1: require('../../../../assets/images/main/Summer Shirt.png'),
  m2: require('../../../../assets/images/kadın/smart casual.jpg'),
  m3: require('../../../../assets/images/main/White sneakers.png'),
  m4: require('../../../../assets/images/main/Gold necklace.png'),
  m5: require('../../../../assets/images/kadın/casual(gündelik).jpg'),
  m6: require('../../../../assets/images/main/Summer Shirt.png'),
};

const CHIPS: { key: ClothingCategory | null; label: string }[] = [
  { key: null, label: 'Tüm Ürünler' },
  ...CLOTHING_CATEGORIES.map(cat => ({ key: cat, label: CATEGORY_LABELS[cat] })),
];

// ── Kıyafet kartı ──────────────────────────────────────────────
function ClothingCardNew({
  item,
  localImage,
  onPress,
}: {
  item: ClothingItemResponse;
  localImage?: any;
  onPress: () => void;
}) {
  const subtitle = [CATEGORY_LABELS[item.category], item.brand].filter(Boolean).join(' • ');
  const imageSource = item.imageUrl ? { uri: item.imageUrl } : localImage;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.cardImageWrap}>
        {imageSource ? (
          <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder} />
        )}
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

// ── Ana ekran ──────────────────────────────────────────────────
export function WardrobeListScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ClothingCategory | null>(null);

  const [poppinsLoaded] = usePoppins({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });
  const [playfairLoaded] = usePlayfair({ PlayfairDisplay_600SemiBold });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLOTHING] });
    }, [queryClient]),
  );

  const filterParams = useMemo(() => ({
    ...(categoryFilter && { category: categoryFilter }),
  }), [categoryFilter]);

  const {
    data, isLoading, isFetchingNextPage,
    fetchNextPage, hasNextPage, isError,
  } = useInfiniteWardrobe(filterParams);

  useDeleteClothing();

  const serverItems = useMemo(
    () => data?.pages.flatMap(page => page.data.content) ?? [],
    [data],
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return serverItems;
    const q = searchQuery.trim().toLowerCase();
    return serverItems.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.brand?.toLowerCase().includes(q),
    );
  }, [serverItems, searchQuery]);

  const totalCount = data?.pages[0]?.data.totalElements ?? 0;
  const displayItems = (isError || filteredItems.length === 0) && !isLoading
    ? MOCK_ITEMS
    : filteredItems;
  const isMock = displayItems === MOCK_ITEMS;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!poppinsLoaded || !playfairLoaded) return <View style={styles.container} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gardırop</Text>
          <Text style={styles.subtitle}>Toplam {isMock ? MOCK_ITEMS.length : totalCount} ürün</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={() => (navigation.navigate as (s: string) => void)('AddClothing')}
        >
          <Ionicons name="add" size={26} color="#4A403A" />
        </TouchableOpacity>
      </View>

      {/* ── Arama + Filtre ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9C8C84" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Kıyafetlerini ara..."
            placeholderTextColor="#9C8C84"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={20} color="#4A403A" />
        </TouchableOpacity>
      </View>

      {/* ── Kategori chip'leri ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContent}
        style={styles.chipsScroll}
      >
        {CHIPS.map(chip => {
          const isActive = categoryFilter === chip.key;
          return (
            <TouchableOpacity
              key={String(chip.key)}
              style={[styles.chip, isActive && styles.chipActive]}
              activeOpacity={0.8}
              onPress={() => setCategoryFilter(chip.key)}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Liste ── */}
      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C9A86A" />
        </View>
      )}

      {!isLoading && (
        <FlatList
          data={displayItems}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={isMock ? undefined : handleEndReached}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <ClothingCardNew
              item={item}
              localImage={isMock ? MOCK_IMAGES[item.id] : undefined}
              onPress={() =>
                (navigation.navigate as (s: string, p: object) => void)(
                  'ClothingDetail', { id: item.id }
                )
              }
            />
          )}
          ListFooterComponent={
            isFetchingNextPage
              ? <ActivityIndicator size="small" color="#C9A86A" style={{ marginVertical: 16 }} />
              : null
          }
        />
      )}
    </View>
  );
}

// ── Stiller ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 30,
    lineHeight: 32,
    color: '#4A403A',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#9C8C84',
    marginTop: 2,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 2,
    elevation: 3,
  },

  // Search row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4A403A',
  },
  filterButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Chips
  chipsScroll: {
    marginBottom: 20,
    flexGrow: 0,
    flexShrink: 0,
  },
  chipsContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,106,0.20)',
  },
  chipActive: {
    backgroundColor: '#C9A86A',
    borderColor: '#C9A86A',
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#9C8C84',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },

  // Grid
  columnWrapper: {
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 14,
  },
  listContent: {
    paddingBottom: 110,
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImageWrap: {
    width: '100%',
    aspectRatio: 139 / 173.75,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(250,237,205,0.30)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(250,237,205,0.30)',
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: '#4A403A',
    marginTop: 10,
  },
  cardSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#9C8C84',
    marginTop: 2,
  },

  // States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#9C8C84',
  },
  addFirstButton: {
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  addFirstText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#EF4444',
  },
  retryText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#C9A86A',
  },
});
