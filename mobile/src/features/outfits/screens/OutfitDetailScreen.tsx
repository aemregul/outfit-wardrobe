import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import {
  useOutfit, useToggleFavorite, useDeleteOutfit, useMarkWorn,
} from '../hooks/useOutfits';
import { SEASON_LABELS } from '../../../shared/types/outfit.types';
import { toLocalDateTime } from '../../../shared/utils/date';
import { CATEGORY_LABELS } from '../../../shared/types/clothing.types';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'OutfitDetail'>;

export function OutfitDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const outfitId = params.id;
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

  const { data: outfit, isLoading, isError } = useOutfit(outfitId);
  const { mutate: toggleFavorite, isPending: favPending } = useToggleFavorite();
  const { mutate: deleteOutfit, isPending: deleting } = useDeleteOutfit();
  const { mutate: markWorn, isPending: markingWorn } = useMarkWorn();

  const [showWornForm, setShowWornForm] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [occasion, setOccasion] = useState('');
  const [wornSuccess, setWornSuccess] = useState(false);
  const [wornError, setWornError] = useState('');

  function handleMarkWorn() {
    setWornError('');
    const todayDate = new Date().toISOString().slice(0, 10);
    markWorn(
      {
        outfitId,
        data: {
          wornAt: toLocalDateTime(todayDate),
          rating: rating ?? undefined,
          note: note.trim() || undefined,
          occasion: occasion.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setWornSuccess(true);
          setShowWornForm(false);
          setRating(null);
          setNote('');
          setOccasion('');
        },
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          setWornError(axiosErr?.response?.data?.message ?? 'Bir hata oluştu.');
        },
      }
    );
  }

  function handleDelete() {
    deleteOutfit(outfitId, {
      onSuccess: () => { setConfirmVisible(false); navigation.goBack(); },
    });
  }

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FDFBF7' }} />;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C9A86A" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !outfit) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Kombin bulunamadı.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity
            onPress={() => toggleFavorite({ id: outfitId, isFavorite: outfit.isFavorite })}
            disabled={favPending}
            style={styles.favBtn}
          >
            <Text style={styles.favBtnText}>
              {outfit.isFavorite ? '★ Favoride' : '☆ Favoriye Ekle'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>{outfit.name}</Text>
          {outfit.aiGenerated && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
        </View>

        {outfit.description ? (
          <Text style={styles.description}>{outfit.description}</Text>
        ) : null}

        {outfit.aiGenerated && outfit.aiReason ? (
          <View style={styles.aiCard}>
            <Text style={styles.aiCardLabel}>AI Açıklaması</Text>
            <Text style={styles.aiCardText}>{outfit.aiReason}</Text>
            {outfit.aiScore != null && (
              <Text style={styles.aiScore}>Uyum Skoru: {(outfit.aiScore * 100).toFixed(0)}%</Text>
            )}
          </View>
        ) : null}

        {(
          (outfit.seasons ?? []).length > 0 ||
          (outfit.occasion ?? []).length > 0 ||
          (outfit.styles ?? []).length > 0
        ) && (
          <View style={styles.metaChips}>
            {(outfit.seasons ?? []).map((s) => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{SEASON_LABELS[s] ?? s}</Text>
              </View>
            ))}
            {(outfit.occasion ?? []).map((o) => (
              <View key={o} style={[styles.chip, styles.chipOccasion]}>
                <Text style={[styles.chipText, styles.chipOccasionText]}>{o}</Text>
              </View>
            ))}
            {(outfit.styles ?? []).map((st) => (
              <View key={st} style={[styles.chip, styles.chipStyle]}>
                <Text style={[styles.chipText, styles.chipStyleText]}>{st}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Kıyafetler ({outfit.clothingItems.length})</Text>
        {outfit.clothingItems.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemIcon}>
              <Text style={styles.itemIconText}>👕</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>
                {CATEGORY_LABELS[item.category]}
                {item.brand ? ` · ${item.brand}` : ''}
                {item.size ? ` · ${item.size}` : ''}
              </Text>
            </View>
            <View style={[styles.cleanDot, !item.isClean && styles.dirtyDot]} />
          </View>
        ))}

        {wornSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Kombin giyildi olarak işaretlendi!</Text>
          </View>
        )}

        {!wornSuccess && (
          <>
            {!showWornForm ? (
              <TouchableOpacity
                style={styles.wornBtn}
                onPress={() => setShowWornForm(true)}
              >
                <Text style={styles.wornBtnText}>Giyildi İşaretle</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.wornForm}>
                <Text style={styles.wornFormTitle}>Giyilme Detayları</Text>

                <Text style={styles.fieldLabel}>Puan (opsiyonel)</Text>
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.ratingStar, rating === r && styles.ratingStarActive]}
                      onPress={() => setRating(rating === r ? null : r)}
                    >
                      <Text style={[styles.ratingStarText, rating === r && styles.ratingStarTextActive]}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>Etkinlik (opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  value={occasion}
                  onChangeText={setOccasion}
                  placeholder="Örn: İş toplantısı, akşam yemeği..."
                  placeholderTextColor="#C4B8AF"
                />

                <Text style={styles.fieldLabel}>Not (opsiyonel)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Nasıl hissettiniz?"
                  placeholderTextColor="#C4B8AF"
                  multiline
                  numberOfLines={2}
                />

                {wornError ? <Text style={styles.errorText}>{wornError}</Text> : null}

                <View style={styles.wornFormActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => { setShowWornForm(false); setWornError(''); }}
                  >
                    <Text style={styles.cancelBtnText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmWornBtn, markingWorn && styles.confirmWornBtnDisabled]}
                    onPress={handleMarkWorn}
                    disabled={markingWorn}
                  >
                    {markingWorn ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.confirmWornBtnText}>Kaydet</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setConfirmVisible(true)}
        >
          <Text style={styles.deleteBtnText}>Kombini Sil</Text>
        </TouchableOpacity>

        <ConfirmModal
          visible={confirmVisible}
          message="Bu kombin kalıcı olarak silinecek."
          isLoading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDFBF7' },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
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
  favBtn: {
    backgroundColor: '#F0EDE8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  favBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#C9A86A', fontSize: 13 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  title: { flex: 1, fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#4A403A' },
  aiBadge: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: { fontFamily: 'Poppins_700Bold', color: '#C9A86A', fontSize: 11 },
  description: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9C8C84', marginBottom: 16, lineHeight: 22 },
  aiCard: {
    backgroundColor: '#F0EDE8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  aiCardLabel: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#C9A86A', marginBottom: 4, letterSpacing: 0.5 },
  aiCardText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#4A403A', lineHeight: 22, marginBottom: 6 },
  aiScore: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#C9A86A' },
  metaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  chip: {
    backgroundColor: '#F0EDE8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipOccasion: { backgroundColor: '#FEF3C7' },
  chipStyle: { backgroundColor: 'rgba(74,64,58,0.06)' },
  chipText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#9C8C84' },
  chipOccasionText: { color: '#92400E' },
  chipStyleText: { color: '#4A403A' },
  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#4A403A',
    marginBottom: 12,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F0EDE8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemIconText: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#4A403A' },
  itemMeta: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9C8C84', marginTop: 2 },
  cleanDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  dirtyDot: { backgroundColor: '#EF4444' },
  successBanner: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    alignItems: 'center',
  },
  successText: { fontFamily: 'Poppins_600SemiBold', color: '#065F46', fontSize: 14 },
  wornBtn: {
    backgroundColor: '#1F1F1F',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  wornBtnText: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 15 },
  wornForm: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  wornFormTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#4A403A', marginBottom: 16 },
  fieldLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#4A403A', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  ratingStar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F0EDE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingStarActive: { backgroundColor: '#C9A86A' },
  ratingStarText: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#9C8C84' },
  ratingStarTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#FDFBF7',
    borderWidth: 1,
    borderColor: 'rgba(74,64,58,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4A403A',
    marginBottom: 12,
  },
  textArea: { minHeight: 60, textAlignVertical: 'top' },
  wornFormActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
  },
  cancelBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#9C8C84' },
  confirmWornBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
  },
  confirmWornBtnDisabled: { backgroundColor: 'rgba(201,168,106,0.4)' },
  confirmWornBtnText: { fontFamily: 'Poppins_700Bold', color: '#fff' },
  errorText: { fontFamily: 'Poppins_400Regular', color: '#EF4444', fontSize: 13, marginBottom: 8 },
  deleteBtn: {
    marginTop: 20,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
  },
  deleteBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#EF4444', fontSize: 14 },
  linkText: { fontFamily: 'Poppins_500Medium', color: '#C9A86A', fontSize: 14 },
});
