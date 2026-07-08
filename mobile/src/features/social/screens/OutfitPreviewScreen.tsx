import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OutfitPreview'>;

interface ClothingItem {
  id: string;
  label: string;
  category: string;
  color: string;
  imageUrl: string;
}

const MOCK_ITEMS: ClothingItem[] = [
  {
    id: '1',
    label: 'Keten Gömlek',
    category: 'Üst',
    color: 'Bej',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80',
  },
  {
    id: '2',
    label: 'Slim Pantolon',
    category: 'Alt',
    color: 'Karamel',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
  },
  {
    id: '3',
    label: 'Sneaker',
    category: 'Ayakkabı',
    color: 'Beyaz',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  },
  {
    id: '4',
    label: 'Tote Çanta',
    category: 'Çanta',
    color: 'Naturel',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.85;

export function OutfitPreviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<Props['route']>();
  const insets = useSafeAreaInsets();
  const { imageUrl, caption, username } = route.params;

  const [saved, setSaved] = useState(false);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {/* Drag handle */}
      <View style={styles.handleWrap}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Kombin Detayı</Text>
        <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={20} color="#4A403A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 20) + 170 }]}
      >
        {/* Outfit photo */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Author badge */}
          {username && (
            <View style={styles.authorBadge}>
              <Ionicons name="person-circle-outline" size={14} color="#FFFFFF" />
              <Text style={styles.authorBadgeText}>{username}</Text>
            </View>
          )}
        </View>

        {/* Caption */}
        {caption ? (
          <View style={styles.captionWrap}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        ) : null}

        {/* Items section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bu Kombindekiler</Text>
          <Text style={styles.sectionSub}>{MOCK_ITEMS.length} parça</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemsScroll}
        >
          {MOCK_ITEMS.map(item => (
            <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.85}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
              <View style={styles.itemInfo}>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemLabel} numberOfLines={2}>{item.label}</Text>
                <View style={styles.colorDot}>
                  <Text style={styles.itemColor}>{item.color}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Style tags */}
        <View style={styles.tagsRow}>
          {['Gündelik', 'Minimalist', 'Bej Ton'].map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom actions — fixed */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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
            {saved ? 'Kaydedildi' : 'Kombini Kaydet'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.findBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('WardrobeMatch', { outfitId: route.params.outfitId, imageUrl })}
        >
          <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
          <Text style={styles.findBtnText}>Dolabımda Benzerini Bul</Text>
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
    gap: 16,
  },

  // Outfit image
  imageWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  authorBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  authorBadgeText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#FFFFFF',
  },

  captionWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  captionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 20,
  },

  // Items
  section: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#4A403A',
    lineHeight: 24,
  },
  sectionSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
  },

  itemsScroll: {
    gap: 12,
    paddingRight: 4,
  },
  itemCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#959595',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  itemImage: {
    width: 130,
    height: 130,
  },
  itemInfo: {
    padding: 10,
    gap: 3,
  },
  itemCategory: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#C9A86A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#4A403A',
    lineHeight: 17,
  },
  colorDot: {
    marginTop: 2,
  },
  itemColor: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
  },

  // Tags
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

  // Action buttons
  actions: {
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
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 9999,
    backgroundColor: '#1F1F1F',
  },
  findBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
