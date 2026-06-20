import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { DashboardLayout } from '../../../shared/components/Layout/DashboardLayout';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { useMe } from '../../auth/hooks/useMe';
import { useKeycloak } from '../../../app/providers/AuthProvider';
import { theme } from '../../../shared/theme';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8081';
const KEYCLOAK_REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM ?? 'outfit-combine';
const KEYCLOAK_CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'outfit-combine-web';
const APP_VERSION = '0.1.0';

export function SettingsScreen() {
  const { data: profile } = useMe();
  const { logout } = useKeycloak();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <DashboardLayout>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Ayarlar</Text>

        {/* Account summary */}
        <SectionCard title="Hesap Bilgileri">
          <SettingRow label="Kullanıcı Adı" value={profile?.username ?? '—'} />
          <SettingRow label="E-posta" value={profile?.email ?? '—'} />
          <SettingRow label="Görünen İsim" value={profile?.displayName ?? '—'} />
          <SettingRow
            label="Üyelik Tarihi"
            value={
              profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('tr-TR')
                : '—'
            }
          />
        </SectionCard>

        {/* Privacy */}
        <SectionCard title="Gizlilik">
          <SettingRow
            label="Hesap Görünürlüğü"
            value={profile?.isPrivate ? 'Gizli' : 'Herkese Açık'}
          />
          <InfoText>
            Gizli hesaplarda kombinleriniz ve paylaşımlarınız yalnızca siz tarafından görülebilir.
            Profil ekranından değiştirebilirsiniz.
          </InfoText>
        </SectionCard>

        {/* App info */}
        <SectionCard title="Uygulama Bilgileri">
          <SettingRow label="Uygulama Adı" value="Outfit Combine" />
          <SettingRow label="Versiyon" value={APP_VERSION} />
          <SettingRow label="Platform" value="Web" />
        </SectionCard>

        {/* Technical config */}
        <SectionCard title="Bağlantı Yapılandırması">
          <SettingRow label="API URL" value={API_BASE_URL} mono />
          <SettingRow label="Keycloak URL" value={KEYCLOAK_URL} mono />
          <SettingRow label="Realm" value={KEYCLOAK_REALM} mono />
          <SettingRow label="Client ID" value={KEYCLOAK_CLIENT_ID} mono />
        </SectionCard>

        {/* Session */}
        <SectionCard title="Oturum">
          <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutModal(true)}>
            <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </SectionCard>
      </ScrollView>

      <ConfirmModal
        visible={showLogoutModal}
        title="Çıkış Yap"
        message="Hesabınızdan çıkış yapmak istediğinize emin misiniz?"
        confirmLabel="Çıkış Yap"
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </DashboardLayout>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SettingRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, mono && styles.rowValueMono]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function InfoText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.infoText}>{children}</Text>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 28, paddingBottom: 48, gap: 16, maxWidth: 720 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: theme.colors.text, marginBottom: 4 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 20,
    ...theme.shadow.card,
    gap: 2,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  rowLabel: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600', flex: 1 },
  rowValue: { fontSize: 13, color: theme.colors.text, fontWeight: '500', flex: 2, textAlign: 'right' },
  rowValueMono: { fontFamily: 'monospace', fontSize: 11, color: theme.colors.textSecondary },
  infoText: { fontSize: 12, color: theme.colors.textMuted, lineHeight: 18, marginTop: 8, fontStyle: 'italic' },
  logoutBtn: {
    backgroundColor: theme.colors.errorBg,
    paddingVertical: 13,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: { color: theme.colors.error, fontSize: 15, fontWeight: '700' },
});
