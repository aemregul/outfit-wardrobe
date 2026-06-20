import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, TextInput, ScrollView, Modal, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { BounceIn, FadeIn, FadeOut, ZoomOut } from 'react-native-reanimated';
import {
  useFonts, Poppins_300Light, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { PressableScale } from '../../../shared/components/PressableScale';

const backArrowIcon = require('../../../../assets/icons/vector.png');
const dotActiveIcon = require('../../../../assets/icons/Ellipse 1.png');
const dotInactiveIcon = require('../../../../assets/icons/Ellipse 2.png');

const POPULAR_STYLES = [
  'Old Money', 'Boho', 'Y2K', 'Coquette',
  'Korean Style', 'Goth', 'Dark Academia',
  'Preppy', 'Indie', 'Grunge', 'Soft Girl',
  'Scandinavian',
];

const STYLE_IMAGES = {
  kadin: {
    casual: require('../../../../assets/images/kadın/casual(gündelik).jpg'),
    streetwear: require('../../../../assets/images/kadın/streetwear.jpg'),
    sportif: require('../../../../assets/images/kadın/sportif.jpg'),
    smartCasual: require('../../../../assets/images/kadın/smart casual.jpg'),
    business: require('../../../../assets/images/kadın/business(ofis).jpg'),
    minimalist: require('../../../../assets/images/kadın/minimalist.jpg'),
    dateNight: require('../../../../assets/images/kadın/date night.jpg'),
    vintage: require('../../../../assets/images/kadın/vintage.jpg'),
    luxury: require('../../../../assets/images/kadın/luxury.jpg'),
  },
  erkek: {
    casual: require('../../../../assets/images/erkek/casual(gündelik).jpg'),
    streetwear: require('../../../../assets/images/erkek/streetwear.jpg'),
    sportif: require('../../../../assets/images/erkek/sportif.jpg'),
    smartCasual: require('../../../../assets/images/erkek/smart casual.jpg'),
    business: require('../../../../assets/images/erkek/business(ofis).jpg'),
    minimalist: require('../../../../assets/images/erkek/minimalist.jpg'),
    dateNight: require('../../../../assets/images/erkek/date night.jpg'),
    vintage: require('../../../../assets/images/erkek/vintage.jpg'),
    luxury: require('../../../../assets/images/erkek/luxury.jpg'),
  },
} as const;

type Gender = 'kadin' | 'erkek';
type StyleKey = keyof typeof STYLE_IMAGES.kadin;

const STYLE_OPTIONS: { key: StyleKey; label: string }[] = [
  { key: 'casual', label: 'Casual (Gündelik)' },
  { key: 'streetwear', label: 'Streetwear' },
  { key: 'sportif', label: 'Sportif' },
  { key: 'smartCasual', label: 'Smart Casual' },
  { key: 'business', label: 'Business / Ofis' },
  { key: 'minimalist', label: 'Minimalist' },
  { key: 'dateNight', label: 'Date Night' },
  { key: 'vintage', label: 'Vintage' },
  { key: 'luxury', label: 'Luxury' },
];

type StylePreferencesProps = {
  gender: Gender;
  step: number;
  totalSteps: number;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
};

export function StylePreferences({ gender, step, totalSteps, onBack, onContinue, onSkip }: StylePreferencesProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<StyleKey>>(new Set());
  const [customStyles, setCustomStyles] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  const toggleStyle = (key: StyleKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleCustomChip = (label: string) => {
    setCustomStyles((prev) => (prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]));
  };

  const addCustomInput = () => {
    const trimmed = customInput.trim();
    if (trimmed && !customStyles.includes(trimmed)) {
      setCustomStyles((prev) => [...prev, trimmed]);
    }
    setCustomInput('');
  };

  const removeCustomStyle = (label: string) => {
    setCustomStyles((prev) => prev.filter((s) => s !== label));
  };

  const images = STYLE_IMAGES[gender];
  const isCustomSelected = customStyles.length > 0;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 7, paddingBottom: Math.max(insets.bottom, 20) + 24 },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={onBack}>
          <Image source={backArrowIcon} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>

        <View style={styles.dots}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <Image
              key={i}
              source={i === step ? dotActiveIcon : dotInactiveIcon}
              style={styles.dot}
              resizeMode="contain"
            />
          ))}
        </View>

        <View style={styles.backButtonSpacer} />
      </View>

      <Text style={styles.title}>Stil Tercihlerinizi Seçin</Text>
      <Text style={styles.subtitle}>Beğendiğiniz stilleri seçin (birden fazla seçebilirsiniz)</Text>

      <View style={styles.gridSpacer} />

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {STYLE_OPTIONS.map((option) => {
          const isSelected = selected.has(option.key);
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.card, isSelected && styles.cardSelected]}
              activeOpacity={0.85}
              onPress={() => toggleStyle(option.key)}
            >
              <View style={[styles.cardInner, isSelected && styles.cardInnerSelected]}>
                <Image source={images[option.key]} style={styles.cardImage} resizeMode="cover" />
                <LinearGradient
                  colors={[
                    'rgba(201,168,106,0.05)',
                    'rgba(201,168,106,0.15)',
                    'rgba(201,168,106,0.5)',
                    'rgba(201,168,106,0.8)',
                  ]}
                  locations={[0.1, 0.4, 0.7, 1]}
                  style={styles.cardGradient}
                />
                <Text style={styles.cardLabel}>{option.label}</Text>
                {isSelected && (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={styles.selectionOverlay}
                  />
                )}
                {isSelected && (
                  <Animated.View
                    entering={BounceIn.duration(400)}
                    exiting={ZoomOut.duration(150)}
                    style={styles.checkmarkBadge}
                  >
                    <Ionicons name="checkmark" size={36} color="#FFFFFF" />
                  </Animated.View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.card, isCustomSelected && styles.cardSelected]}
          activeOpacity={0.85}
          onPress={() => setShowCustomModal(true)}
        >
          <View style={[styles.cardInner, styles.customCard, isCustomSelected && styles.cardInnerSelected]}>
            <Text style={styles.customPlus}>+</Text>
            <Text style={styles.customText} numberOfLines={2}>
              {customStyles.length > 0 ? customStyles.join(', ') : 'Kendi Tarzını Yaz'}
            </Text>
            {isCustomSelected && <View style={styles.selectionRing} />}
          </View>
        </TouchableOpacity>
      </ScrollView>

      <PressableScale style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueText}>Devam Et</Text>
      </PressableScale>

      <TouchableOpacity activeOpacity={0.7} onPress={onSkip}>
        <Text style={styles.skipText}>Şimdilik Atla</Text>
      </TouchableOpacity>

      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoider}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowCustomModal(false)} />

            <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
            <View style={styles.sheetHandle} />

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetTitle}>Kendi Tarzını Yaz</Text>
              <Text style={styles.sheetSubtitle}>
                Aradığın tarz listede yok mu ?{'\n'}Tarzını yaz, sana özel öneriler sunalım.
              </Text>

              <View style={styles.sheetInputWrapper}>
                <TextInput
                  style={styles.sheetInput}
                  value={customInput}
                  onChangeText={(text) => setCustomInput(text.slice(0, 30))}
                  onSubmitEditing={addCustomInput}
                  returnKeyType="done"
                  placeholder="Tarzını buraya yaz..."
                  placeholderTextColor="#6E655C"
                  maxLength={30}
                />
                <Text style={styles.sheetCounter}>{customInput.length}/30</Text>
              </View>

              {customStyles.length > 0 && (
                <View style={styles.selectedTagsRow}>
                  {customStyles.map((label) => (
                    <TouchableOpacity
                      key={label}
                      style={styles.tag}
                      activeOpacity={0.85}
                      onPress={() => removeCustomStyle(label)}
                    >
                      <Text style={styles.tagText}>{label}</Text>
                      <Text style={styles.tagRemove}>×</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.sheetSectionTitle}>Popüler Örnekler</Text>

              <View style={styles.chipsRow}>
                {POPULAR_STYLES.map((label) => {
                  const isChipSelected = customStyles.includes(label);
                  return (
                    <TouchableOpacity
                      key={label}
                      style={[styles.chip, isChipSelected && styles.chipSelected]}
                      activeOpacity={0.85}
                      onPress={() => toggleCustomChip(label)}
                    >
                      <Text style={[styles.chipText, isChipSelected && styles.chipTextSelected]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <PressableScale style={styles.continueButton} onPress={() => setShowCustomModal(false)}>
              <Text style={styles.continueText}>Devam Et</Text>
            </PressableScale>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
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
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 9,
    height: 9.36,
  },
  title: {
    marginTop: 31,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    lineHeight: 22,
    color: '#1F1F1F',
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: '#6E655C',
  },
  gridSpacer: {
    height: 32,
  },
  scrollArea: {
    marginHorizontal: -16,
    marginTop: -16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    width: '48%',
    aspectRatio: 164 / 203,
    borderRadius: 20,
    backgroundColor: '#FDFBF7',
  },
  cardSelected: {
    shadowColor: '#C9A86A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  cardInner: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardInnerSelected: {
    transform: [{ scale: 1.02 }],
  },
  selectionRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#C9A86A',
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(201,168,106,0.5)',
  },
  checkmarkBadge: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  cardLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#1F1F1F',
  },
  customCard: {
    backgroundColor: 'rgba(201,168,106,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  customPlus: {
    fontFamily: 'Poppins_300Light',
    fontSize: 64,
    color: '#1F1F1F',
  },
  customText: {
    marginTop: 8,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#6E655C',
    textAlign: 'center',
  },
  continueButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  continueText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  skipText: {
    marginTop: 17,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.1,
    color: '#8A8A8A',
  },
  keyboardAvoider: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    maxHeight: '65%',
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 70,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D8D8D8',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: '#1F1F1F',
  },
  sheetSubtitle: {
    marginTop: 12,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 20,
    color: '#6E655C',
  },
  sheetInputWrapper: {
    marginTop: 12,
    justifyContent: 'center',
  },
  sheetInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#8A8A8A',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#1F1F1F',
  },
  sheetCounter: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: '#6E655C',
  },
  sheetSectionTitle: {
    marginTop: 28,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#1F1F1F',
  },
  chipsRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(138,138,138,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: '#C9A86A',
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#6E655C',
  },
  chipTextSelected: {
    color: '#C9A86A',
  },
  selectedTagsRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#C9A86A',
    backgroundColor: 'rgba(201,168,106,0.12)',
    gap: 6,
  },
  tagText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#1F1F1F',
  },
  tagRemove: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#C9A86A',
  },
});
