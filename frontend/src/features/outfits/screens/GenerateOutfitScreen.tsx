import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardLayout } from '../../../shared/components/Layout/DashboardLayout';
import { useGenerateOutfit } from '../hooks/useOutfits';
import { OUTFIT_SEASONS, SEASON_LABELS } from '../../../shared/types/outfit.types';
import type { RootStackParamList } from '../../../app/navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const OCCASION_OPTIONS = ['Günlük', 'İş', 'Akşam Yemeği', 'Düğün', 'Spor', 'Seyahat', 'Özel Gün'];

export function GenerateOutfitScreen() {
  const navigation = useNavigation<Nav>();
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
        onError: (err: any) => {
          setError(
            err?.response?.data?.message ??
            'Kombin oluşturulamadı. Dolabınızda yeterli temiz kıyafet olmayabilir.'
          );
        },
      }
    );
  }

  return (
    <DashboardLayout>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Kombin Oluştur</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Yapay zeka dolabınızdaki temiz kıyafetlerden sizin için bir kombin seçer.
            İsterseniz etkinlik ve mevsim belirtebilirsiniz.
          </Text>
        </View>

        {/* Occasion */}
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
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Season */}
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
            <Text style={styles.generateBtnText}>✨ Kombini Oluştur</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.listBtn}
          onPress={() => navigation.navigate('OutfitList')}
        >
          <Text style={styles.listBtnText}>Mevcut Kombinlere Git →</Text>
        </TouchableOpacity>
      </ScrollView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 28, maxWidth: 640, width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  backBtn: { color: '#6366F1', fontSize: 15, fontWeight: '500' },
  title: { fontSize: 22, fontWeight: '700', color: '#1E1B4B' },
  infoCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  infoText: { fontSize: 14, color: '#4338CA', lineHeight: 20 },
  field: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 10 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    backgroundColor: '#EDE9FE', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  chipActive: { backgroundColor: '#6366F1' },
  chipText: { fontSize: 13, color: '#6366F1', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 12 },
  generateBtn: {
    backgroundColor: '#6366F1', paddingVertical: 16,
    borderRadius: 10, alignItems: 'center', marginBottom: 12,
  },
  generateBtnDisabled: { backgroundColor: '#A5B4FC' },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  listBtn: { alignItems: 'center', paddingVertical: 12 },
  listBtnText: { fontSize: 14, color: '#6366F1', fontWeight: '500' },
});
