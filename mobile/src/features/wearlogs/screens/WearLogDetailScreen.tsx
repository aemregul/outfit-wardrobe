import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { useWearLog, useDeleteWearLog } from '../hooks/useWearLogs';
import { useOutfit } from '../../outfits/hooks/useOutfits';
import { formatDateTime } from '../../../shared/utils/date';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'WearLogDetail'>;

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function RatingDisplay({ rating }: { rating?: number | null }) {
  if (!rating) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>Puan</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Text key={s} style={[styles.star, s <= rating && styles.starFilled]}>★</Text>
        ))}
        <Text style={styles.ratingNum}>{rating}/5</Text>
      </View>
    </View>
  );
}

export function WearLogDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const logId = params.id;

  const { data: log, isLoading, isError } = useWearLog(logId);
  const { data: outfit } = useOutfit(log?.outfitId ?? '');
  const { mutate: deleteLog, isPending: deleting } = useDeleteWearLog();
  const [confirmVisible, setConfirmVisible] = useState(false);

  function handleDelete() {
    deleteLog(logId, {
      onSuccess: () => { setConfirmVisible(false); navigation.goBack(); },
    });
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

  if (isError || !log) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Kayıt bulunamadı.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>← Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Giyilme Detayı</Text>
        </View>

        <View style={styles.heroCard}>
          {outfit?.name ? (
            <Text style={styles.heroOutfitName}>{outfit.name}</Text>
          ) : null}
          <Text style={styles.heroLabel}>Giyilme Tarihi</Text>
          <Text style={styles.heroDate}>{formatDateTime(log.wornAt)}</Text>
        </View>

        {log.photoUrl ? (
          <Image
            source={{ uri: log.photoUrl }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : null}

        <View style={styles.detailCard}>
          <DetailRow label="Etkinlik" value={log.occasion} />
          <DetailRow label="Lokasyon" value={log.location} />
          <RatingDisplay rating={log.rating} />
          {log.wouldWearAgain !== null && log.wouldWearAgain !== undefined && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tekrar Giyer misin?</Text>
              <View style={[
                styles.wearAgainBadge,
                log.wouldWearAgain ? styles.wearAgainYes : styles.wearAgainNo,
              ]}>
                <Text style={[
                  styles.wearAgainText,
                  log.wouldWearAgain ? styles.wearAgainYesText : styles.wearAgainNoText,
                ]}>
                  {log.wouldWearAgain ? 'Evet, tekrar giyerim' : 'Hayır, giymem'}
                </Text>
              </View>
            </View>
          )}
          {log.note ? (
            <View style={styles.noteSection}>
              <Text style={styles.detailLabel}>Not</Text>
              <Text style={styles.noteText}>{log.note}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.outfitBtn}
          onPress={() => navigation.navigate('OutfitDetail', { id: log.outfitId })}
        >
          <Text style={styles.outfitBtnText}>Bu Kombini Gör</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setConfirmVisible(true)}
        >
          <Text style={styles.deleteBtnText}>Kaydı Sil</Text>
        </TouchableOpacity>

        <ConfirmModal
          visible={confirmVisible}
          message="Bu giyilme kaydı kalıcı olarak silinecek."
          isLoading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  backBtn: { color: '#6366F1', fontSize: 15, fontWeight: '500' },
  title: { fontSize: 20, fontWeight: '700', color: '#1E1B4B' },

  heroCard: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroOutfitName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroLabel: { fontSize: 12, color: '#C7D2FE', fontWeight: '600', marginBottom: 6 },
  heroDate: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center' },

  photo: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },

  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#1E1B4B', fontWeight: '500', maxWidth: '60%', textAlign: 'right' },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star: { fontSize: 16, color: '#D1D5DB' },
  starFilled: { color: '#FBBF24' },
  ratingNum: { fontSize: 13, color: '#6B7280', marginLeft: 4 },

  wearAgainBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  wearAgainYes: { backgroundColor: '#D1FAE5' },
  wearAgainNo: { backgroundColor: '#FEE2E2' },
  wearAgainText: { fontSize: 13, fontWeight: '600' },
  wearAgainYesText: { color: '#065F46' },
  wearAgainNoText: { color: '#991B1B' },

  noteSection: { paddingTop: 10 },
  noteText: { fontSize: 14, color: '#374151', lineHeight: 20, fontStyle: 'italic', marginTop: 6 },

  outfitBtn: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  outfitBtnText: { color: '#6366F1', fontSize: 15, fontWeight: '700' },

  deleteBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    marginBottom: 24,
  },
  deleteBtnText: { color: '#EF4444', fontSize: 14, fontWeight: '600' },

  errorText: { fontSize: 15, color: '#EF4444' },
  linkText: { color: '#6366F1', fontSize: 14 },
});
