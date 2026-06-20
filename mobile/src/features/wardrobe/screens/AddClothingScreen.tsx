import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCreateClothing, useAnalyzeClothing } from '../hooks/useWardrobe';
import { ImagePickerButton } from '../../../shared/components/ImagePickerButton';
import {
  ClothingCategory, ClothingSeason, ClothingStyle, ClothingItemRequest,
  CLOTHING_CATEGORIES, CATEGORY_LABELS,
  CLOTHING_SEASONS, CLOTHING_SEASON_LABELS,
  CLOTHING_STYLES, CLOTHING_STYLE_LABELS,
} from '../../../shared/types/clothing.types';

const URL_RE = /^https?:\/\/.+\..+/i;

const CATEGORY_MAP: Record<string, ClothingCategory> = {
  TOPS: 'TOP', BOTTOMS: 'BOTTOM', DRESSES: 'DRESS',
  OUTERWEAR: 'OUTERWEAR', SHOES: 'SHOES', ACCESSORIES: 'ACCESSORY',
  BAGS: 'BAG', UNDERWEAR: 'UNDERWEAR', SPORTSWEAR: 'SPORTSWEAR',
  SUITS: 'SUIT', OTHER: 'OTHER', SWIMWEAR: 'OTHER', SLEEPWEAR: 'OTHER',
};

const STYLE_MAP: Record<string, ClothingStyle> = {
  CASUAL: 'CASUAL', FORMAL: 'FORMAL', BUSINESS: 'BUSINESS',
  SPORTY: 'SPORT', STREETWEAR: 'STREETWEAR', MINIMALIST: 'MINIMAL',
  VINTAGE: 'VINTAGE', ELEGANT: 'ELEGANT',
};

