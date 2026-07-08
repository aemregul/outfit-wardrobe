import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
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

type Props = NativeStackScreenProps<RootStackParamList, 'OutfitReady'>;

const OUTFIT_PIECES = [
  {
    id: '1',
    category: 'Üst',
    name: 'Bej Keten Gömlek',
    color: '#D4C5A9',
    colorLabel: 'Bej',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80',
    matchScore: 92,
  },
  {
    id: '2',
    category: 'Alt',
    name: 'Karamel Chino',
    color: '#B08850',
    colorLabel: 'Karamel',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    matchScore: 88,
  },
  {
    id: '3',
    category: 'Ayakkabı',
    name: 'Beyaz Sneaker',
    color: '#F0EDE8',
    colorLabel: 'Beyaz',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    matchScore: 85,
  },
];

const STYLE_TAGS = ['Gündelik', 'Minimalist', 'Bej Ton', 'Günlük'];

export function OutfitReadyScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  if (!fontsLoaded) return <View style={styles.container} />;

  const overallScore = Math.round(
    OUTFIT_PIECES.reduce((s, p) => s + p.matchScore, 0) / OUTFIT_PIECES.length,
  );

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.handleWrap}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color="#4A403A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="sparkles" size={16} color="#C9A86A" />
          <Text style={styles.title}>Kombinin Hazır!</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 130 }]}
      >
        {/* Skor özeti */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeNum}>{overallScore}%</Text>
            <Text style={styles.scoreBadgeLabel}>Uyum</Text>
          </View>
          <View style={styles.scoreInfo}>
            <Text style={styles.scoreTitle}>{OUTFIT_PIECES.length} parçalı kombin</Text>
            <Text style={styles.scoreSubtitle}>Dolabındaki parçalardan oluşturuldu</Text>
          </View>
        </View>

        {/* Parçalar — connector çizgisiyle */}
        <View style={styles.piecesWrap}>
          {OUTFIT_PIECES.map((piece, idx) => (
            <View key={piece.id}>
              <View style={styles.pieceCard}>
                <Image source={{ uri: piece.imageUrl }} style={styles.pieceImage} resizeMode="cover" />
                <View style={styles.pieceInfo}>
                  <Text style={styles.pieceCategory}>{piece.category}</Text>
                  <Text style={styles.pieceName}>{piece.name}</Text>
                  <View style={styles.pieceColorRow}>
                    <View style={[styles.pieceColorSwatch, { backgroundColor: piece.color }]} />
                    <Text style={styles.pieceColorLabel}>{piece.colorLabel}</Text>
                  </View>
                </View>
                <View style={styles.pieceRight}>
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                  <TouchableOpacity style={styles.swapBtn} activeOpacity={0.7}>
                    <Ionicons name="swap-horizontal" size={14} color="#9C8C84" />
                    <Text style={styles.swapBtnText}>Değiştir</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Connector çizgi (son parça hariç) */}
              {idx < OUTFIT_PIECES.length - 1 && (
                <View style={styles.connector}>
                  <View style={styles.connectorLine} />
                  <View style={styles.connectorDot} />
                  <View style={styles.connectorLine} />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Stil etiketleri */}
        <View style={styles.tagsSection}>
          <Text style={styles.tagsLabel}>Stil</Text>
          <View style={styles.tagsRow}>
            {STYLE_TAGS.map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* İpucu */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={15} color="#C9A86A" />
          <Text style={styles.tipText}>
            Parçayı değiştirmek için "Değiştir" butonuna dokun, dolabından başka seçenekler göreceksin.
          </Text>
        </View>
      </ScrollView>

      {/* Alt butonlar */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnActive]}
          activeOpacity={0.85}
          onPress={() => setSaved(s => !s)}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={saved ? '#FFFFFF' : '#C9A86A'}
          />
          <Text style={[styles.saveBtnText, saved && styles.saveBtnTextActive]}>
            {saved ? 'Kaydedildi ✓' : 'Kombini Kaydet'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
          <Text style={styles.shareBtnText}>Akışta Paylaş</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#4A403A',
    lineHeight: 26,
  },

  scroll: {
    paddingHorizontal: 16,
    gap: 16,
  },

  // Skor
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#959595',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(201,168,106,0.12)',
    borderWidth: 2,
    borderColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeNum: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#C9A86A',
    lineHeight: 22,
  },
  scoreBadgeLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: '#9C8C84',
    lineHeight: 12,
  },
  scoreInfo: {
    flex: 1,
    gap: 4,
  },
  scoreTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#4A403A',
    lineHeight: 22,
  },
  scoreSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
    lineHeight: 18,
  },

  // Parçalar
  piecesWrap: {
    gap: 0,
  },
  pieceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#959595',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  pieceImage: {
    width: 88,
    height: 88,
  },
  pieceInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  pieceCategory: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#C9A86A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pieceName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 18,
  },
  pieceColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pieceColorSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  pieceColorLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
  },
  pieceRight: {
    paddingRight: 14,
    alignItems: 'center',
    gap: 8,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  swapBtnText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#9C8C84',
  },

  // Connector
  connector: {
    flexDirection: 'column',
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    gap: 2,
  },
  connectorLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: '#E0D5C8',
  },
  connectorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C9A86A',
  },

  // Etiketler
  tagsSection: {
    gap: 8,
  },
  tagsLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#4A403A',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(201,168,106,0.12)',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.3)',
  },
  tagText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#C9A86A',
  },

  // İpucu
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(201,168,106,0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.2)',
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
    gap: 10,
    backgroundColor: '#FDFBF7',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#C9A86A',
    backgroundColor: 'transparent',
  },
  saveBtnActive: {
    backgroundColor: '#C9A86A',
    borderColor: '#C9A86A',
  },
  saveBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#C9A86A',
  },
  saveBtnTextActive: {
    color: '#FFFFFF',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#1F1F1F',
  },
  shareBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
