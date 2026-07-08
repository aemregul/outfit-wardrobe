import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import type { AppNavigationProp } from '../../../app/navigation/types';

const FEATURES = [
  {
    id: 'chat',
    route: 'AIChat' as const,
    icon: 'chatbubble-ellipses-outline' as const,
    title: 'AI ile Sohbet',
    description: 'Moda asistanınla stil önerileri al, kombin fikirleri keşfet.',
    tag: 'Popüler',
    gradient: ['#1F1F1F', '#3A3028'] as [string, string],
    tagColor: '#C9A86A',
  },
  {
    id: 'tryon',
    route: 'VirtualTryOn' as const,
    icon: 'body-outline' as const,
    title: 'Sanal Kıyafet Deneme',
    description: 'Kıyafetleri giymeden önce nasıl durduğunu gör. Fotoğrafını yükle, dene.',
    tag: 'Yeni',
    gradient: ['#C9A86A', '#B8935A'] as [string, string],
    tagColor: '#FFFFFF',
  },
];

const TIPS = [
  { icon: 'sunny-outline' as const, text: 'Günlük hava durumuna göre kombin önerisi al' },
  { icon: 'color-palette-outline' as const, text: 'Renk uyumunu analiz ettir' },
  { icon: 'calendar-outline' as const, text: 'Haftalık kombinlerini önceden planla' },
];

export function AIHubScreen() {
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
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Yapay Zeka</Text>
          <Text style={styles.headerSub}>Stili yönet, modu keşfet</Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      {/* Feature Cards */}
      <Text style={styles.sectionTitle}>Özellikler</Text>
      <View style={styles.featureList}>
        {FEATURES.map((f) => (
          <TouchableOpacity
            key={f.id}
            activeOpacity={0.88}
            onPress={() => navigation.navigate(f.route)}
          >
            <LinearGradient
              colors={f.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureCard}
            >
              <View style={styles.featureTop}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={f.icon} size={26} color="#FFFFFF" />
                </View>
                <View style={[styles.featureTag, { backgroundColor: f.tagColor + '22', borderColor: f.tagColor + '55' }]}>
                  <Text style={[styles.featureTagText, { color: f.tagColor }]}>{f.tag}</Text>
                </View>
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.description}</Text>
              <View style={styles.featureArrow}>
                <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.6)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tips */}
      <Text style={[styles.sectionTitle, styles.sectionGap]}>Neler Yapabilirsin?</Text>
      <View style={styles.tipsList}>
        {TIPS.map((t, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipIconWrap}>
              <Ionicons name={t.icon} size={18} color="#C9A86A" />
            </View>
            <Text style={styles.tipText}>{t.text}</Text>
          </View>
        ))}
      </View>
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
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    lineHeight: 34,
    color: '#4A403A',
  },
  headerSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#9C8C84',
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    lineHeight: 26,
    color: '#4A403A',
    marginTop: 28,
    marginBottom: 12,
  },
  sectionGap: {
    marginTop: 36,
  },
  featureList: {
    gap: 14,
  },
  featureCard: {
    borderRadius: 24,
    padding: 22,
    minHeight: 160,
  },
  featureTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featureIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTag: {
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featureTagText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
  },
  featureTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    lineHeight: 26,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  featureDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  featureArrow: {
    alignSelf: 'flex-end',
  },
  tipsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tipIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(201,168,106,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#4A403A',
    flex: 1,
  },
});
