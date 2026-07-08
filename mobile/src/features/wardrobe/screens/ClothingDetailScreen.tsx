import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ImagePreview } from '../../../shared/components/ImagePreview';
import { ImagePickerButton } from '../../../shared/components/ImagePickerButton';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  useClothingItem, useUpdateClothing, useDeleteClothing,
  useMarkClean, useMarkDirty,
} from '../hooks/useWardrobe';
import {
  ClothingCategory, ClothingSeason, ClothingStyle, ClothingItemRequest,
  CLOTHING_CATEGORIES, CATEGORY_LABELS,
  CLOTHING_SEASONS, CLOTHING_SEASON_LABELS,
  CLOTHING_STYLES, CLOTHING_STYLE_LABELS,
} from '../../../shared/types/clothing.types';
import { formatDate } from '../../../shared/utils/date';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ClothingDetail'>;

export function ClothingDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const itemId = params.id;
  const insets = useSafeAreaInsets();

  const { data: item, isLoading, isError } = useClothingItem(itemId);
  const { mutate: updateItem, isPending: updating } = useUpdateClothing(itemId);
  const { mutate: deleteItem, isPending: deleting } = useDeleteClothing();
  const { mutate: markClean, isPending: cleaning } = useMarkClean();
  const { mutate: markDirty, isPending: dirtying } = useMarkDirty();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editError, setEditError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

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

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (item && isEditMode) {
      setName(item.name);
      setCategory(item.category);
      setSubCategory(item.subCategory ?? '');
      setBrand(item.brand ?? '');
      setSize(item.size ?? '');
      setColors(item.colors?.join(', ') ?? '');
      setSelectedSeasons(item.seasons ?? []);
      setSelectedStyles(item.styles ?? []);
      setMaterial(item.material ?? '');
      setPattern(item.pattern ?? '');
      setProductUrl(item.productUrl ?? '');
      setImageUrl(item.imageUrl ?? '');
      setNotes(item.notes ?? '');
    }
  }, [item, isEditMode]);

  function handleSave() {
    setEditError('');
    if (!name.trim()) { setEditError('Kıyafet adı zorunludur.'); return; }
    if (!category) { setEditError('Kategori seçimi zorunludur.'); return; }

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
    };

    updateItem(payload, {
      onSuccess: () => setIsEditMode(false),
      onError: (err: unknown) => {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setEditError(axiosErr?.response?.data?.message ?? 'Güncelleme başarısız.');
      },
    });
  }

  function handleDelete() {
    deleteItem(itemId, {
      onSuccess: () => { setConfirmVisible(false); navigation.goBack(); },
    });
  }

  function handleCleanToggle() {
    if (!item) return;
    if (item.isClean) markDirty(itemId);
    else markClean(itemId);
  }

  if (!fontsLoaded || isLoading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#C9A86A" />
      </View>
    );
  }

  if (isError || !item) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorMsg}>Kıyafet bulunamadı.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>← Geri dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cleanPending = cleaning || dirtying;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#4A403A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isEditMode ? 'Düzenle' : item.name}
        </Text>
        {!isEditMode && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setIsEditMode(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.editBtnText}>Düzenle</Text>
          </TouchableOpacity>
        )}
        {isEditMode && <View style={{ width: 72 }} />}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── View Mode ──────────────────────────────────────── */}
        {!isEditMode && (
          <>
            <ImagePreview uri={item.imageUrl} size="large" />

            {/* Name + clean badge */}
            <View style={styles.titleRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={[styles.cleanBadge, !item.isClean && styles.dirtyBadge]}>
                <Text style={[styles.cleanBadgeText, !item.isClean && styles.dirtyBadgeText]}>
                  {item.isClean ? 'Temiz' : 'Kirli'}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <StatPill label="Giyilme" value={`${item.wearCount}x`} />
              {item.lastWornAt && (
                <StatPill label="Son giyilme" value={formatDate(item.lastWornAt)} />
              )}
            </View>

            {/* Info grid */}
            <View style={styles.infoGrid}>
              <InfoRow label="Kategori" value={CATEGORY_LABELS[item.category]} />
              {item.subCategory && <InfoRow label="Alt Kategori" value={item.subCategory} />}
              {item.brand && <InfoRow label="Marka" value={item.brand} />}
              {item.size && <InfoRow label="Beden" value={item.size} />}
              {item.colors && item.colors.length > 0 && (
                <InfoRow label="Renkler" value={item.colors.join(', ')} />
              )}
              {item.seasons && item.seasons.length > 0 && (
                <InfoRow
                  label="Mevsimler"
                  value={item.seasons.map((s) => CLOTHING_SEASON_LABELS[s] ?? s).join(', ')}
                />
              )}
              {item.styles && item.styles.length > 0 && (
                <InfoRow
                  label="Stiller"
                  value={item.styles.map((st) => CLOTHING_STYLE_LABELS[st] ?? st).join(', ')}
                />
              )}
              {item.material && <InfoRow label="Kumaş" value={item.material} isLast />}
              {item.pattern && <InfoRow label="Desen" value={item.pattern} isLast />}
              {item.notes && <InfoRow label="Notlar" value={item.notes} isLast />}
            </View>

            {/* Clean/dirty toggle */}
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                item.isClean ? styles.toggleBtnDirty : styles.toggleBtnClean,
                cleanPending && styles.btnDisabled,
              ]}
              onPress={handleCleanToggle}
              disabled={cleanPending}
              activeOpacity={0.85}
            >
              {cleanPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons
                    name={item.isClean ? 'water-outline' : 'checkmark-circle-outline'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.toggleBtnText}>
                    {item.isClean ? 'Kirli İşaretle' : 'Temiz İşaretle'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setConfirmVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
              <Text style={styles.deleteBtnText}>Kıyafeti Sil</Text>
            </TouchableOpacity>

            <ConfirmModal
              visible={confirmVisible}
              message="Bu kıyafet kalıcı olarak silinecek."
              isLoading={deleting}
              onConfirm={handleDelete}
              onCancel={() => setConfirmVisible(false)}
            />
          </>
        )}

        {/* ── Edit Mode ──────────────────────────────────────── */}
        {isEditMode && (
          <View>
            <FormField label="Fotoğraf">
              <ImagePickerButton
                folder="clothing"
                currentUrl={imageUrl.trim() || undefined}
                onUploaded={(url) => setImageUrl(url)}
              />
            </FormField>

            <FormField label="Kıyafet Adı *">
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Örn: Siyah Blazer"
                placeholderTextColor="rgba(31,31,31,0.40)"
              />
            </FormField>

            <FormField label="Kategori *">
              <View style={styles.chipGrid}>
                {CLOTHING_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, category === cat && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.8}
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
                placeholderTextColor="rgba(31,31,31,0.40)"
              />
            </FormField>

            <FormField label="Marka">
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="Örn: Zara"
                placeholderTextColor="rgba(31,31,31,0.40)"
              />
            </FormField>

            <FormField label="Beden">
              <TextInput
                style={styles.input}
                value={size}
                onChangeText={setSize}
                placeholder="Örn: M, 38"
                placeholderTextColor="rgba(31,31,31,0.40)"
              />
            </FormField>

            <FormField label="Renkler (virgülle ayırın)">
              <TextInput
                style={styles.input}
                value={colors}
                onChangeText={setColors}
                placeholder="Örn: Siyah, Beyaz"
                placeholderTextColor="rgba(31,31,31,0.40)"
              />
            </FormField>

            <FormField label="Mevsimler">
              <View style={styles.chipGrid}>
                {CLOTHING_SEASONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.chip, selectedSeasons.includes(s) && styles.chipActive]}
                    onPress={() =>
                      setSelectedSeasons((prev) =>
                        prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                      )
                    }
                    activeOpacity={0.8}
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
                    onPress={() =>
                      setSelectedStyles((prev) =>
                        prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]
                      )
                    }
                    activeOpacity={0.8}
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
                placeholderTextColor="rgba(31,31,31,0.40)"
              />
            </FormField>

            <FormField label="Desen">
              <TextInput
                style={styles.input}
                value={pattern}
                onChangeText={setPattern}
                placeholder="Örn: Düz, Çizgili"
                placeholderTextColor="rgba(31,31,31,0.40)"
              />
            </FormField>

            <FormField label="Ürün URL">
              <TextInput
                style={styles.input}
                value={productUrl}
                onChangeText={setProductUrl}
                placeholder="https://..."
                placeholderTextColor="rgba(31,31,31,0.40)"
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
                placeholderTextColor="rgba(31,31,31,0.40)"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </FormField>

            {editError ? <Text style={styles.errorMsg}>{editError}</Text> : null}

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setIsEditMode(false); setEditError(''); }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, updating && styles.btnDisabled]}
                onPress={handleSave}
                disabled={updating}
                activeOpacity={0.85}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View style={[styles.infoRow, isLast && styles.infoRowLast]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#4A403A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  editBtn: {
    backgroundColor: '#F0EDE8',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editBtnText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#4A403A',
  },

  // View mode
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  itemName: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    lineHeight: 28,
    color: '#4A403A',
  },
  cleanBadge: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  dirtyBadge: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.3)',
  },
  cleanBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#16A34A',
  },
  dirtyBadgeText: {
    color: '#DC2626',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statPill: {
    backgroundColor: 'rgba(201,168,106,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.25)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  statPillValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#C9A86A',
    lineHeight: 22,
  },
  statPillLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
    marginTop: 1,
  },

  // Info grid
  infoGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#9C8C84',
    flex: 1,
  },
  infoValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4A403A',
    flex: 2,
    textAlign: 'right',
  },

  // Toggle button
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    marginBottom: 10,
  },
  toggleBtnClean: {
    backgroundColor: '#22C55E',
  },
  toggleBtnDirty: {
    backgroundColor: '#F59E0B',
  },
  toggleBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },

  // Delete button
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.05)',
    marginBottom: 16,
  },
  deleteBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#EF4444',
  },

  // Edit mode
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    lineHeight: 20,
    color: '#4A403A',
    marginBottom: 7,
  },
  input: {
    backgroundColor: '#EAE3D8',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1F1F1F',
  },
  textArea: {
    height: 88,
    paddingTop: 12,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F0EDE8',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  chipActive: {
    backgroundColor: '#C9A86A',
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#9C8C84',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#4A403A',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // States
  errorMsg: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 10,
  },
  linkText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#C9A86A',
  },
});
