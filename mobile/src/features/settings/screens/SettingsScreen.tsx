import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { useMe } from '../../auth/hooks/useMe';
import { useKeycloak } from '../../../app/providers/AuthProvider';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';
const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8081';
const KEYCLOAK_REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM ?? 'outfit-combine';
const KEYCLOAK_CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID_NATIVE ?? 'outfit-combine-mobile';
const APP_VERSION = '0.1.0';

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { data: profile } = useMe();
  const { logout } = useKeycloak();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  async function handleLogout() {
    setShowLogoutModal(false);
    await logout();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Ayarlar</Text>
          <View style={styles.headerSpacer} />
        </View>

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

        <SectionCard title="Uygulama Bilgileri">
          <SettingRow label="Uygulama Adı" value="Outfit Combine" />
          <SettingRow label="Versiyon" value={APP_VERSION} />
          <SettingRow label="Platform" value="Mobile" />
        </SectionCard>

        <SectionCard title="Bağlantı Yapılandırması">
          <SettingRow label="API URL" value={API_BASE_URL} mono />
          <SettingRow label="Keycloak URL" value={KEYCLOAK_URL} mono />
          <SettingRow label="Realm" value={KEYCLOAK_REALM} mono />
          <SettingRow label="Client ID" value={KEYCLOAK_CLIENT_ID} mono />
        </SectionCard>

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
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
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
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 48, gap: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: { color: '#6366F1', fontSize: 15, fontWeight: '500' },
  pageTitle: { fontSize: 20, fontWeight: '700', color: '#1E1B4B' },
  headerSpacer: { width: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500', flex: 1 },
  rowValue: {
    fontSize: 13,
    color: '#1E1B4B',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  rowValueMono: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#4B5563',
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 8,
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
