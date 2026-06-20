import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity,
  ActivityIndicator, ScrollView, StyleSheet, Switch,
} from 'react-native';
import { DashboardLayout } from '../../../shared/components/Layout/DashboardLayout';
import { useMe, useUpdateMe } from '../../auth/hooks/useMe';
import { ImagePickerButton } from '../../../shared/components/ImagePickerButton';
import { theme } from '../../../shared/theme';

export function ProfileScreen() {
  const { data: profile, isLoading, isError, refetch } = useMe();
  const { mutate: updateMe, isPending: isSaving, error: saveError } = useUpdateMe();

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
      <DashboardLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </DashboardLayout>
    );
  }

  if (isError || !profile) {
    return (
      <DashboardLayout>
        <View style={styles.center}>
          <Text style={styles.errorText}>Profil yüklenemedi.</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profilim</Text>
          {!isEditMode && (
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditMode(true)}>
              <Text style={styles.editBtnText}>Düzenle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar */}
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

        {/* Detail view */}
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

        {/* Edit form */}
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
            <TextInput
              style={styles.input}
              value={profileImageUrl}
              onChangeText={setProfileImageUrl}
              placeholder="veya URL girin (https://...)"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="url"
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
    </DashboardLayout>
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
  scroll: { flex: 1 },
  container: { padding: 28, paddingBottom: 48, maxWidth: 720 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.text },
  editBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: theme.radius.md },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  avatarRow: {
    flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 28,
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl,
    padding: 20, ...theme.shadow.card,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: theme.colors.indigo100 },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: theme.colors.primaryLight,
  },
  avatarInitial: { fontSize: 32, fontWeight: '800', color: '#fff' },
  avatarInfo: { flex: 1, gap: 5 },
  usernameText: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  displayNameText: { fontSize: 14, color: theme.colors.textSecondary },
  privacyBadge: { alignSelf: 'flex-start', backgroundColor: theme.colors.successBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full, marginTop: 2 },
  privacyBadgePrivate: { backgroundColor: theme.colors.warningBg },
  privacyBadgeText: { fontSize: 11, fontWeight: '700', color: theme.colors.successText },

  successBanner: { backgroundColor: theme.colors.successBg, borderRadius: theme.radius.md, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: theme.colors.success },
  successText: { color: theme.colors.successText, fontWeight: '700', fontSize: 14 },

  section: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl, padding: 20, ...theme.shadow.card, gap: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  infoLabel: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
  infoValue: { fontSize: 13, color: theme.colors.text, fontWeight: '500', maxWidth: '60%', textAlign: 'right' },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.textMuted, marginTop: 14, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: theme.colors.text,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  formActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  saveBtn: { flex: 1, backgroundColor: theme.colors.primary, paddingVertical: 13, borderRadius: theme.radius.md, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { flex: 1, backgroundColor: theme.colors.borderLight, paddingVertical: 13, borderRadius: theme.radius.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  cancelBtnText: { color: theme.colors.textSecondary, fontWeight: '600', fontSize: 15 },
  errorText: { fontSize: 14, color: theme.colors.error, fontWeight: '600' },
  retryText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
});
