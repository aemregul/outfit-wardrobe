import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useGenerateOutfit } from '../hooks/useOutfits';
import { OUTFIT_SEASONS, SEASON_LABELS } from '../../../shared/types/outfit.types';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const OCCASION_OPTIONS = ['Günlük', 'İş', 'Akşam Yemeği', 'Düğün', 'Spor', 'Seyahat', 'Özel Gün'];

export function GenerateOutfitScreen() {
  const navigation = useNavigation<Nav>();
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });
  const { mutate: generate, isPending } = useGenerateOutfit();

  const [occasion, setOccasion] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [error, setError] = useState('');

  function handleGenerate() {
    setError('');
    generate(
      {
        occasion: occasion.trim() || undefined,
        season: selectedSeason ?? undefined,
      },
      {
        onSuccess: (res) => {
          const outfitId = res.data.data?.id;
          if (outfitId) {
            navigation.navigate('OutfitDetail', { id: outfitId });
          } else {
            navigation.navigate('OutfitList');
          }
        },
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          setError(
            axiosErr?.response?.data?.message ??
            'Kombin oluşturulamadı. Dolabınızda yeterli temiz kıyafet olmayabilir.'
          );
        },
      }
    );
  }

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FDFBF7' }} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color="#4A403A" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Kombin Oluştur</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Yapay zeka dolabınızdaki temiz kıyafetlerden sizin için bir kombin seçer.
            İsterseniz etkinlik ve mevsim belirtebilirsiniz.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Etkinlik (opsiyonel)</Text>
          <View style={styles.chipGrid}>
            {OCCASION_OPTIONS.map((occ) => (
              <TouchableOpacity
                key={occ}
                style={[styles.chip, occasion === occ && styles.chipActive]}
                onPress={() => setOccasion(occasion === occ ? '' : occ)}
              >
                <Text style={[styles.chipText, occasion === occ && styles.chipTextActive]}>
                  {occ}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            value={occasion}
            onChangeText={setOccasion}
            placeholder="Veya kendiniz yazın..."
            placeholderTextColor="#C4B8AF"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mevsim (opsiyonel)</Text>
          <View style={styles.chipGrid}>
            {OUTFIT_SEASONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, selectedSeason === s && styles.chipActive]}
                onPress={() => setSelectedSeason(selectedSeason === s ? null : s)}
              >
                <Text style={[styles.chipText, selectedSeason === s && styles.chipTextActive]}>
                  {SEASON_LABELS[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.generateBtn, isPending && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateBtnText}>Kombini Oluştur</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listBtn}
          onPress={() => navigation.navigate('OutfitList')}
        >
          <Text style={styles.listBtnText}>Mevcut Kombinlere Git</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDFBF7' },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#4A403A' },
  infoCard: {
    backgroundColor: '#F0EDE8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  infoText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9C8C84', lineHeight: 22 },
  field: { marginBottom: 24 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#4A403A', marginBottom: 10 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    backgroundColor: '#F0EDE8',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: '#C9A86A' },
  chipText: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#9C8C84' },
  chipTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(74,64,58,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4A403A',
  },
  errorText: { fontFamily: 'Poppins_400Regular', color: '#EF4444', fontSize: 13, marginBottom: 12 },
  generateBtn: {
    backgroundColor: '#1F1F1F',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  generateBtnDisabled: { backgroundColor: 'rgba(31,31,31,0.4)' },
  generateBtnText: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 15 },
  listBtn: { alignItems: 'center', paddingVertical: 12 },
  listBtnText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#C9A86A' },
});
