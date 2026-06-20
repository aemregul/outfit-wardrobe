import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { PressableScale } from '../../../shared/components/PressableScale';

const kadinImage = require('../../../../assets/images/cinsiyet/kadın.jpeg');
const erkekImage = require('../../../../assets/images/cinsiyet/erkek.jpeg');
const backArrowIcon = require('../../../../assets/icons/vector.png');
const dotActiveIcon = require('../../../../assets/icons/Ellipse 1.png');
const dotInactiveIcon = require('../../../../assets/icons/Ellipse 2.png');

type Gender = 'kadin' | 'erkek';

type GenderSelectionProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onContinue: (gender: Gender) => void;
  onSkip: () => void;
};

export function GenderSelection({ step, totalSteps, onBack, onContinue, onSkip }: GenderSelectionProps) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Gender | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    onContinue(selected);
  };

  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

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

      <Text style={styles.title}>Size Özel Öneriler Hazırlayalım</Text>
      <Text style={styles.subtitle}>
        Stil önerilerini daha doğru kişiselleştirebilmemiz için sizi biraz tanıyalım.
      </Text>

      <View style={styles.cardsRow}>
        <TouchableOpacity
          style={[styles.card, selected === 'kadin' && styles.cardSelected]}
          activeOpacity={0.85}
          onPress={() => setSelected('kadin')}
        >
          <View style={[styles.cardInner, selected === 'kadin' && styles.cardInnerSelected]}>
            <Image source={kadinImage} style={styles.cardImage} resizeMode="cover" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, selected === 'erkek' && styles.cardSelected]}
          activeOpacity={0.85}
          onPress={() => setSelected('erkek')}
        >
          <View style={[styles.cardInner, selected === 'erkek' && styles.cardInnerSelected]}>
            <Image source={erkekImage} style={styles.cardImage} resizeMode="cover" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.labelsRow}>
        <Text style={[styles.label, selected === 'kadin' && styles.labelSelected]}>Kadın</Text>
        <Text style={[styles.label, selected === 'erkek' && styles.labelSelected]}>Erkek</Text>
      </View>

      <View style={styles.spacer} />

      <PressableScale style={styles.continueButton} onPress={handleContinue}>
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
  cardsRow: {
    marginTop: 50,
    flexDirection: 'row',
    gap: 22,
  },
  card: {
    flex: 1,
    height: 180,
    borderRadius: 20,
  },
  cardSelected: {
    transform: [{ scale: 1.02 }],
    shadowColor: '#C9A86A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  cardInner: {
    flex: 1,
    backgroundColor: '#EAE3D8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    overflow: 'hidden',
  },
  cardInnerSelected: {
    borderColor: '#C9A86A',
    borderWidth: 2,
  },
  cardImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  labelsRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 22,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1F1F1F',
  },
  labelSelected: {
    color: '#C9A86A',
    transform: [{ scale: 1.1 }],
  },
  spacer: {
    flex: 1,
    minHeight: 24,
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
