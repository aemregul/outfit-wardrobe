import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../auth/store/authStore';
import { useMe } from '../../auth/hooks/useMe';
import { useClothingList } from '../../wardrobe/hooks/useWardrobe';
import { useOutfitList } from '../../outfits/hooks/useOutfits';
import { useWearLogList } from '../../wearlogs/hooks/useWearLogs';
import { formatDate } from '../../../shared/utils/date';

export function DashboardScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMe();

  const { data: clothingPage, isLoading: loadingClothing } = useClothingList({ size: 1 });
  const { data: cleanPage, isLoading: loadingClean } = useClothingList({ isClean: true, size: 1 });
  const { data: outfitPage, isLoading: loadingOutfits } = useOutfitList({ size: 1 });
  const { data: favoritePage, isLoading: loadingFav } = useOutfitList({ isFavorite: true, size: 1 });
  const { data: wearLogPage, isLoading: loadingLogs } = useWearLogList({ size: 1 });

  const displayName =
    profile?.displayName ?? profile?.username ??
    user?.firstName ?? user?.username ?? 'Kullanıcı';

  const totalItems = clothingPage?.totalElements ?? 0;
  const cleanItems = cleanPage?.totalElements ?? 0;
  const totalOutfits = outfitPage?.totalElements ?? 0;
  const favoriteOutfits = favoritePage?.totalElements ?? 0;
  const totalWearLogs = wearLogPage?.totalElements ?? 0;
  const lastWornAt = wearLogPage?.content?.[0]?.wornAt;
  const lastWornStr = lastWornAt ? formatDate(lastWornAt) : 'Henüz yok';

  const loadingClothe = loadingClothing || loadingClean;
  const loadingOutfit = loadingOutfits || loadingFav;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Merhaba, {displayName} 👋</Text>
        <Text style={styles.subtitle}>Bugün ne giymek istersin?</Text>

        <Text style={styles.sectionTitle}>Dolabım</Text>
        <View style={styles.statsRow}>
          <StatCard label="Toplam Kıyafet" value={totalItems} loading={loadingClothe} />
          <StatCard label="Temiz" value={cleanItems} loading={loadingClothe} />
          <StatCard label="Kirli" value={totalItems - cleanItems} loading={loadingClothe} />
        </View>

        <Text style={styles.sectionTitle}>Kombinlerim</Text>
        <View style={styles.statsRow}>
          <StatCard label="Toplam Kombin" value={totalOutfits} loading={loadingOutfit} />
          <StatCard label="Favori Kombin" value={favoriteOutfits} loading={loadingOutfit} />
        </View>

        <Text style={styles.sectionTitle}>Giyilme</Text>
        <View style={[styles.statsRow, styles.statsRowLast]}>
          <StatCard label="Kayıt Sayısı" value={totalWearLogs} loading={loadingLogs} />
          <StatCard label="Son Giyilme" value={lastWornStr} loading={loadingLogs} small />
        </View>

        <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
        <View style={styles.actions}>
          <QuickAction
            emoji="👚"
            label="Dolabım"
            description="Kıyafetlerini yönet"
            onPress={() => navigation.navigate('WardrobeList' as never)}
          />
          <QuickAction
            emoji="➕"
            label="Kıyafet Ekle"
            description="Yeni kıyafet ekle"
            onPress={() => navigation.navigate('AddClothing' as never)}
          />
          <QuickAction
            emoji="✨"
            label="Kombin Oluştur"
            description="AI ile kombin yap"
            onPress={() => navigation.navigate('GenerateOutfit' as never)}
          />
          <QuickAction
            emoji="👗"
            label="Kombinlerim"
            description="Kombinleri görüntüle"
            onPress={() => navigation.navigate('OutfitList' as never)}
          />
          <QuickAction
            emoji="📅"
            label="Giyilme Geçmişi"
            description="Ne zaman ne giydim"
            onPress={() => navigation.navigate('WearLogList' as never)}
          />
          <QuickAction
            emoji="📱"
            label="Sosyal Feed"
            description="Paylaşımları keşfet"
            onPress={() => navigation.navigate('Feed' as never)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  loading,
  small,
}: {
  label: string;
  value: string | number;
  loading?: boolean;
  small?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, small && styles.statValueSmall]}>
        {loading ? '–' : value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  emoji,
  label,
  description,
  onPress,
}: {
  emoji: string;
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionDesc}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  scroll: { flex: 1 },
  container: { padding: 20 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#1E1B4B', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },

  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#1E1B4B', marginBottom: 12 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statsRowLast: { marginBottom: 32 },

  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: '700', color: '#6366F1' },
  statValueSmall: { fontSize: 13, textAlign: 'center' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' },

  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionEmoji: { fontSize: 26, marginBottom: 6 },
  actionLabel: { fontSize: 14, fontWeight: '600', color: '#1E1B4B', marginBottom: 2 },
  actionDesc: { fontSize: 11, color: '#9CA3AF' },
});
