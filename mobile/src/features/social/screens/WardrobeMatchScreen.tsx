import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'WardrobeMatch'>;

interface MatchItem {
  id: string;
  category: string;
  categoryIcon: string;
  name: string;
  color: string;
  matchReason: string;
  matchScore: number;
  imageUrl: string;
  found: boolean;
}

const MOCK_MATCHES: MatchItem[] = [
  {
    id: '1',
    category: 'Üst',
    categoryIcon: 'shirt-outline',
    name: 'Bej Keten Gömlek',
    color: '#D4C5A9',
    matchReason: 'Benzer renk tonu',
    matchScore: 92,
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80',
    found: true,
  },
  {
    id: '2',
    category: 'Alt',
    categoryIcon: 'layers-outline',
    name: 'Karamel Chino',
    color: '#B08850',
    matchReason: 'Aynı renk ailesi',
    matchScore: 88,
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    found: true,
  },
  {
    id: '3',
    category: 'Ayakkabı',
    categoryIcon: 'footsteps-outline',
    name: 'Beyaz Sneaker',
    color: '#F5F5F5',
    matchReason: 'Nötr ton tamamlıyor',
    matchScore: 85,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    found: true,
  },
  {
    id: '4',
    category: 'Çanta',
    categoryIcon: 'bag-outline',
    name: 'Bu kategoride parça yok',
    color: '#E0D5C8',
    matchReason: '',
    matchScore: 0,
    imageUrl: '',
    found: false,
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function MatchScoreRing({ score }: { score: number }) {
  const color = score >= 90 ? '#34C759' : score >= 75 ? '#C9A86A' : '#FF9500';
  return (
    <View style={[styles.scoreRing, { borderColor: color }]}>
      <Text style={[styles.scoreText, { color }]}>{score}%</Text>
    </View>
  );
}

export function WardrobeMatchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<Props['route']>();
  const insets = useSafeAreaInsets();
  const { imageUrl } = route.params;

  const [selectedItems, setSelectedItems] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_MATCHES.filter(m => m.found).map(m => [m.id, m.id])),
  );
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateOutfit = () => {
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      navigation.navigate('OutfitReady', { imageUrl });
    }, 1800);
  };
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  if (!fontsLoaded) return <View style={styles.container} />;

  const foundCount = MOCK_MATCHES.filter(m => m.found).length;
  const totalCount = MOCK_MATCHES.length;
  const overallScore = Math.round(
    MOCK_MATCHES.filter(m => m.found).reduce((sum, m) => sum + m.matchScore, 0) / foundCount,
  );

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.handleWrap}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dolabında Benzerini Bul</Text>
        <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={20} color="#4A403A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 100 }]}
      >
        {/* Referans + özet */}
        <View style={styles.summaryCard}>
          <Image source={{ uri: imageUrl }} style={styles.refImage} resizeMode="cover" />
          <View style={styles.summaryInfo}>
            <View style={styles.summaryBadge}>
              <Ionicons name="sparkles" size={12} color="#C9A86A" />
              <Text style={styles.summaryBadgeText}>AI Eşleşme</Text>
            </View>
            <Text style={styles.summaryTitle}>
              {foundCount}/{totalCount} kategoride{'\n'}eşleşme bulundu
            </Text>
            <View style={styles.summaryScoreRow}>
              <View style={styles.summaryScoreDot} />
              <Text style={styles.summaryScoreLabel}>Genel uyum: </Text>
              <Text style={styles.summaryScoreValue}>{overallScore}%</Text>
            </View>
          </View>
        </View>

        {/* Eşleşme listesi */}
        <Text style={styles.sectionTitle}>Dolabından Öneriler</Text>

        {MOCK_MATCHES.map(item => (
          <View key={item.id} style={[styles.matchCard, !item.found && styles.matchCardMissing]}>
            {/* Sol: kıyafet görseli */}
            {item.found ? (
              <Image source={{ uri: item.imageUrl }} style={styles.matchImage} resizeMode="cover" />
            ) : (
              <View style={styles.matchImageEmpty}>
                <Ionicons name={item.categoryIcon as any} size={28} color="#C9A86A" />
              </View>
            )}

            {/* Orta: bilgi */}
            <View style={styles.matchInfo}>
              <View style={styles.matchCategoryRow}>
                <Ionicons name={item.categoryIcon as any} size={12} color="#C9A86A" />
                <Text style={styles.matchCategory}>{item.category}</Text>
              </View>

              {item.found ? (
                <>
                  <Text style={styles.matchName}>{item.name}</Text>
                  <View style={styles.matchReasonRow}>
                    <View style={[styles.colorSwatch, { backgroundColor: item.color }]} />
                    <Text style={styles.matchReason}>{item.matchReason}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.matchMissingName}>Parça bulunamadı</Text>
                  <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
                    <Ionicons name="add" size={12} color="#C9A86A" />
                    <Text style={styles.addBtnText}>Dolabına Ekle</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Sağ: skor */}
            {item.found ? (
              <MatchScoreRing score={item.matchScore} />
            ) : (
              <View style={styles.missingIcon}>
                <Ionicons name="close-circle" size={24} color="#E0D5C8" />
              </View>
            )}
          </View>
        ))}

        {/* İpucu */}
        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={16} color="#9C8C84" />
          <Text style={styles.tipText}>
            Eşleşme skoru renk tonu, stil ve kategori uyumuna göre hesaplanır.
            Dolabına yeni parçalar ekledikçe daha iyi sonuçlar alırsın.
          </Text>
        </View>
      </ScrollView>

      {/* Sabit alt buton */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.createBtn}
          activeOpacity={0.85}
          onPress={handleCreateOutfit}
          disabled={isCreating}
        >
          <Ionicons name="color-wand-outline" size={18} color="#FFFFFF" />
          <Text style={styles.createBtnText}>Bu Parçalarla Kombin Kur</Text>
        </TouchableOpacity>
      </View>

      {/* Loading overlay */}
      {isCreating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIconWrap}>
              <ActivityIndicator size="large" color="#C9A86A" />
            </View>
            <Text style={styles.loadingTitle}>Kombinin oluşturuluyor…</Text>
            <Text style={styles.loadingSubtitle}>
              Dolabındaki parçalar en iyi şekilde eşleştiriliyor
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#4A403A',
    lineHeight: 24,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingHorizontal: 16,
    gap: 14,
  },

  // Özet kart
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#959595',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  refImage: {
    width: 110,
    height: 130,
  },
  summaryInfo: {
    flex: 1,
    padding: 14,
    gap: 8,
    justifyContent: 'center',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,106,0.12)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.3)',
  },
  summaryBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#C9A86A',
  },
  summaryTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#4A403A',
    lineHeight: 22,
  },
  summaryScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  summaryScoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  summaryScoreLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
  },
  summaryScoreValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#34C759',
  },

  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#4A403A',
    lineHeight: 24,
    marginTop: 4,
  },

  // Eşleşme kartı
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    gap: 0,
    shadowColor: '#959595',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  matchCardMissing: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: '#EDE5D8',
    borderStyle: 'dashed',
  },
  matchImage: {
    width: 80,
    height: 80,
  },
  matchImageEmpty: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  matchCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchCategory: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#C9A86A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 18,
  },
  matchReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  matchReason: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
  },
  matchMissingName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
    fontStyle: 'italic',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  addBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#C9A86A',
  },

  // Skor halkası
  scoreRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scoreText: {
    fontFamily: 'Poppins_700Bold' as any,
    fontSize: 11,
    lineHeight: 14,
  },
  missingIcon: {
    marginRight: 14,
  },

  // İpucu
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F5F0E8',
    borderRadius: 14,
    padding: 14,
  },
  tipText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
    lineHeight: 18,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FDFBF7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 9999,
    backgroundColor: '#1F1F1F',
  },
  createBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253,251,247,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  loadingCard: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 32,
  },
  loadingIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(201,168,106,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,106,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#4A403A',
    textAlign: 'center',
    lineHeight: 26,
  },
  loadingSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#9C8C84',
    textAlign: 'center',
    lineHeight: 20,
  },
});
