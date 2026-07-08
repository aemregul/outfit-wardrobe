import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import type { AppNavigationProp } from '../../../app/navigation/types';

const outfitImage   = require('../../../../assets/images/main/luxury 2.png');
const sneakersImage = require('../../../../assets/images/main/White sneakers.png');
const necklaceImage = require('../../../../assets/images/main/Gold necklace.png');
const shirtImage    = require('../../../../assets/images/main/Summer Shirt.png');

const TR_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const DAY_ABBR = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];
const DAY_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

type OutfitData = { name: string; items?: string; image: any; accessories?: any[] };
type ViewMode = 'weekly' | 'monthly';

const SAMPLE_OUTFITS: Record<number, OutfitData> = {
  0: { name: 'Gündelik Pazartesi', items: 'Beyaz Spor Ayakkabı & Jean', image: sneakersImage },
  1: { name: 'İş Toplantısı',      items: 'İpek Bluz',                  image: shirtImage },
  3: { name: 'Akşam Yemeği',       items: 'Altın Aksesuar Odağı',       image: necklaceImage },
  5: { name: 'Bej Trençkot & Denim', image: outfitImage,
       accessories: [sneakersImage, necklaceImage, shirtImage] },
  6: { name: 'Brunch Günü', items: 'Rahat & Şık', image: shirtImage },
};

// ── Takvim yardımcıları ──────────────────────────────────────────────────────

