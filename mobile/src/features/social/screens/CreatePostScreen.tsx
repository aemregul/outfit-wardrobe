import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreatePost } from '../hooks/useSocial';
import { useOutfitList } from '../../outfits/hooks/useOutfits';
import { ImagePickerButton } from '../../../shared/components/ImagePickerButton';
import {
  Visibility,
  VISIBILITY_OPTIONS,
  VISIBILITY_LABELS,
} from '../../../shared/types/social.types';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const VISIBILITY_CONFIG: Record<Visibility, { icon: string; label: string; desc: string }> = {
  PUBLIC:    { icon: 'earth-outline',   label: 'Herkese Açık', desc: 'Herkes görebilir' },
  FOLLOWERS: { icon: 'people-outline',  label: 'Takipçiler',   desc: 'Takipçilerin görebilir' },
  PRIVATE:   { icon: 'lock-closed-outline', label: 'Gizli',    desc: 'Sadece sen' },
};

export function CreatePostScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { mutate: createPost, isPending } = useCreatePost();

  const [imageUrl, setImageUrl]               = useState('');
  const [caption, setCaption]                 = useState('');
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [visibility, setVisibility]           = useState<Visibility>('PUBLIC');
  const [error, setError]                     = useState('');

  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  const { data: outfitPage } = useOutfitList({ size: 50 });
  const outfits = outfitPage?.content ?? [];

  const canPublish = imageUrl.trim().length > 0;

  function handleSubmit() {
    setError('');
    if (!imageUrl.trim()) {
      setError('Lütfen bir fotoğraf ekleyin.');
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
        onSuccess: () => navigation.navigate('OutfitList'),
        onError: (err: unknown) => {
          const e = err as { response?: { data?: { message?: string } } };
          setError(e?.response?.data?.message ?? 'Gönderi oluşturulamadı.');
        },
      },
    );
  }

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Drag handle */}
      <View style={styles.handleWrap}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>İptal</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Yeni Gönderi</Text>
        <TouchableOpacity
          style={[styles.publishBtn, !canPublish && styles.publishBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={isPending || !canPublish}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.publishText}>Paylaş</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
      >
        {/* Görsel */}
        <View style={styles.imageSection}>
          <ImagePickerButton
            folder="posts"
            currentUrl={imageUrl || undefined}
            onUploaded={(url) => setImageUrl(url)}
          />
        </View>

        {/* Açıklama */}
        <View style={styles.card}>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            placeholder="Kombinine dair bir şeyler yaz…"
            placeholderTextColor="#9C8C84"
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{caption.length}/500</Text>
        </View>

        {/* Kombine Bağla */}
        {outfits.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shirt-outline" size={16} color="#C9A86A" />
              <Text style={styles.sectionTitle}>Kombine Bağla</Text>
              <Text style={styles.sectionSub}>İsteğe bağlı</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              <TouchableOpacity
                style={[styles.chip, selectedOutfitId === null && styles.chipActive]}
                onPress={() => setSelectedOutfitId(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, selectedOutfitId === null && styles.chipTextActive]}>
                  Seçme
                </Text>
              </TouchableOpacity>
              {outfits.map(o => (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.chip, selectedOutfitId === o.id && styles.chipActive]}
                  onPress={() => setSelectedOutfitId(o.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.chipText, selectedOutfitId === o.id && styles.chipTextActive]}
                    numberOfLines={1}
                  >
                    {o.aiGenerated ? '✨ ' : ''}{o.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Görünürlük */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={16} color="#C9A86A" />
            <Text style={styles.sectionTitle}>Görünürlük</Text>
          </View>
          <View style={styles.visibilityList}>
            {VISIBILITY_OPTIONS.map(v => {
              const cfg = VISIBILITY_CONFIG[v];
              const isActive = visibility === v;
              return (
                <TouchableOpacity
                  key={v}
                  style={[styles.visRow, isActive && styles.visRowActive]}
                  onPress={() => setVisibility(v)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.visIconWrap, isActive && styles.visIconWrapActive]}>
                    <Ionicons
                      name={cfg.icon as any}
                      size={18}
                      color={isActive ? '#FFFFFF' : '#9C8C84'}
                    />
                  </View>
                  <View style={styles.visInfo}>
                    <Text style={[styles.visLabel, isActive && styles.visLabelActive]}>{cfg.label}</Text>
                    <Text style={styles.visDesc}>{cfg.desc}</Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={20} color="#C9A86A" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Hata */}
        {error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={16} color="#E74C3C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancelBtn: {
    height: 36,
    paddingHorizontal: 16,
    backgroundColor: '#F0EBE3',
    borderRadius: 9999,
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#4A403A',
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#4A403A',
  },
  publishBtn: {
    height: 36,
    paddingHorizontal: 20,
    backgroundColor: '#C9A86A',
    borderRadius: 9999,
    justifyContent: 'center',
    minWidth: 72,
    alignItems: 'center',
  },
  publishBtnDisabled: {
    backgroundColor: '#D9CFC5',
  },
  publishText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  // Görsel
  imageSection: {
    gap: 0,
  },

  // Caption
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#959595',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  captionInput: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4A403A',
    lineHeight: 22,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
    textAlign: 'right',
    marginTop: 6,
  },

  // Section
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#4A403A',
    flex: 1,
  },
  sectionSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#D9CFC5',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#C9A86A',
    borderColor: '#C9A86A',
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#9C8C84',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Visibility
  visibilityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#959595',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  visRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  visRowActive: {
    backgroundColor: 'rgba(201,168,106,0.06)',
  },
  visIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visIconWrapActive: {
    backgroundColor: '#C9A86A',
  },
  visInfo: { flex: 1 },
  visLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 18,
  },
  visLabelActive: {
    color: '#4A403A',
  },
  visDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
    lineHeight: 16,
  },

  // Hata
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(231,76,60,0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(231,76,60,0.2)',
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#E74C3C',
    flex: 1,
  },
});
