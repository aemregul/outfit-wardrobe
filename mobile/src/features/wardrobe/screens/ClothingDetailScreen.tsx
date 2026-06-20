import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImagePreview } from '../../../shared/components/ImagePreview';
import { ImagePickerButton } from '../../../shared/components/ImagePickerButton';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
    if (item.isClean) {
      markDirty(itemId);
    } else {
      markClean(itemId);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorMsg}>Kıyafet bulunamadı.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>← Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cleanPending = cleaning || dirtying;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Geri</Text>
          </TouchableOpacity>
          {!isEditMode && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setIsEditMode(true)}
            >
              <Text style={styles.editBtnText}>Düzenle</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isEditMode && (
          <>
            <ImagePreview uri={item.imageUrl} size="large" />

            <View style={styles.titleRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={[styles.cleanBadge, !item.isClean && styles.dirtyBadge]}>
                <Text style={[styles.cleanBadgeText, !item.isClean && styles.dirtyBadgeText]}>
                  {item.isClean ? 'Temiz' : 'Kirli'}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatPill label="Giyilme" value={`${item.wearCount}x`} />
              {item.lastWornAt && (
                <StatPill label="Son giyilme" value={formatDate(item.lastWornAt)} />
              )}
            </View>

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
              {item.material && <InfoRow label="Kumaş" value={item.material} />}
              {item.pattern && <InfoRow label="Desen" value={item.pattern} />}
              {item.productUrl && <InfoRow label="Ürün URL" value={item.productUrl} />}
              {item.notes && <InfoRow label="Notlar" value={item.notes} />}
            </View>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                item.isClean ? styles.toggleBtnDirty : styles.toggleBtnClean,
                cleanPending && styles.btnDisabled,
              ]}
              onPress={handleCleanToggle}
              disabled={cleanPending}
            >
              {cleanPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.toggleBtnText}>
                  {item.isClean ? 'Kirli İşaretle' : 'Temiz İşaretle'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setConfirmVisible(true)}
            >
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

        {isEditMode && (
          <View>
            <Text style={styles.editTitle}>Kıyafeti Düzenle</Text>

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
                placeholder="Örn: M, 38"
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
                    onPress={() =>
                      setSelectedSeasons((prev) =>
                        prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                      )
                    }
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

            {editError ? <Text style={styles.errorMsg}>{editError}</Text> : null}

            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setIsEditMode(false); setEditError(''); }}
              >
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, updating && styles.btnDisabled]}
                onPress={handleSave}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
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
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: { color: '#6366F1', fontSize: 15, fontWeight: '500' },
  editBtn: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  editBtnText: { color: '#6366F1', fontWeight: '600', fontSize: 13 },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  itemName: { flex: 1, fontSize: 20, fontWeight: '700', color: '#1E1B4B' },
  cleanBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dirtyBadge: { backgroundColor: '#FEE2E2' },
  cleanBadgeText: { fontSize: 12, fontWeight: '700', color: '#065F46' },
  dirtyBadgeText: { color: '#991B1B' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  statPillValue: { fontSize: 16, fontWeight: '700', color: '#6366F1' },
  statPillLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  infoGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500', flex: 1 },
  infoValue: { fontSize: 13, color: '#1E1B4B', fontWeight: '600', flex: 2, textAlign: 'right' },

  toggleBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleBtnClean: { backgroundColor: '#10B981' },
  toggleBtnDirty: { backgroundColor: '#F59E0B' },
  toggleBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  deleteBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },

  editTitle: { fontSize: 20, fontWeight: '700', color: '#1E1B4B', marginBottom: 20 },
  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 7 },
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
  editActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#6B7280', fontWeight: '600' },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700' },

  errorMsg: { color: '#EF4444', fontSize: 13, marginBottom: 10 },
  linkText: { color: '#6366F1', fontSize: 14 },
});