export function AddClothingScreen() {
  const navigation = useNavigation();
  const { mutate: createClothing, isPending } = useCreateClothing();
  const { mutate: analyzeClothing, isPending: isAnalyzing } = useAnalyzeClothing();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory | null>(null);
  const [subCategory, setSubCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [colors, setColors] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState<ClothingSeason[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<ClothingStyle[]>([]);
  const [material, setMaterial] = useState('');
  const [pattern, setPattern] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [aiAnalysisJson, setAiAnalysisJson] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');

  function toggleSeason(s: ClothingSeason) {
    setSelectedSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function toggleStyle(st: ClothingStyle) {
    setSelectedStyles((prev) =>
      prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]
    );
  }

  function handleSubmit() {
    setError('');
    if (!name.trim()) { setError('Kıyafet adı zorunludur.'); return; }
    if (!category) { setError('Kategori seçimi zorunludur.'); return; }
    if (productUrl.trim() && !URL_RE.test(productUrl.trim())) {
      setError('Ürün URL geçerli bir adres olmalıdır (https://...).');
      return;
    }

    const payload: ClothingItemRequest = {
      name: name.trim(),
      category,
      subCategory: subCategory.trim() || undefined,
      brand: brand.trim() || undefined,
      size: size.trim() || undefined,
      colors: colors.trim() ? colors.split(',').map((c) => c.trim()).filter(Boolean) : undefined,
      seasons: selectedSeasons.length ? selectedSeasons : undefined,
      styles: selectedStyles.length ? selectedStyles : undefined,
      material: material.trim() || undefined,
      pattern: pattern.trim() || undefined,
      productUrl: productUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      aiAnalysisJson: aiAnalysisJson || undefined,
    };

    createClothing(payload, {
      onSuccess: () => navigation.goBack(),
      onError: (err: unknown) => {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr?.response?.data?.message ?? 'Bir hata oluştu.');
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Kıyafet Ekle</Text>
        </View>

        <FormField label="Fotoğraf">
          <ImagePickerButton
            folder="clothing"
            currentUrl={imageUrl || undefined}
            onUploaded={(url) => {
              setImageUrl(url);
              analyzeClothing(url, {
                onSuccess: (result) => {
                  if (!result) return;
                  try { setAiAnalysisJson(JSON.stringify(result)); } catch {}
                  if (result.category) {
                    const mapped = CATEGORY_MAP[result.category.toUpperCase()];
                    if (mapped) setCategory(mapped);
                  }
                  if (result.subCategory) setSubCategory(result.subCategory);
                  if (result.colors?.length) setColors(result.colors.join(', '));
                  if (result.seasons?.length) {
                    const valid = result.seasons.filter(
                      (s): s is ClothingSeason => CLOTHING_SEASONS.includes(s as ClothingSeason),
                    );
                    if (valid.length) setSelectedSeasons(valid);
                  }
                  if (result.styles?.length) {
                    const valid = result.styles
                      .map((s) => STYLE_MAP[s.toUpperCase()])
                      .filter((s): s is ClothingStyle => !!s);
                    if (valid.length) setSelectedStyles(valid);
                  }
                  if (result.material) setMaterial(result.material);
                  if (result.pattern) setPattern(result.pattern);
                },
              });
            }}
          />
          {isAnalyzing && (
            <View style={styles.analyzeRow}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.analyzeText}>AI analiz ediliyor...</Text>
            </View>
          )}
        </FormField>

        <FormField label="Kıyafet Adı *">
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Örn: Siyah Blazer"
            placeholderTextColor="#9CA3AF"
          />
        </FormField>

        <FormField label="Kategori *">
          <View style={styles.chipGrid}>
            {CLOTHING_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, category === cat && styles.chipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormField>

        <FormField label="Alt Kategori">
          <TextInput
            style={styles.input}
            value={subCategory}
            onChangeText={setSubCategory}
            placeholder="Örn: Polo, Kapüşonlu"
            placeholderTextColor="#9CA3AF"
          />
        </FormField>

        <FormField label="Marka">
          <TextInput
            style={styles.input}
            value={brand}
            onChangeText={setBrand}
            placeholder="Örn: Zara"
            placeholderTextColor="#9CA3AF"
          />
        </FormField>

        <FormField label="Beden">
          <TextInput
            style={styles.input}
            value={size}
            onChangeText={setSize}
            placeholder="Örn: M, 38, L"
            placeholderTextColor="#9CA3AF"
          />
        </FormField>

        <FormField label="Renkler (virgülle ayırın)">
          <TextInput
            style={styles.input}
            value={colors}
            onChangeText={setColors}
            placeholder="Örn: Siyah, Beyaz"
            placeholderTextColor="#9CA3AF"
          />
        </FormField>

        <FormField label="Mevsimler">
          <View style={styles.chipGrid}>
            {CLOTHING_SEASONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, selectedSeasons.includes(s) && styles.chipActive]}
                onPress={() => toggleSeason(s)}
              >
                <Text style={[styles.chipText, selectedSeasons.includes(s) && styles.chipTextActive]}>
                  {CLOTHING_SEASON_LABELS[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormField>

        <FormField label="Stiller">
          <View style={styles.chipGrid}>
            {CLOTHING_STYLES.map((st) => (
              <TouchableOpacity
                key={st}
                style={[styles.chip, selectedStyles.includes(st) && styles.chipActive]}
                onPress={() => toggleStyle(st)}
              >
                <Text style={[styles.chipText, selectedStyles.includes(st) && styles.chipTextActive]}>
                  {CLOTHING_STYLE_LABELS[st]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormField>

        <FormField label="Kumaş">
          <TextInput
            style={styles.input}
            value={material}
            onChangeText={setMaterial}
            placeholder="Örn: Pamuk, Polyester"
            placeholderTextColor="#9CA3AF"
          />
        </FormField>

        <FormField label="Desen">
          <TextInput
            style={styles.input}
            value={pattern}
            onChangeText={setPattern}
            placeholder="Örn: Düz, Çizgili, Çiçekli"
            placeholderTextColor="#9CA3AF"
          />
        </FormField>

        <FormField label="Ürün URL">
          <TextInput
            style={styles.input}
            value={productUrl}
            onChangeText={setProductUrl}
            placeholder="https://..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="url"
          />
        </FormField>

        <FormField label="Notlar">
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="İsteğe bağlı notlar..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </FormField>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Dolaba Ekle</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  backBtn: { color: '#6366F1', fontSize: 15, fontWeight: '500' },
  title: { fontSize: 20, fontWeight: '700', color: '#1E1B4B' },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 7 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { backgroundColor: '#EDE9FE', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  chipActive: { backgroundColor: '#6366F1' },
  chipText: { fontSize: 12, color: '#6366F1', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  analyzeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  analyzeText: { fontSize: 12, color: '#6366F1', fontStyle: 'italic' },
  errorText: { color: '#EF4444', fontSize: 13, marginBottom: 10 },
  submitBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { backgroundColor: '#A5B4FC' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
