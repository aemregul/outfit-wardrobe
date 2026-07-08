import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, StyleSheet, ScrollView, Animated, Modal,
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

const CATEGORY_ICONS: Record<ClothingCategory, string> = {
  TOP: 'shirt-outline', BOTTOM: 'layers-outline', OUTERWEAR: 'cloud-outline',
  SHOES: 'footsteps-outline', BAG: 'bag-outline', ACCESSORY: 'watch-outline',
  JEWELRY: 'diamond-outline', DRESS: 'woman-outline', SUIT: 'briefcase-outline',
  SPORTSWEAR: 'barbell-outline', SPECIAL_OCCASION: 'star-outline',
  UNDERWEAR: 'shirt-outline', OTHER: 'ellipsis-horizontal-outline',
};

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
  const [filterVisible, setFilterVisible] = useState(false);
  const sheetAnim = useRef(new Animated.Value(500)).current;

  const openFilter = useCallback(() => {
    setFilterVisible(true);
    Animated.spring(sheetAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
  }, [sheetAnim]);

  const closeFilter = useCallback(() => {
    Animated.timing(sheetAnim, { toValue: 500, duration: 220, useNativeDriver: true }).start(
      () => setFilterVisible(false),
    );
  }, [sheetAnim]);

  const selectCategory = useCallback((cat: ClothingCategory | null) => {
    setCategoryFilter(cat);
    closeFilter();
  }, [closeFilter]);

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

      {/* ── Kategori özeti ── */}
      <View style={styles.summaryRow}>
        {[
          { label: 'Üst', icon: 'shirt-outline', count: displayItems.filter(i => i.category === 'TOP').length },
          { label: 'Alt', icon: 'layers-outline', count: displayItems.filter(i => i.category === 'BOTTOM').length },
          { label: 'Dış', icon: 'cloud-outline', count: displayItems.filter(i => i.category === 'OUTERWEAR').length },
          { label: 'Ayakkabı', icon: 'footsteps-outline', count: displayItems.filter(i => i.category === 'SHOES').length },
          { label: 'Aksesuar', icon: 'diamond-outline', count: displayItems.filter(i => i.category === 'JEWELRY' || i.category === 'ACCESSORY').length },
        ].map(stat => (
          <View key={stat.label} style={styles.summaryCard}>
            <Ionicons name={stat.icon as any} size={16} color="#C9A86A" />
            <Text style={styles.summaryCount}>{stat.count}</Text>
            <Text style={styles.summaryLabel}>{stat.label}</Text>
          </View>
        ))}
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
        <TouchableOpacity
          style={[styles.filterButton, categoryFilter !== null && styles.filterButtonActive]}
          activeOpacity={0.8}
          onPress={openFilter}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={categoryFilter !== null ? '#FFFFFF' : '#4A403A'}
          />
        </TouchableOpacity>
      </View>

      {/* ── Filtre Modal ── */}
      <Modal transparent visible={filterVisible} onRequestClose={closeFilter} statusBarTranslucent>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeFilter} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Kategoriye Göre Filtrele</Text>
              {categoryFilter !== null && (
                <TouchableOpacity onPress={() => selectCategory(null)}>
                  <Text style={styles.sheetClear}>Temizle</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {CLOTHING_CATEGORIES.map(cat => {
                const isActive = categoryFilter === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.sheetRow, isActive && styles.sheetRowActive]}
                    activeOpacity={0.75}
                    onPress={() => selectCategory(cat)}
                  >
                    <View style={[styles.sheetIconWrap, isActive && styles.sheetIconWrapActive]}>
                      <Ionicons
                        name={CATEGORY_ICONS[cat] as any}
                        size={18}
                        color={isActive ? '#FFFFFF' : '#C9A86A'}
                      />
                    </View>
                    <Text style={[styles.sheetRowLabel, isActive && styles.sheetRowLabelActive]}>
                      {CATEGORY_LABELS[cat]}
                    </Text>
                    {isActive && <Ionicons name="checkmark" size={18} color="#C9A86A" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

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
          ListHeaderComponent={
            categoryFilter !== null ? (
              <View style={styles.activeFilterBar}>
                <Ionicons name="funnel" size={13} color="#C9A86A" />
                <Text style={styles.activeFilterText}>{CATEGORY_LABELS[categoryFilter]}</Text>
                <TouchableOpacity onPress={() => setCategoryFilter(null)} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color="#C9A86A" />
                </TouchableOpacity>
              </View>
            ) : null
          }
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
    height: 50,
    gap: 10,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4A403A',
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#C9A86A',
  },

  // Active filter bar
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(201,168,106,0.10)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  activeFilterText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#C9A86A',
  },

  // Filter modal / bottom sheet
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74,64,58,0.45)',
  },
  sheet: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D0C8',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  sheetTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#4A403A',
  },
  sheetClear: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#C9A86A',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  sheetRowActive: {
    backgroundColor: 'rgba(201,168,106,0.08)',
  },
  sheetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(201,168,106,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetIconWrapActive: {
    backgroundColor: '#C9A86A',
  },
  sheetRowLabel: {
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#4A403A',
  },
  sheetRowLabelActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#C9A86A',
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

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 3,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryCount: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
    color: '#4A403A',
  },
  summaryLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    lineHeight: 14,
    color: '#9C8C84',
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 12,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 14,
    elevation: 7,
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
