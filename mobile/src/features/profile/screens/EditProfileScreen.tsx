import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useMe, useUpdateMe } from '../../auth/hooks/useMe';
import type { AppNavigationProp } from '../../../app/navigation/types';

// ─── Chip options ────────────────────────────────────────────────
const GENDER_OPTIONS = ['Erkek', 'Kadın', 'Diğer', 'Belirtmek istemiyorum'];
const SKIN_TONES    = ['Çok Açık', 'Açık', 'Orta', 'Koyu', 'Çok Koyu'];
const SIZES         = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const STYLES        = ['Gündelik', 'Minimal', 'Resmi', 'Spor', 'Sokak', 'Bohem', 'Vintage', 'Lüks'];
const OCCASIONS     = ['İş', 'Gece Buluşması', 'Parti', 'Spor Salonu', 'Tatil', 'Düğün', 'Gündelik'];

export function EditProfileScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const { data: profile } = useMe();
  const { mutate: updateMe, isPending: isSaving } = useUpdateMe();

  // Basic info
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Physical info (UI-only until backend adds these fields)
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [size, setSize] = useState('');

  // Preferences (multi-select)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  const [editError, setEditError] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '');
      setBio(profile.bio ?? '');
      setProfileImageUrl(profile.profileImageUrl ?? '');
      setIsPrivate(profile.isPrivate);
      setSelectedStyles(profile.stylePreferences ?? []);
    }
  }, [profile]);

  const toggleMulti = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter(x => x !== value) : [...list, value]);
  };

  function handleSave() {
    setEditError('');
    if (!displayName.trim()) { setEditError('Görünen isim boş bırakılamaz.'); return; }
    if (!profile) {
      navigation.goBack();
      return;
    }

    updateMe(
      {
        username: profile.username,
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        profileImageUrl: profileImageUrl.trim() || undefined,
        isPrivate,
        stylePreferences: selectedStyles.length ? selectedStyles : undefined,
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: () => setEditError('Güncelleme sırasında bir hata oluştu.'),
      },
    );
  }

  if (!fontsLoaded) return <View style={styles.container} />;

  const displayProfile = profile ?? { username: 'ardaemre', email: 'ardaemregul36@gmail.com', profileImageUrl: null };
  const initial = (displayName || displayProfile.username || 'U')[0]?.toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close" size={20} color="#4A403A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 90 }]}
      >
        {/* ── Avatar ── */}
        <View style={styles.avatarSection}>
          {displayProfile.profileImageUrl ? (
            <Image source={{ uri: displayProfile.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.changePhotoBtn} activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={16} color="#4A403A" />
            <Text style={styles.changePhotoText}>Fotoğraf Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* ── Temel Bilgiler ── */}
        <SectionHeader title="Temel Bilgiler" />
        <View style={styles.card}>
          <Field label="Görünen İsim">
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="İsminizi girin"
              placeholderTextColor="rgba(31,31,31,0.38)"
            />
          </Field>
          <Field label="Kullanıcı Adı">
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>@{displayProfile.username}</Text>
            </View>
            <Text style={styles.fieldNote}>Kullanıcı adı değiştirilemez</Text>
          </Field>
          <Field label="E-posta" last>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{displayProfile.email}</Text>
            </View>
            <Text style={styles.fieldNote}>E-posta adresi değiştirilemez</Text>
          </Field>
        </View>

        <View style={[styles.card, { marginTop: 10 }]}>
          <Field label="Bio" last>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={bio}
              onChangeText={setBio}
              placeholder="Kendinizden kısaca bahsedin..."
              placeholderTextColor="rgba(31,31,31,0.38)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Field>
        </View>

        {/* ── Fiziksel Bilgiler ── */}
        <SectionHeader title="Fiziksel Bilgiler" />
        <View style={styles.card}>
          <Field label="Cinsiyet">
            <ChipRow
              options={GENDER_OPTIONS}
              selected={[gender]}
              onSelect={v => setGender(v === gender ? '' : v)}
              single
            />
          </Field>
          <Field label="Boy (cm) & Ağırlık (kg)">
            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                value={height}
                onChangeText={setHeight}
                placeholder="170"
                placeholderTextColor="rgba(31,31,31,0.38)"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                value={weight}
                onChangeText={setWeight}
                placeholder="65"
                placeholderTextColor="rgba(31,31,31,0.38)"
                keyboardType="numeric"
              />
            </View>
          </Field>
          <Field label="Cilt Tonu">
            <ChipRow
              options={SKIN_TONES}
              selected={[skinTone]}
              onSelect={v => setSkinTone(v === skinTone ? '' : v)}
              single
            />
          </Field>
          <Field label="Beden" last>
            <ChipRow
              options={SIZES}
              selected={[size]}
              onSelect={v => setSize(v === size ? '' : v)}
              single
            />
          </Field>
        </View>

        {/* ── Tercihler ── */}
        <SectionHeader title="Tercihler" />
        <View style={styles.card}>
          <Field label="Stiller">
            <ChipRow
              options={STYLES}
              selected={selectedStyles}
              onSelect={v => toggleMulti(selectedStyles, setSelectedStyles, v)}
            />
          </Field>
          <Field label="Durumlar" last>
            <ChipRow
              options={OCCASIONS}
              selected={selectedOccasions}
              onSelect={v => toggleMulti(selectedOccasions, setSelectedOccasions, v)}
            />
          </Field>
        </View>

        {/* ── Gizlilik ── */}
        <SectionHeader title="Gizlilik" />
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextWrap}>
              <Text style={styles.switchLabel}>Profil Görünürlüğü</Text>
              <Text style={styles.switchSub}>
                {isPrivate
                  ? 'Yalnızca takipçileriniz görebilir'
                  : 'Herkes profilinizi görebilir'}
              </Text>
            </View>
            <Switch
              value={!isPrivate}
              onValueChange={v => setIsPrivate(!v)}
              trackColor={{ true: '#C9A86A', false: '#E8E0D8' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {editError ? (
          <Text style={styles.errorMsg}>{editError}</Text>
        ) : null}
      </ScrollView>

      {/* ── Sticky Save Button ── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.88}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={sectionStyles.header}>{title}</Text>
  );
}

function Field({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <View style={[fieldStyles.wrap, last && fieldStyles.wrapLast]}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

function ChipRow({
  options, selected, onSelect, single,
}: {
  options: string[];
  selected: string[];
  onSelect: (v: string) => void;
  single?: boolean;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chipStyles.row}
    >
      {options.map(opt => {
        const isActive = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[chipStyles.chip, isActive && chipStyles.chipActive]}
            onPress={() => onSelect(opt)}
            activeOpacity={0.8}
          >
            <Text style={[chipStyles.text, isActive && chipStyles.textActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#4A403A',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#C9A86A',
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#C9A86A',
    backgroundColor: '#4A403A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 34,
    color: '#C9A86A',
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E8E0D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  changePhotoText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#4A403A',
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 4,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },

  // Inputs
  input: {
    backgroundColor: '#EAE3D8',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1F1F1F',
  },
  inputMulti: {
    height: 80,
    paddingTop: 12,
  },
  inputDisabled: {
    backgroundColor: 'rgba(234,227,216,0.5)',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  inputDisabledText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#9C8C84',
  },
  fieldNote: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#B8AFA8',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },

  // Switch
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 16,
  },
  switchTextWrap: {
    flex: 1,
  },
  switchLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#4A403A',
    marginBottom: 2,
  },
  switchSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
  },

  errorMsg: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },

  // Bottom save bar
  bottomBar: {
    backgroundColor: '#FDFBF7',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,168,106,0.15)',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 56,
    backgroundColor: '#C9A86A',
    borderRadius: 18,
    shadowColor: '#C9A86A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 5,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

const sectionStyles = StyleSheet.create({
  header: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#4A403A',
    marginTop: 24,
    marginBottom: 10,
  },
});

const fieldStyles = StyleSheet.create({
  wrap: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  wrapLast: {
    borderBottomWidth: 0,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#9C8C84',
  },
});

const chipStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#F0EDE8',
  },
  chipActive: {
    backgroundColor: '#C9A86A',
  },
  text: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#9C8C84',
  },
  textActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
});
