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

const shirtImage    = require('../../../../assets/images/main/Summer Shirt.png');
const luxuryImage   = require('../../../../assets/images/main/luxury 2.png');
const necklaceImage = require('../../../../assets/images/main/Gold necklace.png');
const sneakersImage = require('../../../../assets/images/main/White sneakers.png');

type MissingItem = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  description: string;
  unlocksCount: number;
  pairImages: ImageSourcePropType[];
  isTopPick?: boolean;
  owned: boolean;
};

const ITEMS: MissingItem[] = [
  {
    id: '1',
    name: 'Beyaz Keten Gömlek',
    image: shirtImage,
    description: 'Desenli etekler ile hafta sonu kombinlerini birbirine bağlar.',
    unlocksCount: 6,
    pairImages: [luxuryImage, sneakersImage, necklaceImage],
    isTopPick: true,
    owned: false,
  },
  {
    id: '2',
    name: 'Klasik Trençkot',
    image: luxuryImage,
    description: 'Gündelik katmanlarını anında yükseltir. Geçiş havaları için vazgeçilmez.',
    unlocksCount: 4,
    pairImages: [shirtImage, sneakersImage],
    owned: false,
  },
  {
    id: '3',
    name: 'Altın Zincir Kolye',
    image: necklaceImage,
    description: 'Sade tişörtleri kasıtlı ve şık hissettiren son dokunuş.',
    unlocksCount: 3,
    pairImages: [shirtImage, luxuryImage],
    owned: false,
  },
];

const SCORE = 78;
const UNLOCK_COUNT = 13;

export function MissingPiecesScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const [owned, setOwned] = useState<Record<string, boolean>>({});

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

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FDFBF7' }} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => { showTabBar(); navigation.goBack(); }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#4A403A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eksik Parçalar</Text>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={20} color="#4A403A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 32 }]}
      >
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <View style={styles.heroIconRow}>
              <Ionicons name="sparkles" size={18} color="#C9A86A" />
            </View>
            <Text style={styles.heroTitle}>
              {UNLOCK_COUNT} Yeni Kombin{'\n'}Aç
            </Text>
            <Text style={styles.heroDesc}>
              Dolap çeşitlilik skorun{' '}
              <Text style={styles.heroScoreBold}>{SCORE}%</Text>
              {'. Bu 3 temel parça, mevcut "yetim" parçalarını tutarlı kombinlere dönüştürür.'}
            </Text>
          </View>
          <View style={styles.heroRight}>
            <View style={styles.scoreRing}>
              <Text style={styles.scoreNum}>
                {SCORE}<Text style={styles.scorePct}>%</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Item cards */}
        {ITEMS.map((item) => {
          const isOwned = owned[item.id] ?? item.owned;
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardImageWrap}>
                <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                {item.isTopPick && (
                  <View style={styles.topPickBadge}>
                    <Text style={styles.topPickText}>TOP{'\n'}PICK</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

                {/* Unlocks row */}
                <View style={styles.unlocksRow}>
                  <Text style={styles.unlocksIcon}>👗</Text>
                  <Text style={styles.unlocksText}>
                    <Text style={styles.unlocksBold}>{item.unlocksCount} Kombin</Text> Açar
                  </Text>
                </View>

                {/* Pair thumbnails */}
                <View style={styles.pairRow}>
                  {item.pairImages.map((img, idx) => (
                    <View
                      key={idx}
                      style={[styles.pairThumb, { marginLeft: idx === 0 ? 0 : -8 }]}
                    >
                      <Image source={img} style={styles.pairThumbImg} resizeMode="cover" />
                    </View>
                  ))}
                  {item.pairImages.length > 2 && (
                    <View style={[styles.pairThumb, styles.pairExtra, { marginLeft: -8 }]}>
                      <Text style={styles.pairExtraText}>+{item.pairImages.length - 2}</Text>
                    </View>
                  )}
                </View>

                {/* Buttons */}
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.btnOwn, isOwned && styles.btnOwnActive]}
                    activeOpacity={0.8}
                    onPress={() => setOwned(o => ({ ...o, [item.id]: !o[item.id] }))}
                  >
                    <Text style={[styles.btnOwnText, isOwned && styles.btnOwnTextActive]}>
                      {isOwned ? 'Sahibim ✓' : 'Sahibim'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnCombine} activeOpacity={0.8}>
                    <Text style={styles.btnCombineText}>Kombinleri Gör</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
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
  filterBtn: {
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  /* Hero */
  heroCard: {
    backgroundColor: '#F0EDE8',
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroLeft: {
    flex: 1,
  },
  heroIconRow: {
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: '#4A403A',
    marginBottom: 8,
  },
  heroDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#9C8C84',
  },
  heroScoreBold: {
    fontFamily: 'Poppins_700Bold',
    color: '#C9A86A',
  },
  heroRight: {
    alignItems: 'center',
  },
  scoreRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  scoreNum: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#4A403A',
    lineHeight: 26,
    textAlignVertical: 'center',
  },
  scorePct: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#9C8C84',
  },

  /* Item Card */
  card: {
    flexDirection: 'row',
    height: 185,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 14,
  },
  cardImageWrap: {
    width: 110,
    height: 185,
    backgroundColor: '#F5F2ED',
  },
  cardImage: {
    width: 110,
    height: 185,
  },
  topPickBadge: {
    position: 'absolute',
    top: 10,
    right: 8,
    backgroundColor: '#C9A86A',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  topPickText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 12,
  },

  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#4A403A',
    marginBottom: 3,
  },
  cardDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#9C8C84',
    marginBottom: 8,
  },

  unlocksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  unlocksIcon: {
    fontSize: 14,
  },
  unlocksText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
  },
  unlocksBold: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#4A403A',
  },

  /* Pair thumbnails */
  pairRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pairThumb: {
    width: 28,
    height: 28,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#F0EDE8',
  },
  pairThumbImg: {
    width: '100%',
    height: '100%',
  },
  pairExtra: {
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairExtraText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#9C8C84',
  },

  /* Buttons */
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnOwn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0D8D0',
    alignItems: 'center',
  },
  btnOwnActive: {
    borderColor: '#C9A86A',
    backgroundColor: 'rgba(201,168,106,0.08)',
  },
  btnOwnText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#9C8C84',
  },
  btnOwnTextActive: {
    color: '#C9A86A',
  },
  btnCombine: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
  },
  btnCombineText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});
