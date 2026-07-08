import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
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
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

  const { data: log, isLoading, isError } = useWearLog(logId);
  const { data: outfit } = useOutfit(log?.outfitId ?? '');
  const { mutate: deleteLog, isPending: deleting } = useDeleteWearLog();
  const [confirmVisible, setConfirmVisible] = useState(false);

  function handleDelete() {
    deleteLog(logId, {
      onSuccess: () => { setConfirmVisible(false); navigation.goBack(); },
    });
  }

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FDFBF7' }} />;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C9A86A" />
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
            <Text style={styles.linkText}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color="#4A403A" />
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
  safe: { flex: 1, backgroundColor: '#FDFBF7' },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#4A403A' },

  heroCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  heroOutfitName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroLabel: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#C9A86A', marginBottom: 6 },
  heroDate: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#fff', textAlign: 'center' },

  photo: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
  },

  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74,64,58,0.07)',
  },
  detailLabel: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#9C8C84' },
  detailValue: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#4A403A', maxWidth: '60%', textAlign: 'right' },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star: { fontSize: 16, color: '#E8DCC8' },
  starFilled: { color: '#C9A86A' },
  ratingNum: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9C8C84', marginLeft: 4 },

  wearAgainBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  wearAgainYes: { backgroundColor: '#D1FAE5' },
  wearAgainNo: { backgroundColor: '#FEE2E2' },
  wearAgainText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  wearAgainYesText: { color: '#065F46' },
  wearAgainNoText: { color: '#991B1B' },

  noteSection: { paddingTop: 10 },
  noteText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#4A403A', lineHeight: 22, fontStyle: 'italic', marginTop: 6 },

  outfitBtn: {
    backgroundColor: '#1F1F1F',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  outfitBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 15 },

  deleteBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    marginBottom: 24,
  },
  deleteBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#EF4444', fontSize: 14 },

  errorText: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#EF4444' },
  linkText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#C9A86A' },
});
