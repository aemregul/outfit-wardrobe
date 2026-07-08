import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { useKeycloak } from '../../../app/providers/AuthProvider';

const APP_VERSION = '1.0.0';

export function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { logout } = useKeycloak();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [morningReminder, setMorningReminder]           = useState(true);
  const [discoverOutfits, setDiscoverOutfits]           = useState(true);
  const [aiStylistTips, setAiStylistTips]               = useState(true);
  const [showLogoutModal, setShowLogoutModal]           = useState(false);
  const [showDeleteModal, setShowDeleteModal]           = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold,
  });

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ width: 38 }} />
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={18} color="#4A403A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 20) + 24 },
        ]}
      >
        {/* ── GENEL ── */}
        <SectionHeader title="Genel" />
        <View style={styles.card}>
          <NavRow label="Dil" isFirst />
          <View style={styles.themeRow}>
            <Text style={styles.rowLabel}>Tema</Text>
            <Text style={styles.themeNote}>
              Şu an yalnızca açık tema kullanılmaktadır. Karanlık tema ilerideki güncellemede gelecek.
            </Text>
          </View>
          <ToggleRow
            label="Bildirimler"
            value={notificationsEnabled}
            onChange={setNotificationsEnabled}
            isLast
          />
        </View>

        {/* ── GÜNLÜK BİLDİRİMLER ── */}
        <SectionHeader title="Günlük Bildirimler" />
        <View style={styles.card}>
          <NotifRow
            label="Sabah Kombinini Hatırlat"
            time="09:00"
            description="Her sabah bugünkü kombinini planlamanı hatırlatır"
            value={morningReminder}
            onChange={setMorningReminder}
            isFirst
          />
          <NotifRow
            label="Yeni Kombinleri Keşfet"
            time="13:00"
            description="Öğlen insanların paylaştığı yeni kombinleri bildirir"
            value={discoverOutfits}
            onChange={setDiscoverOutfits}
          />
          <NotifRow
            label="AI Stilist Önerileri"
            time="20:00"
            description="Akşam AI stilistinden kişiselleştirilmiş öneriler alırsın"
            value={aiStylistTips}
            onChange={setAiStylistTips}
            isLast
          />
          <View style={styles.notifFooter}>
            <Ionicons name="globe-outline" size={13} color="#9C8C84" />
            <Text style={styles.notifFooterText}>Bildirimler seçtiğin dilde gelir</Text>
          </View>
        </View>

        {/* ── VERİLERİ SENKRONIZE ET ── */}
        <SectionHeader title="Verileri Senkronize Et" />
        <View style={styles.card}>
          <NavRow label="Verileri Yönet" isFirst isLast />
        </View>

        {/* ── GİZLİLİK & GÜVENLİK ── */}
        <SectionHeader title="Gizlilik & Güvenlik" />
        <View style={styles.card}>
          <NavRow label="AI Veri Paylaşımı" isFirst />
          <NavRow label="Gizlilik Politikası" />
          <NavRow label="Kullanım Şartları" />
          <NavRow label="Yaş Derecelendirmesi & İçerik Uygunluğu" isLast />
        </View>

        {/* ── HESAP ── */}
        <SectionHeader title="Hesap" />
        <View style={styles.card}>
          <NavRow label="Gizlilik & Veri" isFirst />
          <DangerRow
            label="Hesabı Sil"
            onPress={() => setShowDeleteModal(true)}
            isLast
          />
        </View>

        {/* ── DESTEK ── */}
        <SectionHeader title="Destek" />
        <View style={styles.card}>
          <NavRow label="Yardım" isFirst />
          <NavRow label="SSS" />
          <NavRow label="Bize Ulaşın" />
          <NavRow label="Uygulamayı Değerlendir" />
          <NavRow
            label="Çıkış"
            onPress={() => setShowLogoutModal(true)}
            isLast
          />
        </View>

        <Text style={styles.version}>YourStyle v{APP_VERSION}</Text>
      </ScrollView>

      <ConfirmModal
        visible={showLogoutModal}
        title="Çıkış Yap"
        message="Hesabınızdan çıkış yapmak istediğinize emin misiniz?"
        confirmLabel="Çıkış Yap"
        onConfirm={async () => { setShowLogoutModal(false); await logout(); }}
        onCancel={() => setShowLogoutModal(false)}
      />
      <ConfirmModal
        visible={showDeleteModal}
        title="Hesabı Sil"
        message="Hesabınız kalıcı olarak silinecek ve tüm verileriniz kaybolacak. Bu işlem geri alınamaz."
        confirmLabel="Evet, Sil"
        onConfirm={() => setShowDeleteModal(false)}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
  );
}

function NavRow({
  label, onPress, isFirst, isLast,
}: {
  label: string;
  onPress?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, isFirst && styles.rowFirst, isLast && styles.rowLast]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#C4B8AF" />
    </TouchableOpacity>
  );
}

function ToggleRow({
  label, value, onChange, isFirst, isLast,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, isFirst && styles.rowFirst, isLast && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: '#C9A86A', false: '#E8E0D8' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function NotifRow({
  label, time, description, value, onChange, isFirst, isLast,
}: {
  label: string;
  time: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.notifRow, isFirst && styles.rowFirst, isLast && styles.notifRowLast]}>
      <View style={styles.notifLeft}>
        <View style={styles.notifTitleRow}>
          <Text style={styles.rowLabel}>{label}</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>{time}</Text>
          </View>
        </View>
        <Text style={styles.notifDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: '#C9A86A', false: '#E8E0D8' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function DangerRow({
  label, onPress, isFirst, isLast,
}: {
  label: string;
  onPress: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, isFirst && styles.rowFirst, isLast && styles.rowLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.rowLabel, styles.dangerLabel]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#FCA5A5" />
    </TouchableOpacity>
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
  sectionHeader: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    letterSpacing: 0.9,
    color: '#9C8C84',
    textTransform: 'uppercase',
    marginTop: 28,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  rowFirst: {},
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#4A403A',
    flex: 1,
  },
  themeRow: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: 5,
  },
  themeNote: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#9C8C84',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: 12,
  },
  notifRowLast: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  notifLeft: {
    flex: 1,
    gap: 5,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  timeBadge: {
    backgroundColor: '#1F1F1F',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  timeBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#C9A86A',
  },
  notifDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: '#9C8C84',
  },
  notifFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  notifFooterText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
  },
  dangerLabel: {
    color: '#EF4444',
  },
  version: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#B8AFA8',
    textAlign: 'center',
    marginTop: 32,
  },
});
