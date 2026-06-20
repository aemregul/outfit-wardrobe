import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardLayout } from '../../../shared/components/Layout/DashboardLayout';
import { useAuthStore } from '../../auth/store/authStore';
import { useMe } from '../../auth/hooks/useMe';
import { useClothingList } from '../../wardrobe/hooks/useWardrobe';
import { useOutfitList } from '../../outfits/hooks/useOutfits';
import { useWearLogList } from '../../wearlogs/hooks/useWearLogs';
import { formatDate } from '../../../shared/utils/date';
import { theme } from '../../../shared/theme';
import type { RootStackParamList } from '../../../app/navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const QUICK_ACTIONS = [
  { icon: '▣', label: 'Dolabım',          desc: 'Kıyafetlerini yönet',    screen: 'WardrobeList' as const, color: '#6366F1' },
  { icon: '+', label: 'Kıyafet Ekle',     desc: 'Yeni kıyafet ekle',      screen: 'AddClothing'  as const, color: '#8B5CF6' },
  { icon: '✦', label: 'Kombin Oluştur',   desc: 'AI ile kombin yap',      screen: 'GenerateOutfit' as const, color: '#EC4899' },
  { icon: '◆', label: 'Kombinlerim',       desc: 'Kombinleri görüntüle',   screen: 'OutfitList'   as const, color: '#F59E0B' },
  { icon: '◷', label: 'Giyilme Geçmişi', desc: 'Ne zaman ne giydim',     screen: 'WearLogList'  as const, color: '#10B981' },
  { icon: '◎', label: 'Sosyal Feed',       desc: 'Paylaşımları keşfet',    screen: 'Feed'         as const, color: '#3B82F6' },
  { icon: '○', label: 'Profilim',          desc: 'Profil bilgilerini düzenle', screen: 'Profile'   as const, color: '#6366F1' },
  { icon: '◈', label: 'Ayarlar',           desc: 'Hesap ve uygulama',      screen: 'Settings'     as const, color: '#6B7280' },
] as const;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMe();

  const { data: clothingPage, isLoading: loadingClothing } = useClothingList({ size: 1 });
  const { data: cleanPage,    isLoading: loadingClean    } = useClothingList({ isClean: true, size: 1 });
  const { data: outfitPage,   isLoading: loadingOutfits  } = useOutfitList({ size: 1 });
  const { data: favoritePage, isLoading: loadingFav      } = useOutfitList({ isFavorite: true, size: 1 });
  const { data: wearLogPage,  isLoading: loadingLogs     } = useWearLogList({ size: 1 });

  const displayName =
    profile?.displayName ?? profile?.username ??
    user?.firstName ?? user?.username ?? 'Kullanıcı';

  const totalItems     = clothingPage?.totalElements ?? 0;
  const cleanItems     = cleanPage?.totalElements ?? 0;
  const totalOutfits   = outfitPage?.totalElements ?? 0;
  const favoriteOutfits = favoritePage?.totalElements ?? 0;
  const totalWearLogs  = wearLogPage?.totalElements ?? 0;
  const lastWornAt     = wearLogPage?.content?.[0]?.wornAt;
  const lastWornStr    = lastWornAt ? formatDate(lastWornAt) : 'Henüz yok';

  return (
    <DashboardLayout>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Greeting banner */}
        <View style={styles.greetingCard}>
          <View>
            <Text style={styles.greeting}>Merhaba, {displayName} 👋</Text>
            <Text style={styles.subtitle}>Bugün ne giymek istersin?</Text>
          </View>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={() => navigation.navigate('GenerateOutfit')}
            activeOpacity={0.85}
          >
            <Text style={styles.generateBtnText}>✦ AI Kombin</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Genel Bakış</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Toplam Kıyafet"
            value={totalItems}
            loading={loadingClothing || loadingClean}
            accent="#6366F1"
            sub={`${cleanItems} temiz · ${totalItems - cleanItems} kirli`}
          />
          <StatCard
            label="Toplam Kombin"
            value={totalOutfits}
            loading={loadingOutfits || loadingFav}
            accent="#8B5CF6"
            sub={`${favoriteOutfits} favori`}
          />
          <StatCard
            label="Giyilme Kayıtları"
            value={totalWearLogs}
            loading={loadingLogs}
            accent="#10B981"
            sub={`Son: ${lastWornStr}`}
          />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconBox, { backgroundColor: action.color + '1A' }]}>
                <Text style={[styles.actionIcon, { color: action.color }]}>{action.icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionDesc}>{action.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </DashboardLayout>
  );
}

function StatCard({
  label,
  value,
  loading,
  accent,
  sub,
}: {
  label: string;
  value: string | number;
  loading?: boolean;
  accent: string;
  sub?: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: accent }]}>
      <Text style={[styles.statValue, { color: accent }]}>
        {loading ? '–' : value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 32, paddingBottom: 48 },

  greetingCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    padding: 28,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  generateBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 14,
    letterSpacing: 0.1,
  },

  statsGrid: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 20,
    borderLeftWidth: 4,
    ...theme.shadow.card,
  },
  statValue: { fontSize: 34, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 4 },
  statSub: { fontSize: 11, color: theme.colors.textMuted },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 18,
    width: 160,
    ...theme.shadow.card,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIcon: { fontSize: 20, fontWeight: '700' },
  actionLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 3 },
  actionDesc: { fontSize: 11, color: theme.colors.textMuted, lineHeight: 15 },
});
