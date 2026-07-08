import React from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import type { AppNavigationProp } from '../../../app/navigation/types';

const outfitImage   = require('../../../../assets/images/main/luxury 2.png');
const shirtImage    = require('../../../../assets/images/main/Summer Shirt.png');
const sneakersImage = require('../../../../assets/images/main/White sneakers.png');
const necklaceImage = require('../../../../assets/images/main/Gold necklace.png');

const OUTFIT_ITEMS = [
  { id: '1', label: 'Üst',      image: shirtImage,    active: true  },
  { id: '2', label: 'Alt',      image: null,           active: false },
  { id: '3', label: 'Ayakkabı', image: sneakersImage,  active: false },
  { id: '4', label: 'Aksesuar', image: necklaceImage,  active: false },
];

export function OutfitDetailScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets     = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header sabit ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.96)" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Kıyafet Detayı</Text>

        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
          <Ionicons name="ellipsis-vertical" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
      >
        {/* ── Main Image Card ── */}
        <View style={styles.imageCard}>
          <Image source={outfitImage} style={styles.outfitImage} resizeMode="cover" />

          {/* Bottom gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0.60)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={[StyleSheet.absoluteFill, styles.gradientOverlay]}
          />

          {/* Bookmark button — top right of image */}
          <BlurView intensity={40} tint="light" style={styles.bookmarkBtn}>
            <Ionicons name="bookmark-outline" size={16} color="#FFFFFF" />
          </BlurView>

          {/* Tag pills — bottom of image */}
          <View style={styles.tagRow}>
            <BlurView intensity={40} tint="light" style={styles.tagPill}>
              <Ionicons name="sunny" size={14} color="#FFFFFF" />
              <Text style={styles.tagText}>Güneşli</Text>
            </BlurView>
            <BlurView intensity={40} tint="light" style={styles.tagPill}>
              <Ionicons name="briefcase-outline" size={14} color="#FFFFFF" />
              <Text style={styles.tagText}>Ofis</Text>
            </BlurView>
          </View>
        </View>

        {/* ── Bu Görünümdeki Öğeler ── */}
        <View style={styles.itemsSection}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Bu Görünümdeki Öğeler</Text>
            <Text style={styles.itemCount}>4 ürün</Text>
          </View>

          <View style={styles.itemsRow}>
            {OUTFIT_ITEMS.map((item) => (
              <View key={item.id} style={styles.itemCol}>
                <View style={[styles.itemRing, item.active && styles.itemRingActive]}>
                  {item.image ? (
                    <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.itemPlaceholder}>
                      <Ionicons name="shirt-outline" size={20} color="#9C8C84" />
                    </View>
                  )}
                </View>
                <Text style={[styles.itemLabel, item.active && styles.itemLabelActive]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Renk Uyumu Card ── */}
        <View style={styles.colorCard}>
          <View style={styles.colorCardTop}>
            <Text style={styles.colorCardTitle}>Renk Uyumu</Text>
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>94% Uyum</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <LinearGradient
              colors={['rgba(212,163,115,0.60)', '#D4A373', '#D4A373']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressFill}
            />
          </View>

          <Text style={styles.colorDesc}>
            Bej renkli trençkot, altın detayların görünümü boğmadan sıcaklık katmasına olanak tanıyan mükemmel bir nötr taban oluşturuyor.
          </Text>
        </View>

        {/* ── Butonlar scroll ile birlikte iner ── */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.85}>
            <MaterialCommunityIcons name="hanger" size={22} color="#D4A373" />
            <Text style={styles.btnSecondaryText}>Öğeyi Değiştir</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnPrimary} activeOpacity={0.85}>
            <Ionicons name="checkmark" size={22} color="#FFFFFF" />
            <Text style={styles.btnPrimaryText}>Görünümü Kaydet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  content: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    lineHeight: 28,
    color: '#4A403A',
  },

  // Image Card
  imageCard: {
    width: '100%',
    height: 458,
    borderRadius: 30,
    overflow: 'hidden',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 9999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
  },
  tagRow: {
    position: 'absolute',
    bottom: 20,
    left: 28,
    flexDirection: 'row',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 9999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  tagText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
  },

  // Items Section
  itemsSection: {
    marginTop: 24,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 28,
    color: '#4A403A',
  },
  itemCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#9C8C84',
  },
  itemsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  itemCol: {
    alignItems: 'center',
    width: 80,
  },
  itemRing: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemRingActive: {
    borderColor: '#C9A86A',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 16,
    color: '#9C8C84',
    marginTop: 8,
    textAlign: 'center',
  },
  itemLabelActive: {
    color: '#4A403A',
  },

  // Color Card
  colorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.50)',
    shadowColor: '#D4A373',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 4,
  },
  colorCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorCardTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    lineHeight: 24,
    color: '#4A403A',
  },
  matchBadge: {
    backgroundColor: 'rgba(212,163,115,0.10)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  matchText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    color: '#C9A86A',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#FAEDCD',
    borderRadius: 9999,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    width: '94%',
    height: '100%',
    borderRadius: 9999,
  },
  colorDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 19.5,
    color: '#9C8C84',
    marginTop: 12,
  },

  // Bottom Buttons (scroll içinde)
  bottomBar: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  btnSecondary: {
    flex: 1,
    height: 58,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  btnSecondaryText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 24,
    color: '#4A403A',
  },
  btnPrimary: {
    flex: 1,
    height: 58,
    borderRadius: 24,
    backgroundColor: '#D4A373',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#D4A373',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30,
    shadowRadius: 15,
    elevation: 6,
  },
  btnPrimaryText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
