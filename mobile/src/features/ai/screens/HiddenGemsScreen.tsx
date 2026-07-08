import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { hideTabBar, showTabBar } from '../../../app/navigation/TabBarVisibility';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import type { AppNavigationProp } from '../../../app/navigation/types';

const luxuryImage   = require('../../../../assets/images/main/luxury 2.png');
const shirtImage    = require('../../../../assets/images/main/Summer Shirt.png');
const sneakersImage = require('../../../../assets/images/main/White sneakers.png');
const necklaceImage = require('../../../../assets/images/main/Gold necklace.png');

type GemItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  daysAgo: number;
  suggestion: string;
  suggestionDesc: string;
  pairImages: ImageSourcePropType[];
};

const GEMS: GemItem[] = [
  {
    id: '1',
    name: 'Lüks Parça',
    image: luxuryImage,
    daysAgo: 45,
    suggestion: 'Bununla dene...',
    suggestionDesc: 'Yazlık gömlek ve sneaker ile hem rahat hem şık.',
    pairImages: [shirtImage, sneakersImage],
  },
  {
    id: '2',
    name: 'Altın Kolye',
    image: necklaceImage,
    daysAgo: 32,
    suggestion: 'Tazele...',
    suggestionDesc: 'Yazlık gömlek ile zarifçe öne çık.',
    pairImages: [shirtImage],
  },
  {
    id: '3',
    name: 'Beyaz Sneaker',
    image: sneakersImage,
    daysAgo: 28,
    suggestion: 'Kombini kur...',
    suggestionDesc: 'Gündelik kombin için gömlek ile tamamla.',
    pairImages: [luxuryImage, shirtImage],
  },
  {
    id: '4',
    name: 'Yazlık Gömlek',
    image: shirtImage,
    daysAgo: 21,
    suggestion: 'Yeniden keşfet...',
    suggestionDesc: 'Altın aksesuar ile sofistike bir görünüm yarat.',
    pairImages: [necklaceImage, sneakersImage],
  },
];

function dayLabel(days: number): string {
  return `${days} gündür giyilmedi`;
}

function dayBadgeColor(days: number): string {
  if (days >= 45) return '#EF4444';
  if (days >= 30) return '#F59E0B';
  return '#C9A86A';
}

export function HiddenGemsScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      hideTabBar();
      return () => showTabBar();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
  }, [navigation]);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
  });
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FDFBF7' }} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => { showTabBar(); navigation.goBack(); }} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color="#4A403A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gizli Hazineler</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 32 }]}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="diamond-outline" size={28} color="#C9A86A" />
          </View>
          <Text style={styles.heroTitle}>Dolabını Yeniden Keşfet</Text>
          <Text style={styles.heroDesc}>
            Bu parçalar 20+ gündür giyilmedi. Onları yeni kombinlerle hayata döndür.
          </Text>
        </View>

        {/* Count */}
        <Text style={styles.countLabel}>{GEMS.length} parça seni bekliyor</Text>

        {/* Gem cards */}
        {GEMS.map((item) => (
          <View key={item.id} style={styles.card}>
            {/* Badge row */}
            <View style={styles.cardTop}>
              <View style={[styles.daysBadge, { borderColor: dayBadgeColor(item.daysAgo) + '40' }]}>
                <View style={[styles.daysDot, { backgroundColor: dayBadgeColor(item.daysAgo) }]} />
                <Text style={[styles.daysText, { color: dayBadgeColor(item.daysAgo) }]}>
                  {dayLabel(item.daysAgo)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSaved(s => ({ ...s, [item.id]: !s[item.id] }))}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={saved[item.id] ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={saved[item.id] ? '#C9A86A' : '#C4B8AF'}
                />
              </TouchableOpacity>
            </View>

            {/* Content row */}
            <View style={styles.cardBody}>
              {/* Left: item */}
              <View style={styles.itemLeft}>
                <View style={styles.itemImgWrap}>
                  <Image source={item.image} style={styles.itemImg} resizeMode="cover" />
                </View>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              </View>

              {/* Plus */}
              <View style={styles.plusWrap}>
                <Ionicons name="add" size={20} color="#C4B8AF" />
              </View>

              {/* Right: suggestion */}
              <View style={styles.suggestionRight}>
                <Text style={styles.suggestionTitle}>{item.suggestion}</Text>
                <Text style={styles.suggestionDesc} numberOfLines={2}>{item.suggestionDesc}</Text>

                {/* Pair thumbnails */}
                <View style={styles.pairRow}>
                  {item.pairImages.map((img, idx) => (
                    <View key={idx} style={styles.pairImgWrap}>
                      <Image source={img} style={styles.pairImg} resizeMode="cover" />
                    </View>
                  ))}
                </View>

                {/* CTA */}
                <TouchableOpacity style={styles.viewBtn} activeOpacity={0.8}>
                  <Text style={styles.viewBtnText}>Kombini Gör</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#4A403A',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  /* Hero */
  heroCard: {
    backgroundColor: '#F0EDE8',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  heroTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#4A403A',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#9C8C84',
    textAlign: 'center',
  },

  /* Count */
  countLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#9C8C84',
    marginBottom: 14,
    letterSpacing: 0.3,
  },

  /* Gem Card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  daysBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDFBF7',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  daysDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  daysText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },

  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 0,
  },

  /* Item (left) */
  itemLeft: {
    width: 100,
    alignItems: 'center',
  },
  itemImgWrap: {
    width: 92,
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F0EDE8',
    marginBottom: 8,
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  itemName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#4A403A',
    textAlign: 'center',
  },

  /* Plus */
  plusWrap: {
    width: 32,
    alignItems: 'center',
    paddingTop: 42,
  },

  /* Suggestion (right) */
  suggestionRight: {
    flex: 1,
    paddingTop: 2,
  },
  suggestionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#4A403A',
    marginBottom: 4,
  },
  suggestionDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#9C8C84',
    marginBottom: 10,
  },

  /* Pair thumbnails */
  pairRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  pairImgWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F0EDE8',
  },
  pairImg: {
    width: '100%',
    height: '100%',
  },

  /* CTA */
  viewBtn: {
    backgroundColor: '#C9A86A',
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  viewBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
});
