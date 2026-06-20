import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { PressableScale } from '../../../shared/components/PressableScale';

const backArrowIcon = require('../../../../assets/icons/vector.png');
const dotActiveIcon = require('../../../../assets/icons/Ellipse 1.png');
const dotInactiveIcon = require('../../../../assets/icons/Ellipse 2.png');

const bagIcon = require('../../../../assets/icons/Bag.png');
const coffeeCupIcon = require('../../../../assets/icons/Coffee cup.png');
const theatreMaskIcon = require('../../../../assets/icons/Theatre Mask.png');
const cocktailIcon = require('../../../../assets/icons/Icon.png');

type LifestyleKey = 'isOfis' | 'gunlukYasam' | 'aksamEtkinlikleri' | 'ozelDavetler';

const LIFESTYLE_OPTIONS: { key: LifestyleKey; label: string; icon: number }[] = [
  { key: 'isOfis', label: 'İş/Ofis', icon: bagIcon },
  { key: 'gunlukYasam', label: 'Günlük Yaşam', icon: coffeeCupIcon },
  { key: 'aksamEtkinlikleri', label: 'Akşam Etkinlikleri', icon: theatreMaskIcon },
  { key: 'ozelDavetler', label: 'Özel Davetler', icon: cocktailIcon },
];

type LifestyleSelectionProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
};

export function LifestyleSelection({ step, totalSteps, onBack, onContinue, onSkip }: LifestyleSelectionProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<LifestyleKey>>(new Set());

  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  const toggleOption = (key: LifestyleKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderOption = (option: (typeof LIFESTYLE_OPTIONS)[number]) => {
    const isSelected = selected.has(option.key);
    return (
      <TouchableOpacity
        key={option.key}
        style={[styles.card, isSelected && styles.cardSelected]}
        activeOpacity={0.85}
        onPress={() => toggleOption(option.key)}
      >
        <View style={styles.iconCircle}>
          <Image source={option.icon} style={styles.icon} resizeMode="contain" />
        </View>
        <Text style={styles.cardLabel}>{option.label}</Text>
      </TouchableOpacity>
    );
  };

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

      <Text style={styles.title}>Vaktinizin Çoğunu Nerede Geçiriyorsunuz ?</Text>
      <Text style={styles.subtitle}>
        Gardırop önerilerimizi yaşam tarzınıza uygun hale getirmemize{'\n'}yardımcı olun.
      </Text>

      <View style={styles.grid}>
        <View style={styles.gridRow}>{LIFESTYLE_OPTIONS.slice(0, 2).map(renderOption)}</View>
        <View style={styles.gridRow}>{LIFESTYLE_OPTIONS.slice(2, 4).map(renderOption)}</View>
      </View>

      <View style={styles.gridSpacer} />

      <PressableScale style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueText}>Devam Et</Text>
      </PressableScale>

      <TouchableOpacity activeOpacity={0.7} onPress={onSkip}>
        <Text style={styles.skipText}>Şimdilik Atla</Text>
      </TouchableOpacity>
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
  grid: {
    flex: 4,
    marginTop: 24,
    gap: 16,
  },
  gridSpacer: {
    flex: 1,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    backgroundColor: '#FDFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    borderColor: '#C9A86A',
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
    shadowColor: '#C9A86A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6E655C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 30,
    height: 30,
  },
  cardLabel: {
    marginTop: 12,
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#4A4036',
    textAlign: 'center',
  },
  continueButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
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
});