function getWeekDays(today: Date): Date[] {
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days: { day: number; currentMonth: boolean }[] = [];
  for (let i = startOffset - 1; i >= 0; i--)
    days.push({ day: daysInPrevMonth - i, currentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    days.push({ day: d, currentMonth: true });
  const remaining = 7 - (days.length % 7);
  if (remaining < 7)
    for (let d = 1; d <= remaining; d++)
      days.push({ day: d, currentMonth: false });
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

// ── Görünüm Seçici Modal ─────────────────────────────────────────────────────

type ViewPickerProps = {
  visible: boolean;
  current: ViewMode;
  onSelect: (v: ViewMode) => void;
  onClose: () => void;
};

function ViewPickerModal({ visible, current, onSelect, onClose }: ViewPickerProps) {
  const insets = useSafeAreaInsets();
  const options: { value: ViewMode; label: string; icon: React.ComponentProps<typeof Ionicons>['name']; desc: string }[] = [
    { value: 'weekly',  label: 'Haftalık Görünüm', icon: 'list-outline',     desc: 'Günlük kombinleri zaman çizelgesi olarak gör' },
    { value: 'monthly', label: 'Aylık Görünüm',    icon: 'calendar-outline', desc: 'Tüm ayı takvim olarak gör' },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={picker.overlay}>
        <TouchableOpacity style={picker.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[picker.sheet, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          <View style={picker.handle} />
          <View style={picker.header}>
            <Text style={picker.title}>Görünüm</Text>
            <TouchableOpacity style={picker.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {options.map((opt) => {
            const isActive = current === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[picker.option, isActive && picker.optionActive]}
                activeOpacity={0.8}
                onPress={() => { onSelect(opt.value); onClose(); }}
              >
                <View style={[picker.optionIcon, isActive && picker.optionIconActive]}>
                  <Ionicons name={opt.icon} size={20} color={isActive ? '#FFFFFF' : '#4A403A'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[picker.optionLabel, isActive && picker.optionLabelActive]}>
                    {opt.label}
                  </Text>
                  <Text style={picker.optionDesc}>{opt.desc}</Text>
                </View>
                {isActive && <Ionicons name="checkmark" size={18} color="#C9A86A" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const picker = StyleSheet.create({
  overlay:    { flex: 1, justifyContent: 'flex-end' },
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignSelf: 'center',
    marginTop: 12, marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 4,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#4A403A',
  },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#1F1F1F',
    alignItems: 'center', justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#959595',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  optionActive: { borderWidth: 1.5, borderColor: '#C9A86A' },
  optionIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F5F0E8',
    alignItems: 'center', justifyContent: 'center',
  },
  optionIconActive: { backgroundColor: '#C9A86A' },
  optionLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14, color: '#4A403A',
  },
  optionLabelActive: { color: '#C9A86A' },
  optionDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11, color: '#9C8C84', marginTop: 2,
  },
});

// ── Ana Ekran ────────────────────────────────────────────────────────────────

export function PlannerScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
  });

  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewMode, setViewMode]         = useState<ViewMode>('weekly');
  const [showPicker, setShowPicker]     = useState(false);
  const [calMonth, setCalMonth]         = useState(today.getMonth());
  const [calYear, setCalYear]           = useState(today.getFullYear());
  const [selectedDay, setSelectedDay]   = useState(today.getDate());

  const weekDays    = getWeekDays(today);
  const plannedCount = Object.keys(SAMPLE_OUTFITS).length;

  // Aylık takvim
  const calDays = getCalendarDays(calYear, calMonth);
  const calWeeks: { day: number; currentMonth: boolean }[][] = [];
  for (let i = 0; i < calDays.length; i += 7) calWeeks.push(calDays.slice(i, i + 7));

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setSelectedDay(1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setSelectedDay(1);
  };

  const viewIcon: React.ComponentProps<typeof Ionicons>['name'] =
    viewMode === 'weekly' ? 'list-outline' : 'calendar-outline';

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.sheetTopBar}>
        <View style={styles.dragHandle} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
      >
        {/* ── Başlık ── */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.85} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterBtn} activeOpacity={0.85} onPress={() => setShowPicker(true)}>
              <Ionicons name={viewIcon} size={18} color="#4A403A" />
            </TouchableOpacity>
          </View>
          <Text style={styles.monthLabel}>
            {viewMode === 'weekly'
              ? `${TR_MONTHS[weekDays[0].getMonth()].toUpperCase()} ${weekDays[0].getFullYear()}`
              : `${TR_MONTHS[calMonth].toUpperCase()} ${calYear}`}
          </Text>
          <Text style={styles.pageTitle}>
            {viewMode === 'weekly' ? 'Haftalık Planlayıcı' : 'Aylık Planlayıcı'}
          </Text>
        </View>

        {/* ── Haftalık Görünüm ── */}
        {viewMode === 'weekly' && (
          <>
            {/* İlerleme kartı */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Hafta Planlandı</Text>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>{plannedCount}/7 Gün</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(plannedCount / 7) * 100}%` as any }]} />
              </View>
              <Text style={styles.progressDesc}>
                {plannedCount < 7
                  ? `Güzel gidiyorsun! Haftanı tamamlamak için ${7 - plannedCount} kombin daha planla.`
                  : 'Mükemmel! Haftanın tamamı planlandı.'}
              </Text>
            </View>

            {/* Timeline */}
            <View>
              {weekDays.map((day, index) => {
                const isToday = isSameDay(day, today);
                const isPast  = day.getTime() < todayMidnight.getTime();
                const outfit  = SAMPLE_OUTFITS[index];
                const isLast  = index === 6;
                return (
                  <View key={index} style={styles.dayRow}>
                    <View style={styles.timelineCol}>
                      <Text style={[styles.dayAbbr, isToday && styles.dayAbbrToday]}>{DAY_ABBR[index]}</Text>
                      <View style={[styles.dayNum, isToday && styles.dayNumToday]}>
                        <Text style={[styles.dayNumText, isToday && styles.dayNumTextToday]}>{day.getDate()}</Text>
                      </View>
                      {!isLast && <View style={styles.verticalLine} />}
                    </View>
                    <View style={styles.cardCol}>
                      {isToday && outfit ? (
                        <>
                          <View style={styles.todayCard}>
                            <Image source={outfit.image} style={styles.todayImage} resizeMode="cover" />
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
                            <View style={styles.todayWeatherPill}>
                              <Ionicons name="sunny-outline" size={11} color="white" />
                              <Text style={styles.todayWeatherText}>29°C</Text>
                            </View>
                            <View style={styles.todayFooter}>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.todayLookLabel}>BUGÜNÜN GÖRÜNÜMÜ</Text>
                                <Text style={styles.todayName}>{outfit.name}</Text>
                              </View>
                              <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}
                                onPress={() => navigation.navigate('WeeklyPlanner')}>
                                <Ionicons name="create-outline" size={18} color="#1F1F1F" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          {outfit.accessories && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.accessoriesRow}>
                              {outfit.accessories.map((acc, ai) => (
                                <View key={ai} style={[styles.accessoryThumb, ai === 0 && styles.accessoryThumbActive]}>
                                  <Image source={acc} style={styles.accessoryImage} resizeMode="contain" />
                                </View>
                              ))}
                            </ScrollView>
                          )}
                        </>
                      ) : outfit && isPast ? (
                        <View style={styles.completedCard}>
                          <View style={styles.smallThumb}>
                            <Image source={outfit.image} style={styles.smallImage} resizeMode="contain" />
                          </View>
                          <View style={styles.cardInfo}>
                            <Text style={styles.completedName}>{outfit.name}</Text>
                            {outfit.items && <Text style={styles.cardItems}>{outfit.items}</Text>}
                          </View>
                          <View style={styles.checkCircle}>
                            <Ionicons name="checkmark" size={14} color="#C9A86A" />
                          </View>
                        </View>
                      ) : outfit && !isPast && !isToday ? (
                        <View style={styles.plannedCard}>
                          <View style={styles.smallThumb}>
                            <Image source={outfit.image} style={styles.smallImage} resizeMode="contain" />
                          </View>
                          <View style={styles.cardInfo}>
                            <Text style={styles.plannedName}>{outfit.name}</Text>
                            {outfit.items && <Text style={styles.cardItems}>{outfit.items}</Text>}
                          </View>
                          <Ionicons name="chevron-forward" size={18} color="#9C8C84" />
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.emptyCard} activeOpacity={0.7}
                          onPress={() => navigation.navigate('WeeklyPlanner')}>
                          <Ionicons name="add" size={20} color="#C9A86A" />
                          <Text style={styles.emptyText}>{DAY_FULL[index]} için kombin planla</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* ── Aylık Görünüm ── */}
        {viewMode === 'monthly' && (
          <View style={styles.calendarCard}>
            <View style={styles.calMonthRow}>
              <TouchableOpacity onPress={prevMonth} activeOpacity={0.7} style={styles.arrowBtn}>
                <Ionicons name="chevron-back" size={16} color="#C9A86A" />
              </TouchableOpacity>
              <Text style={styles.calMonthTitle}>{TR_MONTHS[calMonth]} {calYear}</Text>
              <TouchableOpacity onPress={nextMonth} activeOpacity={0.7} style={styles.arrowBtn}>
                <Ionicons name="chevron-forward" size={16} color="#C9A86A" />
              </TouchableOpacity>
            </View>
            <View style={styles.calDivider} />
            <View style={styles.calDayNamesRow}>
              {DAY_ABBR.map(d => (
                <View key={d} style={styles.calDayNameCell}>
                  <Text style={styles.calDayNameText}>{d}</Text>
                </View>
              ))}
            </View>
            <View style={styles.calGrid}>
              {calWeeks.map((week, wi) => (
                <View key={wi} style={styles.calWeekRow}>
                  {week.map((item, di) => {
                    const isT = item.currentMonth && item.day === today.getDate() &&
                      calMonth === today.getMonth() && calYear === today.getFullYear();
                    const isSel = item.currentMonth && item.day === selectedDay && !isT;
                    return (
                      <TouchableOpacity key={di} style={styles.calDateCell} activeOpacity={0.7}
                        onPress={() => { if (item.currentMonth) setSelectedDay(item.day); }}>
                        <View style={[styles.calDateDot, isT && styles.calDateDotToday, isSel && styles.calDateDotSelected]}>
                          <Text style={[styles.calDateText, !item.currentMonth && styles.calDateTextOff, isT && styles.calDateTextToday]}>
                            {item.day}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Görünüm Seçici ── */}
      <ViewPickerModal
        visible={showPicker}
        current={viewMode}
        onSelect={setViewMode}
        onClose={() => setShowPicker(false)}
      />
    </View>
  );
}

// ── Stiller ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetTopBar: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.18)' },
  content: { paddingHorizontal: 20, paddingTop: 4 },

  // Başlık
  headerSection: { marginBottom: 20 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 8, marginBottom: 16,
  },
  closeBtn: {
    width: 40, height: 40, backgroundColor: '#1F1F1F', borderRadius: 9999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  filterBtn: {
    width: 40, height: 40, backgroundColor: '#FFFFFF', borderRadius: 9999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  monthLabel: {
    fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#9C8C84', letterSpacing: 1, marginBottom: 2,
  },
  pageTitle: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: '#4A403A', lineHeight: 36 },

  // İlerleme kartı
  progressCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24,
    shadowColor: '#959595', shadowOffset: { width: 8, height: 3 }, shadowOpacity: 0.11, shadowRadius: 22, elevation: 4,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  progressTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#4A403A' },
  progressBadge: { backgroundColor: 'rgba(201,168,106,0.15)', borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 4 },
  progressBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#C9A86A' },
  progressBarBg: { height: 8, backgroundColor: 'rgba(201,168,106,0.15)', borderRadius: 4, marginBottom: 10, overflow: 'hidden' },
  progressBarFill: { height: 8, backgroundColor: '#C9A86A', borderRadius: 4 },
  progressDesc: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9C8C84', lineHeight: 18 },

  // Haftalık timeline
  dayRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  timelineCol: { width: 44, alignItems: 'center' },
  dayAbbr: { fontFamily: 'Poppins_500Medium', fontSize: 10, color: '#9C8C84', letterSpacing: 0.5, marginBottom: 4 },
  dayAbbrToday: { color: '#C9A86A' },
  dayNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayNumToday: { backgroundColor: '#1F1F1F' },
  dayNumText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#4A403A' },
  dayNumTextToday: { color: '#FFFFFF' },
  verticalLine: { flex: 1, width: 1, backgroundColor: 'rgba(201,168,106,0.25)', marginTop: 4, marginBottom: -16 },
  cardCol: { flex: 1 },

  completedCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#959595', shadowOffset: { width: 4, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  smallThumb: {
    width: 56, height: 56, borderRadius: 12, backgroundColor: '#F5F0E8',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  smallImage: { width: 48, height: 48 },
  cardInfo: { flex: 1, gap: 2 },
  completedName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#9C8C84', textDecorationLine: 'line-through' },
  cardItems: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9C8C84' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#C9A86A', alignItems: 'center', justifyContent: 'center' },

  todayCard: { width: '100%', height: 280, borderRadius: 24, overflow: 'hidden', marginBottom: 10 },
  todayImage: { width: '100%', height: '100%' },
  todayWeatherPill: {
    position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4,
  },
  todayWeatherText: { fontFamily: 'Poppins_500Medium', fontSize: 11, color: '#FFFFFF' },
  todayFooter: { position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  todayLookLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, marginBottom: 4 },
  todayName: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: '#FFFFFF', lineHeight: 28 },
  editBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  accessoriesRow: { gap: 8, paddingBottom: 4 },
  accessoryThumb: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#F5F0E8', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  accessoryThumbActive: { backgroundColor: '#1F1F1F' },
  accessoryImage: { width: 40, height: 40 },

  plannedCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#959595', shadowOffset: { width: 4, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2,
  },
  plannedName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#4A403A' },

  emptyCard: {
    borderWidth: 1.5, borderColor: 'rgba(201,168,106,0.4)', borderStyle: 'dashed',
    borderRadius: 16, paddingVertical: 16, paddingHorizontal: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9C8C84' },

  // Aylık takvim
  calendarCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    shadowColor: '#959595', shadowOffset: { width: 8, height: 3 }, shadowOpacity: 0.11, shadowRadius: 22, elevation: 4,
  },
  calMonthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrowBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  calMonthTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#4A403A' },
  calDivider: { height: 0.8, backgroundColor: '#C9A86A', marginTop: 14 },
  calDayNamesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 4 },
  calDayNameCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  calDayNameText: { fontFamily: 'Poppins_500Medium', fontSize: 10, color: '#7E818C', textTransform: 'uppercase' },
  calGrid: { gap: 6 },
  calWeekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calDateCell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  calDateDot: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  calDateDotToday: { backgroundColor: '#C9A86A' },
  calDateDotSelected: { borderWidth: 1.5, borderColor: '#C9A86A' },
  calDateText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#1F1F1F' },
  calDateTextOff: { color: 'rgba(31,31,31,0.25)' },
  calDateTextToday: { color: '#FFFFFF' },
});
