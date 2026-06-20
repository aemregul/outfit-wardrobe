import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts, Poppins_300Light, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { PressableScale } from '../../../shared/components/PressableScale';

const backArrowIcon = require('../../../../assets/icons/vector.png');
const dotActiveIcon = require('../../../../assets/icons/Ellipse 1.png');
const dotInactiveIcon = require('../../../../assets/icons/Ellipse 2.png');
const yildizIcon = require('../../../../assets/icons/yıldız.png');

type PermissionsSetupProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
};

export function PermissionsSetup({ step, totalSteps, onBack, onContinue, onSkip }: PermissionsSetupProps) {
  const insets = useSafeAreaInsets();

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

      <Text style={styles.title}>Haydi tarzını tamamlayalım!</Text>
      <Text style={styles.subtitle}>
        Mükemmel gardırobunuzu oluşturmak ve size günlük ilham vermek için biraz erişime ihtiyacımız var.
      </Text>

      <View style={styles.decorRow}>
        <Image source={yildizIcon} style={styles.starIcon} resizeMode="contain" />
        <Ionicons name="sparkles" size={28} color="#C9A86A" />
      </View>

      <View style={styles.cardsColumn}>
        <View style={styles.permissionCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={24} color="#C9A86A" />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Dolabınızı Tarayın</Text>
            <Text style={styles.cardDesc}>
              Giysilerinizi hızlıca dijitalleştirmek ve sanal gardırobunuzu oluşturmak için kamera erişimine izin verin.
            </Text>
          </View>
        </View>

        <View style={styles.permissionCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={24} color="#C9A86A" />
          </View>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardTitle}>Günlük Kıyafet Fikirleri</Text>
            <Text style={styles.cardDesc}>
              Hava durumuna göre her sabah kişiselleştirilmiş "Günün kıyafeti" önerilerini alın.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />

      <View style={styles.privacyRow}>
        <Ionicons name="lock-closed" size={12} color="#6E655C" />
        <Text style={styles.privacyText}>Verileriniz gizlidir ve asla paylaşılmaz.</Text>
      </View>

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
    marginTop: 40,
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
    lineHeight: 36,
    color: '#1F1F1F',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 16,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#6E655C',
    textAlign: 'center',
  },
  decorRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  starIcon: {
    width: 20,
    height: 20,
  },
  cardsColumn: {
    marginTop: 24,
    gap: 12,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#C9A86A',
    padding: 21,
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6E655C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    lineHeight: 28,
    color: '#1F1F1F',
  },
  cardDesc: {
    marginTop: 4,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 19.25,
    color: 'rgba(110,101,92,0.7)',
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  privacyText: {
    fontFamily: 'Poppins_300Light',
    fontSize: 11,
    lineHeight: 19.25,
    color: 'rgba(110,101,92,0.7)',
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
