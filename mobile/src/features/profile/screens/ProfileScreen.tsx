import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, StyleSheet, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMe, useUpdateMe } from '../../auth/hooks/useMe';
import { ImagePickerButton } from '../../../shared/components/ImagePickerButton';

export function ProfileScreen() {
  const { data: profile, isLoading, isError, refetch } = useMe();
  const { mutate: updateMe, isPending: isSaving } = useUpdateMe();

  const [isEditMode, setIsEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [styleInput, setStyleInput] = useState('');
  const [editError, setEditError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode && profile) {
      setDisplayName(profile.displayName ?? '');
      setBio(profile.bio ?? '');
      setProfileImageUrl(profile.profileImageUrl ?? '');
      setIsPrivate(profile.isPrivate);
      setStyleInput((profile.stylePreferences ?? []).join(', '));
      setEditError('');
      setSaveSuccess(false);
    }
  }, [isEditMode, profile]);

  function handleSave() {
    if (!profile) return;
    setEditError('');
    setSaveSuccess(false);

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setEditError('Kullanıcı adı boş bırakılamaz.');
      return;
    }

    const stylePreferences = styleInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateMe(
      {
        username: profile.username,
        displayName: trimmedName || undefined,
        bio: bio.trim() || undefined,
        profileImageUrl: profileImageUrl.trim() || undefined,
        isPrivate,
        stylePreferences: stylePreferences.length ? stylePreferences : undefined,
      },
      {
        onSuccess: () => {
          setSaveSuccess(true);
          setIsEditMode(false);
        },
        onError: () => {
          setEditError('Güncelleme sırasında bir hata oluştu.');
        },
      },
    );
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

  if (isError || !profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Profil yüklenemedi.</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryText}>Tekrar dene</Text>
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
          <Text style={styles.title}>Profilim</Text>
          {!isEditMode && (
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditMode(true)}>
              <Text style={styles.editBtnText}>Düzenle</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.avatarRow}>
          {profile.profileImageUrl ? (
            <Image source={{ uri: profile.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {(profile.displayName ?? profile.username)[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={styles.avatarInfo}>
            <Text style={styles.usernameText}>@{profile.username}</Text>
            {profile.displayName ? (
              <Text style={styles.displayNameText}>{profile.displayName}</Text>
            ) : null}
            <View style={[styles.privacyBadge, profile.isPrivate && styles.privacyBadgePrivate]}>
              <Text style={styles.privacyBadgeText}>{profile.isPrivate ? 'Gizli' : 'Herkese Açık'}</Text>
            </View>
          </View>
        </View>

        {saveSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Profil güncellendi.</Text>
          </View>
        )}

        {!isEditMode && (
          <View style={styles.section}>
            <InfoRow label="E-posta" value={profile.email} />
            <InfoRow label="Kullanıcı Adı" value={profile.username} />
            <InfoRow label="Görünen İsim" value={profile.displayName ?? '—'} />
            <InfoRow label="Bio" value={profile.bio ?? '—'} />
            <InfoRow
              label="Stil Tercihleri"
              value={profile.stylePreferences?.join(', ') || '—'}
            />
            <InfoRow label="Hesap" value={profile.isPrivate ? 'Gizli' : 'Herkese Açık'} />
            <InfoRow
              label="Üyelik Tarihi"
              value={new Date(profile.createdAt).toLocaleDateString('tr-TR')}
            />
          </View>
        )}

        {isEditMode && (
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Görünen İsim</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Görünen isminiz"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={setBio}
              placeholder="Kendinizden bahsedin..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Profil Fotoğrafı</Text>
            <ImagePickerButton
              folder="profiles"
              currentUrl={profileImageUrl || undefined}
              onUploaded={(url) => setProfileImageUrl(url)}
            />

            <Text style={styles.fieldLabel}>Stil Tercihleri (virgülle ayırın)</Text>
            <TextInput
              style={styles.input}
              value={styleInput}
              onChangeText={setStyleInput}
              placeholder="casual, minimalist, sporty"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />

            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>Hesabı Gizli Yap</Text>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ true: '#6366F1', false: '#D1D5DB' }}
                thumbColor="#fff"
              />
            </View>

            {editError ? <Text style={styles.errorText}>{editError}</Text> : null}

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Kaydet</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditMode(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1E1B4B' },
  editBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: '#fff' },
  avatarInfo: { flex: 1, gap: 4 },
  usernameText: { fontSize: 16, fontWeight: '600', color: '#1E1B4B' },
  displayNameText: { fontSize: 14, color: '#6B7280' },
  privacyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  privacyBadgePrivate: { backgroundColor: '#FEF3C7' },
  privacyBadgeText: { fontSize: 11, fontWeight: '600', color: '#065F46' },
  successBanner: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: { color: '#065F46', fontWeight: '600', fontSize: 14 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#1E1B4B', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 8, marginBottom: 4 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E1B4B',
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#374151', fontWeight: '600', fontSize: 15 },
  errorText: { fontSize: 14, color: '#EF4444', fontWeight: '500' },
  retryText: { fontSize: 14, color: '#6366F1', textDecorationLine: 'underline' },
});
