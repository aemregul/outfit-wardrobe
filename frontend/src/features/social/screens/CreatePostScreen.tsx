import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardLayout } from '../../../shared/components/Layout/DashboardLayout';
import { useCreatePost } from '../hooks/useSocial';
import { useOutfitList } from '../../outfits/hooks/useOutfits';
import { ImagePickerButton } from '../../../shared/components/ImagePickerButton';
import {
  Visibility, VISIBILITY_OPTIONS,
  VISIBILITY_LABELS, VISIBILITY_ICONS,
} from '../../../shared/types/social.types';
import type { RootStackParamList } from '../../../app/navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CreatePostScreen() {
  const navigation = useNavigation<Nav>();
  const { mutate: createPost, isPending } = useCreatePost();

  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');
  const [error, setError] = useState('');

  const { data: outfitPage } = useOutfitList({ size: 50 });
  const outfits = outfitPage?.content ?? [];

  function handleSubmit() {
    setError('');
    if (!imageUrl.trim()) {
      setError('Görsel URL zorunludur.');
      return;
    }
    if (!/^https?:\/\/.+\..+/i.test(imageUrl.trim())) {
      setError('Geçerli bir URL giriniz (https://...).');
      return;
    }

    createPost(
      {
        imageUrl: imageUrl.trim(),
        caption: caption.trim() || undefined,
        outfitId: selectedOutfitId ?? undefined,
        visibility,
      },
      {
        onSuccess: () => navigation.navigate('Feed'),
        onError: (err: any) => {
          setError(err?.response?.data?.message ?? 'Gönderi oluşturulamadı.');
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
          <Text style={styles.title}>Gönderi Oluştur</Text>
        </View>

        {/* Image Upload */}
        <View style={styles.field}>
          <Text style={styles.label}>Görsel *</Text>
          <ImagePickerButton
            folder="posts"
            currentUrl={imageUrl || undefined}
            onUploaded={(url) => setImageUrl(url)}
          />
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="veya URL girin (https://...)"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Caption */}
        <View style={styles.field}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={caption}
            onChangeText={setCaption}
            placeholder="Bu kombini nasıl değerlendiriyorsunuz?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Outfit picker */}
        {outfits.length > 0 && (
          <View style={styles.field}>
            <Text style={styles.label}>Kombin (opsiyonel)</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.outfitScroll}
            >
              <TouchableOpacity
                style={[styles.outfitChip, selectedOutfitId === null && styles.outfitChipActive]}
                onPress={() => setSelectedOutfitId(null)}
              >
                <Text style={[
                  styles.outfitChipText,
                  selectedOutfitId === null && styles.outfitChipTextActive,
                ]}>
                  Seçme
                </Text>
              </TouchableOpacity>
              {outfits.map((o) => (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.outfitChip, selectedOutfitId === o.id && styles.outfitChipActive]}
                  onPress={() => setSelectedOutfitId(o.id)}
                >
                  <Text style={[
                    styles.outfitChipText,
                    selectedOutfitId === o.id && styles.outfitChipTextActive,
                  ]} numberOfLines={1}>
                    {o.aiGenerated ? '✨ ' : ''}{o.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Visibility */}
        <View style={styles.field}>
          <Text style={styles.label}>Görünürlük</Text>
          <View style={styles.visibilityRow}>
            {VISIBILITY_OPTIONS.map((v) => (
              <TouchableOpacity
                key={v}
                style={[styles.visChip, visibility === v && styles.visChipActive]}
                onPress={() => setVisibility(v)}
              >
                <Text style={styles.visChipIcon}>{VISIBILITY_ICONS[v]}</Text>
                <Text style={[styles.visChipText, visibility === v && styles.visChipTextActive]}>
                  {VISIBILITY_LABELS[v]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Yayınla</Text>
          )}
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
  field: { marginBottom: 22 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: '#111827',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 10 },
  outfitScroll: { gap: 8, paddingVertical: 4 },
  outfitChip: {
    backgroundColor: '#EDE9FE', paddingHorizontal: 14,
    paddingVertical: 7, borderRadius: 20, maxWidth: 180,
  },
  outfitChipActive: { backgroundColor: '#6366F1' },
  outfitChipText: { fontSize: 13, color: '#6366F1', fontWeight: '500' },
  outfitChipTextActive: { color: '#fff' },
  visibilityRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  visChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EDE9FE', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20,
  },
  visChipActive: { backgroundColor: '#6366F1' },
  visChipIcon: { fontSize: 14 },
  visChipText: { fontSize: 13, color: '#6366F1', fontWeight: '500' },
  visChipTextActive: { color: '#fff' },
  errorText: { color: '#EF4444', fontSize: 14, marginBottom: 12 },
  submitBtn: {
    backgroundColor: '#6366F1', paddingVertical: 15,
    borderRadius: 10, alignItems: 'center', marginTop: 4,
  },
  submitBtnDisabled: { backgroundColor: '#A5B4FC' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
