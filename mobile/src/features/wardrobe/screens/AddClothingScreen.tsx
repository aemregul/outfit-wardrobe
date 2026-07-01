import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Modal, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import type { AppNavigationProp } from '../../../app/navigation/types';

// ── Sabit veriler ────────────────────────────────────────────────

const CATEGORIES = [
  'Üst Giyim', 'Alt Giyim', 'Elbiseler',
  'Dış Giyim', 'Ayakkabı', 'Aksesuar',
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const SEASONS = ['Tüm Sezonlar', 'İlkbahar', 'Yaz', 'Sonbahar', 'Kış'];

const STATUSES = ['Gündelik', 'Resmi', 'İş', 'Parti', 'Buluşma', 'Spor', 'Seyahat'];

const COLORS: { name: string; hex: string }[] = [
  { name: 'Siyah',      hex: '#1A1A1A' },
  { name: 'Beyaz',      hex: '#F5F5F0' },
  { name: 'Gri',        hex: '#9CA3AF' },
  { name: 'Lacivert',   hex: '#1E3A5F' },
  { name: 'Mavi',       hex: '#3B82F6' },
  { name: 'Açık Mavi',  hex: '#93C5FD' },
  { name: 'Kırmızı',    hex: '#EF4444' },
  { name: 'Bordo',      hex: '#7F1D1D' },
  { name: 'Pembe',      hex: '#F9A8D4' },
  { name: 'Mor',        hex: '#8B5CF6' },
  { name: 'Lila',       hex: '#C4B5FD' },
  { name: 'Yeşil',      hex: '#22C55E' },
  { name: 'Haki',       hex: '#6B7C4D' },
  { name: 'Sarı',       hex: '#FACC15' },
  { name: 'Turuncu',    hex: '#F97316' },
  { name: 'Bej',        hex: '#E5D3B3' },
  { name: 'Krem',       hex: '#FEF3C7' },
  { name: 'Kahverengi', hex: '#92400E' },
  { name: 'Ten',        hex: '#F5CBA7' },
  { name: 'Altın',      hex: '#C9A86A' },
];

// ── Picker Modal bileşeni ────────────────────────────────────────

type PickerModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function PickerModal({ visible, title, onClose, children }: PickerModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modal.overlay}>
        <TouchableOpacity style={modal.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[modal.sheet, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          <View style={modal.handle} />
          <View style={modal.header}>
            <Text style={modal.title}>{title}</Text>
            <TouchableOpacity style={modal.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#4A403A',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── Ana ekran ────────────────────────────────────────────────────

export function AddClothingScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();

  const [name,     setName]     = useState('');
  const [category, setCategory] = useState('');
  const [color,    setColor]    = useState<{ name: string; hex: string } | null>(null);
  const [size,     setSize]     = useState('');
  const [brand,    setBrand]    = useState('');
  const [price,    setPrice]    = useState('');
  const [season,   setSeason]   = useState('Tüm Sezonlar');
  const [status,   setStatus]   = useState('Gündelik');
  const [notes,    setNotes]    = useState('');

  const [showCategory, setShowCategory] = useState(false);
  const [showColor,    setShowColor]    = useState(false);
  const [showSize,     setShowSize]     = useState(false);
  const [showSeason,   setShowSeason]   = useState(false);
  const [showStatus,   setShowStatus]   = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      {/* Yuvarlak köşe + handle */}
      <View style={styles.sheetTopBar}>
        <View style={styles.dragHandle} />
      </View>

      {/* ── Sabit Header ── */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Yeni Öğe Ekle</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Ürün Fotoğrafı ── */}
        <Text style={styles.sectionLabel}>ÜRÜN FOTOĞRAFI</Text>

        <TouchableOpacity style={styles.photoCard} activeOpacity={0.85}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <View style={styles.uploadContent}>
            <Ionicons name="camera-outline" size={44} color="#1F1F1F" />
            <Text style={styles.uploadTitle}>Fotoğraf Yükle</Text>
            <Text style={styles.uploadSubtitle}>Yapay zeka otomatik analiz eder</Text>
          </View>
        </TouchableOpacity>

        {/* ── Temel Bilgiler ── */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>TEMEL BİLGİLER</Text>

        <View style={styles.formCard}>

          {/* Öğe Adı */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Öğe Adı</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="İsim girin"
              placeholderTextColor="rgba(31,31,31,0.45)"
            />
          </View>

          {/* Kategori */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Kategori</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              activeOpacity={0.8}
              onPress={() => setShowCategory(true)}
            >
              <Text style={[styles.selectBtnText, !category && styles.placeholderText]}>
                {category || 'Seçin'}
              </Text>
              <Ionicons name="chevron-down" size={13} color="#4A403A" />
            </TouchableOpacity>
          </View>

          {/* Renk + Beden */}
          <View style={[styles.fieldRow, { marginBottom: 0 }]}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Renk</Text>
              <TouchableOpacity
                style={styles.selectBtn}
                activeOpacity={0.8}
                onPress={() => setShowColor(true)}
              >
                {color ? (
                  <View style={styles.colorPreviewRow}>
                    <View style={[
                      styles.colorDot,
                      { backgroundColor: color.hex },
                      color.hex === '#F5F5F0' && { borderWidth: 1, borderColor: '#E5E7EB' },
                    ]} />
                    <Text style={styles.selectBtnText} numberOfLines={1}>{color.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Seçin</Text>
                )}
                <Ionicons name="chevron-down" size={13} color="#4A403A" />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Beden</Text>
              <TouchableOpacity
                style={styles.selectBtn}
                activeOpacity={0.8}
                onPress={() => setShowSize(true)}
              >
                <Text style={[styles.selectBtnText, !size && styles.placeholderText]}>
                  {size || 'Seçin'}
                </Text>
                <Ionicons name="chevron-down" size={13} color="#4A403A" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Ek Bilgiler ── */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>EK BİLGİLER</Text>

        <View style={styles.formCard}>

          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Marka</Text>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="Markayı girin"
                placeholderTextColor="rgba(31,31,31,0.45)"
              />
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Fiyat</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00 ₺"
                placeholderTextColor="rgba(31,31,31,0.45)"
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Sezon + Durum */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Sezon</Text>
              <TouchableOpacity
                style={styles.selectBtn}
                activeOpacity={0.8}
                onPress={() => setShowSeason(true)}
              >
                <Text style={styles.selectBtnText} numberOfLines={1}>{season}</Text>
                <Ionicons name="chevron-down" size={13} color="#4A403A" />
              </TouchableOpacity>
            </View>
            <View style={styles.fieldHalf}>
              <Text style={styles.fieldLabel}>Durum</Text>
              <TouchableOpacity
                style={styles.selectBtn}
                activeOpacity={0.8}
                onPress={() => setShowStatus(true)}
              >
                <Text style={styles.selectBtnText} numberOfLines={1}>{status}</Text>
                <Ionicons name="chevron-down" size={13} color="#4A403A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notlar */}
          <View style={{ marginBottom: 0 }}>
            <Text style={styles.fieldLabel}>Notlar</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Bu öğe hakkında not ekleyin..."
              placeholderTextColor="rgba(31,31,31,0.45)"
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

      </ScrollView>

      {/* ── Alt Kaydet Butonu ── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={() => navigation.goBack()}>
          <View style={styles.saveBtnCircle}>
            <Ionicons name="checkmark" size={16} color="#4A403A" />
          </View>
          <Text style={styles.saveBtnText}>Dolaba Kaydet</Text>
        </TouchableOpacity>
      </View>

      {/* ── Kategori Modal ── */}
      <PickerModal
        visible={showCategory}
        title="Kategori"
        onClose={() => setShowCategory(false)}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.listRow,
                i === CATEGORIES.length - 1 && styles.listRowLast,
                category === cat && styles.listRowActive,
              ]}
              activeOpacity={0.7}
              onPress={() => { setCategory(cat); setShowCategory(false); }}
            >
              <Text style={[styles.listRowText, category === cat && styles.listRowTextActive]}>
                {cat}
              </Text>
              {category === cat && <Ionicons name="checkmark" size={18} color="#C9A86A" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </PickerModal>

      {/* ── Renk Modal ── */}
      <PickerModal
        visible={showColor}
        title="Renk"
        onClose={() => setShowColor(false)}
      >
        <FlatList
          data={COLORS}
          numColumns={4}
          keyExtractor={item => item.hex}
          columnWrapperStyle={{ gap: 12, marginBottom: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: c }) => {
            const selected = color?.hex === c.hex;
            const isLight = ['#F5F5F0','#FEF3C7','#F5CBA7','#FACC15','#E5D3B3','#93C5FD','#C4B5FD','#F9A8D4'].includes(c.hex);
            return (
              <TouchableOpacity
                style={styles.colorItem}
                activeOpacity={0.8}
                onPress={() => { setColor(c); setShowColor(false); }}
              >
                <View style={[
                  styles.colorCircle,
                  { backgroundColor: c.hex },
                  isLight && { borderWidth: 1, borderColor: '#D1D5DB' },
                  selected && styles.colorCircleSelected,
                ]}>
                  {selected && (
                    <Ionicons name="checkmark" size={18} color={isLight ? '#1A1A1A' : '#FFFFFF'} />
                  )}
                </View>
                <Text style={styles.colorName} numberOfLines={1}>{c.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </PickerModal>

      {/* ── Beden Modal ── */}
      <PickerModal
        visible={showSize}
        title="Beden"
        onClose={() => setShowSize(false)}
      >
        <View style={styles.sizeGrid}>
          {SIZES.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sizeChip, size === s && styles.sizeChipActive]}
              activeOpacity={0.8}
              onPress={() => { setSize(s); setShowSize(false); }}
            >
              <Text style={[styles.sizeChipText, size === s && styles.sizeChipTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </PickerModal>

      {/* ── Sezon Modal ── */}
      <PickerModal
        visible={showSeason}
        title="Sezon"
        onClose={() => setShowSeason(false)}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {SEASONS.map((s, i) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.listRow,
                i === SEASONS.length - 1 && styles.listRowLast,
                season === s && styles.listRowActive,
              ]}
              activeOpacity={0.7}
              onPress={() => { setSeason(s); setShowSeason(false); }}
            >
              <Text style={[styles.listRowText, season === s && styles.listRowTextActive]}>{s}</Text>
              {season === s && <Ionicons name="checkmark" size={18} color="#C9A86A" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </PickerModal>

      {/* ── Durum Modal ── */}
      <PickerModal
        visible={showStatus}
        title="Durum"
        onClose={() => setShowStatus(false)}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {STATUSES.map((s, i) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.listRow,
                i === STATUSES.length - 1 && styles.listRowLast,
                status === s && styles.listRowActive,
              ]}
              activeOpacity={0.7}
              onPress={() => { setStatus(s); setShowStatus(false); }}
            >
              <Text style={[styles.listRowText, status === s && styles.listRowTextActive]}>{s}</Text>
              {status === s && <Ionicons name="checkmark" size={18} color="#C9A86A" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </PickerModal>

    </View>
  );
}

// ── Stiller ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetTopBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerSpacer: { width: 40 },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    lineHeight: 28,
    color: '#4A403A',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  content: { paddingHorizontal: 20, paddingTop: 8 },

  sectionLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.70,
    color: '#4A403A',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionLabelSpacing: { marginTop: 24 },

  photoCard: {
    width: '100%',
    aspectRatio: 350 / 338,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#C9A86A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.10,
    shadowRadius: 40,
    elevation: 4,
  },
  corner: { position: 'absolute', width: 32, height: 32, borderColor: '#C9A86A' },
  cornerTL: { top: 19, left: 19, borderTopLeftRadius: 24, borderTopWidth: 4, borderLeftWidth: 4 },
  cornerTR: { top: 19, right: 19, borderTopRightRadius: 24, borderTopWidth: 4, borderRightWidth: 4 },
  cornerBL: { bottom: 19, left: 19, borderBottomLeftRadius: 24, borderBottomWidth: 4, borderLeftWidth: 4 },
  cornerBR: { bottom: 19, right: 19, borderBottomRightRadius: 24, borderBottomWidth: 4, borderRightWidth: 4 },
  uploadContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  uploadTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    lineHeight: 28,
    color: '#1F1F1F',
    marginTop: 4,
  },
  uploadSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    lineHeight: 16,
    color: 'rgba(31,31,31,0.50)',
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#C9A86A',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldBlock: { marginBottom: 14 },
  fieldRow: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  fieldHalf: { flex: 1 },
  fieldLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    lineHeight: 28,
    color: '#1F1F1F',
  },

  input: {
    backgroundColor: '#EAE3D8',
    borderRadius: 10,
    height: 39,
    paddingHorizontal: 13,
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#1F1F1F',
  },
  inputMultiline: { height: 89, paddingTop: 10 },

  selectBtn: {
    backgroundColor: '#EAE3D8',
    borderRadius: 10,
    height: 39,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#1F1F1F',
    flex: 1,
  },
  placeholderText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(31,31,31,0.45)',
    flex: 1,
  },
  colorPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  colorDot: { width: 14, height: 14, borderRadius: 7 },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  listRowLast: { borderBottomWidth: 0 },
  listRowActive: {},
  listRowText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#4A403A',
  },
  listRowTextActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#C9A86A',
  },

  colorItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#C9A86A',
  },
  colorName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: '#4A403A',
    textAlign: 'center',
  },

  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 8,
  },
  sizeChip: {
    width: 80,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EAE3D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeChipActive: { backgroundColor: '#C9A86A' },
  sizeChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#4A403A',
  },
  sizeChipTextActive: { color: '#FFFFFF' },

  bottomBar: {
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,168,106,0.15)',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 60,
    backgroundColor: '#C9A86A',
    borderRadius: 24,
    shadowColor: '#D4A373',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30,
    shadowRadius: 15,
    elevation: 6,
  },
  saveBtnCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(217,217,217,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
  },
});
