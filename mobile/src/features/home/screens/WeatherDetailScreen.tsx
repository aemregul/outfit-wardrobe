import React from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import type { AppNavigationProp } from '../../../app/navigation/types';

const backArrowIcon = require('../../../../assets/icons/vector.png');
const trenchImage   = require('../../../../assets/images/kadın/smart casual.jpg');
const sneakersImage = require('../../../../assets/images/main/White sneakers.png');
const shirtImage    = require('../../../../assets/images/main/Summer Shirt.png');

const OUTFIT_SUGGESTIONS = [
  {
    id: '1',
    title: 'Klasik Trenç',
    description: 'Su geçirmez pamuk gabardin kumaş, koyu renk kot pantolonla bir araya getirilerek kusurları gizliyor...',
    tags: ['Su Geçirmez', 'Rüzgar Geçirmez'],
    image: trenchImage,
  },
  {
    id: '2',
    title: 'Şehir Kaşifi',
    description: 'Yüksek tutuşlu tabanlara sahip askeri botlar ve mumlu kanvas ceket',
    tags: ['Kaymaz', 'Sıcak'],
    image: sneakersImage,
  },
  {
    id: '3',
    title: 'Canlı Dokunuş',
    description: 'Gri gökyüzünü canlı renklerde ipek bir eşarp ve nefes alabilen kumaşla aydınlatın...',
    tags: ['Nefes Alabilir', 'Canlı'],
    image: shirtImage,
  },
];

export function WeatherDetailScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header sabit ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Image source={backArrowIcon} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hava Tahmini</Text>
        <View style={styles.backButtonSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
      >
        {/* ── Hava Durumu Kartı ── */}
        <LinearGradient
          colors={['rgba(156,140,132,0.20)', 'rgba(201,168,106,0.60)']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.weatherCard}
        >
          {/* Dekoratif arka plan ikonu */}
          <View style={styles.weatherIconBg}>
            <Ionicons name="rainy" size={112} color="#FDFBF7" />
          </View>

          {/* Sol üst: durum + şehir */}
          <View style={styles.weatherLeft}>
            <Text style={styles.weatherCondition}>Yağmurlu</Text>
            <Text style={styles.weatherCity}>İstanbul, TR</Text>
          </View>

          {/* Sağ üst: derece + hissedilen */}
          <View style={styles.weatherRight}>
            <Text style={styles.weatherTemp}>28°</Text>
            <Text style={styles.weatherFeels}>
              Hissedilen <Text style={styles.weatherFeelsTemp}>24°</Text>
            </Text>
          </View>

          {/* Yağış & Rüzgar satırı */}
          <View style={styles.weatherStats}>
            <View style={styles.weatherStatItem}>
              <Ionicons name="rainy" size={18} color="#60A5FA" />
              <Text style={styles.weatherStatText}>90% Yağış</Text>
            </View>
            <View style={styles.weatherStatItem}>
              <MaterialCommunityIcons name="weather-windy" size={18} color="#9CA3AF" />
              <Text style={styles.weatherStatText}>12 mil/saat Rüzgar</Text>
            </View>
          </View>

          {/* Ayırıcı + AI öngörüsü */}
          <View style={styles.aiSection}>
            <Text style={styles.aiText}>
              <Text style={styles.aiLabel}>AI ÖnGörüsü: </Text>
              Su geçirmez katmanlar ve kapalı burunlu ayakkabılar önerilir. Kumaşların nefes alabilir ancak suya dayanıklı olmasına dikkat edin.
            </Text>
          </View>
        </LinearGradient>

        {/* ── Kıyafet Önerileri Bölümü ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yağmur için seçilmiş</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.customizeText}>Özelleştir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsList}>
          {OUTFIT_SUGGESTIONS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.outfitCard} activeOpacity={0.85}>
              {/* Kıyafet görseli */}
              <View style={styles.outfitImageWrap}>
                <Image source={item.image} style={styles.outfitImage} resizeMode="cover" />
              </View>

              {/* Sağ içerik */}
              <View style={styles.outfitContent}>
                <View style={styles.outfitTopSection}>
                  <View style={styles.outfitTopRow}>
                    <Text style={styles.outfitTitle}>{item.title}</Text>
                    <Ionicons name="heart-outline" size={16} color="#9C8C84" />
                  </View>
                  <Text style={styles.outfitDesc} numberOfLines={3}>
                    {item.description}
                  </Text>
                </View>

                <View style={styles.tagsRow}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
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
  backIcon: {
    width: 6,
    height: 12,
    marginRight: 1,
    tintColor: '#FFFFFF',
  },
  backButtonSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    lineHeight: 28,
    color: '#4A403A',
  },

  // ScrollView content
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Weather Card
  weatherCard: {
    borderRadius: 24,
    padding: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.10,
    shadowRadius: 30,
    elevation: 6,
  },
  weatherIconBg: {
    position: 'absolute',
    right: 20,
    top: 20,
    opacity: 0.20,
  },
  weatherLeft: {
    marginBottom: 4,
  },
  weatherRight: {
    position: 'absolute',
    right: 25,
    top: 25,
    alignItems: 'flex-end',
  },
  weatherCondition: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 25,
    lineHeight: 36,
    color: '#4A403A',
  },
  weatherCity: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    lineHeight: 24,
    color: '#9C8C84',
  },
  weatherTemp: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 36,
    lineHeight: 40,
    color: '#4A403A',
    textAlign: 'right',
  },
  weatherFeels: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 20,
    color: '#9C8C84',
    textAlign: 'right',
  },
  weatherFeelsTemp: {
    fontSize: 14,
  },

  // Stats row
  weatherStats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
  },
  weatherStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.80,
  },
  weatherStatText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#4A403A',
  },

  // AI section
  aiSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  aiText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 22.75,
    color: '#4A403A',
  },
  aiLabel: {
    fontFamily: 'Poppins_700Bold',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    lineHeight: 28,
    color: '#4A403A',
  },
  customizeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: '#C9A86A',
  },

  // Outfit cards
  cardsList: {
    gap: 16,
  },
  outfitCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 17,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  outfitImageWrap: {
    width: 96,
    height: 128,
    borderRadius: 24,
    overflow: 'hidden',
  },
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  outfitContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  outfitTopSection: {
    flex: 1,
  },
  outfitTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  outfitTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    lineHeight: 28,
    color: '#4A403A',
    flex: 1,
  },
  outfitDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#9C8C84',
    marginTop: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(250,237,205,0.50)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.25,
    color: '#4A403A',
    textTransform: 'uppercase',
  },
});
