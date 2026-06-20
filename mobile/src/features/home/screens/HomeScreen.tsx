import React from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { AppNavigationProp } from '../../../app/navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

const outfitImage = require('../../../../assets/images/main/luxury 2.png');
const sneakersImage = require('../../../../assets/images/main/White sneakers.png');
const necklaceImage = require('../../../../assets/images/main/Gold necklace.png');
const shirtImage = require('../../../../assets/images/main/Summer Shirt.png');

const RECENT_ITEMS = [
  { id: '1', image: sneakersImage, name: 'Beyaz Spor Ayakkabı', category: 'Ayakkabı' },
  { id: '2', image: necklaceImage, name: 'Altın Zincir', category: 'Aksesuarlar' },
  { id: '3', image: shirtImage, name: 'İpek Bluz', category: 'Üstler' },
];

const QUICK_ACTIONS: { icon: React.ComponentProps<typeof Ionicons>['name'] | null; label: string }[] = [
  { icon: 'scan-outline', label: 'Yeni Kıyafet Tara' },
  { icon: 'calendar-outline', label: 'Haftayı Planla' },
  { icon: 'sparkles', label: 'AI ile Sohbet' },
  { icon: null, label: '' },
];

export function HomeScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingSmall}>Günaydın,</Text>
          <Text style={styles.greetingName}>Arda</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={24} color="#6E655C" />
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      {/* Weather Pill */}
      <View style={styles.weatherPill}>
        <Ionicons name="sunny" size={18} color="#C9A86A" />
        <Text style={styles.weatherText}>Güneşli, 29°C</Text>
        <View style={styles.weatherDivider} />
        <Text style={styles.locationText}>Ataşehir</Text>
      </View>

      {/* Bugünün Görünümü */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Bugünün Görünümü</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('OutfitDetail', { id: 'today' })}>
          <Text style={[styles.moreText, { marginTop: 0 }]}>Daha Fazla</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.outfitCard}>
        <Image source={outfitImage} style={styles.outfitImage} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.60)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.styleBadge}>
          <Text style={styles.styleBadgeText}>Luxury</Text>
        </View>
        <View style={styles.outfitInfo}>
          <View style={styles.outfitTextWrap}>
            <Text style={styles.outfitTitle}>Bej Trençkot & Kumaş Pantolon</Text>
            <Text style={styles.outfitDesc}>Güneşli bir kahve molası için mükemmel.</Text>
          </View>
          <TouchableOpacity style={styles.outfitCheckBtn} activeOpacity={0.85}>
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hızlı Eylemler */}
      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Hızlı Eylemler</Text>
      <View style={styles.quickActionsRow}>
        {QUICK_ACTIONS.map((action, index) => (
          <View key={index} style={styles.quickActionItem}>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.85}>
              {action.icon && (
                <View style={styles.quickActionCircle}>
                  <Ionicons name={action.icon} size={24} color="#C9A86A" />
                </View>
              )}
            </TouchableOpacity>
            {!!action.label && (
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Dolap Kullanımı */}
      <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Dolap Kullanımı</Text>
      <View style={styles.wardrobeCard}>
        <View style={styles.wardrobeTopRow}>
          <View style={styles.wardrobeIconCircle}>
            <Ionicons name="pie-chart" size={24} color="#C9A86A" />
          </View>
          <View style={styles.wardrobeTopText}>
            <Text style={styles.wardrobeUsageText}>
              <Text style={styles.wardrobeUsageMuted}>Bu ay gardırobunuzun </Text>
              <Text style={styles.wardrobePercent}>60%</Text>
              <Text style={styles.wardrobeUsageMuted}> giydiniz.</Text>
            </Text>
            <View style={styles.wardrobeTrendRow}>
              <Ionicons name="trending-up" size={14} color="#22C55E" />
              <Text style={styles.wardrobeTrendText}>Geçen aya göre +%5</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              <Text style={styles.progressLabelBold}>En Çok Giyilenler:</Text>
              <Text style={styles.progressLabelMuted}> Blazer ve Tişörtler</Text>
            </Text>
            <Text style={styles.progressPercentGold}>82%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '82%', backgroundColor: '#C9A86A' }]} />
          </View>

          <View style={[styles.progressRow, { marginTop: 18 }]}>
            <Text style={styles.progressLabel}>
              <Text style={styles.progressLabelBold}>En Az Giyilenler: </Text>
              <Text style={styles.progressLabelMuted}>Ceketler</Text>
            </Text>
            <Text style={styles.progressPercentMuted}>12%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '12%', backgroundColor: '#9C8C84' }]} />
          </View>
        </View>
      </View>

      {/* Son Eklenenler */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, styles.sectionSpacing]}>Son Eklenenler</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.moreText}>Daha Fazla</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentRow}
      >
        {RECENT_ITEMS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.recentItem} activeOpacity={0.85}>
            <View style={styles.recentThumb}>
              <Image source={item.image} style={styles.recentImage} resizeMode="cover" />
            </View>
            <Text style={styles.recentName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.recentCategory}>{item.category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 105,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
  },
  greetingSmall: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#4A403A',
  },
  greetingName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    color: '#4A403A',
  },
  bellButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9A86A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C9A86A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Weather Pill
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 6,
    shadowColor: '#C9A86A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
  },
  weatherText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#1F1F1F',
  },
  weatherDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(212,163,115,0.2)',
    marginHorizontal: 2,
  },
  locationText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#6E655C',
  },

  // Section
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    lineHeight: 28,
    color: '#4A403A',
    marginTop: 24,
  },
  sectionSpacing: {
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  moreText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#9C8C84',
    marginTop: 28,
  },

  // Outfit Card
  outfitCard: {
    width: '100%',
    height: 433,
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 12,
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  styleBadge: {
    position: 'absolute',
    left: 17,
    bottom: 94,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  styleBadgeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
  },
  outfitInfo: {
    position: 'absolute',
    left: 17,
    right: 17,
    bottom: 32,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  outfitTextWrap: {
    flex: 1,
  },
  outfitTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    lineHeight: 28,
    color: '#FFFFFF',
  },
  outfitDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  outfitCheckBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickActionBtn: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#9C8C84',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4A403A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 8,
    lineHeight: 12,
    color: '#4A403A',
    textAlign: 'center',
  },

  // Wardrobe Card
  wardrobeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    marginTop: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wardrobeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  wardrobeIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4A403A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wardrobeTopText: {
    flex: 1,
    paddingTop: 2,
  },
  wardrobeUsageText: {
    flexShrink: 1,
  },
  wardrobeUsageMuted: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 23,
    color: '#9C8C84',
  },
  wardrobePercent: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    lineHeight: 23,
    color: '#C9A86A',
  },
  wardrobeTrendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  wardrobeTrendText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#4A403A',
  },

  // Progress bars
  progressSection: {
    marginTop: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  progressLabelBold: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#4A403A',
    fontSize: 12,
    lineHeight: 16,
  },
  progressLabelMuted: {
    fontFamily: 'Poppins_400Regular',
    color: '#9C8C84',
    fontSize: 12,
    lineHeight: 16,
  },
  progressPercentGold: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    lineHeight: 16,
    color: '#C9A86A',
  },
  progressPercentMuted: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    lineHeight: 16,
    color: '#9C8C84',
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(250,237,205,0.5)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: 9999,
  },

  // Son Eklenenler
  recentRow: {
    paddingTop: 12,
    gap: 16,
    paddingBottom: 4,
  },
  recentItem: {
    width: 128,
  },
  recentThumb: {
    width: 128,
    height: 128,
    borderRadius: 24,
    backgroundColor: 'rgba(201,168,106,0.5)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentImage: {
    width: 112,
    height: 112,
    borderRadius: 8,
  },
  recentName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 20,
    color: '#1F1F1F',
    marginTop: 8,
  },
  recentCategory: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#9C8C84',
  },
});
