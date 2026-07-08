import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput, Switch, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import type { AppNavigationProp } from '../../../app/navigation/types';

const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function formatDate(date: Date): string {
  return `${date.getDate()} ${TR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

const OUTFIT_STYLES = ['Gündelik', 'Ofis', 'Spor', 'Akşam', 'Parti', 'Randevu', 'Seyahat', 'Diğer'] as const;
type OutfitStyle = typeof OUTFIT_STYLES[number];

export function WeeklyPlannerScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  const [title, setTitle] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<OutfitStyle>('Gündelik');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(1);

  const today = new Date();

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.sheetTopBar}>
        <View style={styles.dragHandle} />
      </View>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.85} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>İptal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Plan</Text>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
          <Text style={styles.saveText}>Kaydet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) + 24 }]}
      >
        {/* Plan Özet Kartı */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{title.trim() || 'Yeni Plan'}</Text>
          <Text style={styles.summaryDate}>{formatDate(today)}</Text>
        </View>

        {/* Plan Detayları */}
        <Text style={styles.sectionTitle}>Plan Detayları</Text>
        <View style={styles.detailCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Tarih</Text>
            <Text style={styles.rowValue}>{formatDate(today)}</Text>
          </View>
          <View style={styles.divider} />

          <TextInput
            style={styles.input}
            placeholder="Başlık (örn. İş Seyahati)"
            placeholderTextColor="rgba(31,31,31,0.50)"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.divider} />

          <View style={styles.specialDayRow}>
            <Text style={styles.rowLabel}>Özel Gün</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {OUTFIT_STYLES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, selectedStyle === s && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedStyle(s)}
              >
                <Text style={styles.chipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.divider} />

          <TextInput
            style={styles.input}
            placeholder="Konum (İsteğe Bağlı)"
            placeholderTextColor="rgba(31,31,31,0.50)"
            value={location}
            onChangeText={setLocation}
          />
          <View style={styles.divider} />

          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Notlar"
            placeholderTextColor="rgba(31,31,31,0.50)"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Hatırlatıcı */}
        <Text style={styles.sectionTitle}>Hatırlatıcı</Text>
        <View style={styles.reminderCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Hatırlatıcı Açık</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E5E5EA"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{reminderDays} Gün Önce</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                activeOpacity={0.7}
                onPress={() => setReminderDays(Math.max(1, reminderDays - 1))}
              >
                <Text style={styles.stepperBtnText}>-</Text>
              </TouchableOpacity>
              <View style={styles.stepperDivider} />
              <TouchableOpacity
                style={styles.stepperBtn}
                activeOpacity={0.7}
                onPress={() => setReminderDays(reminderDays + 1)}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  sheetTopBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  cancelBtn: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: '#1F1F1F',
    borderRadius: 9999,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 28,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#4A403A',
    lineHeight: 28,
  },
  saveBtn: {
    height: 40,
    paddingHorizontal: 20,
    backgroundColor: '#1F1F1F',
    borderRadius: 9999,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  saveText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 28,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 12,
    shadowColor: '#959595',
    shadowOffset: { width: 8, height: 3 },
    shadowOpacity: 0.11,
    shadowRadius: 22,
    elevation: 4,
  },
  summaryTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#4A403A',
    lineHeight: 28,
  },
  summaryDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: 'rgba(31,31,31,0.50)',
    lineHeight: 16,
  },

  sectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#4A403A',
    lineHeight: 28,
    marginTop: 20,
    marginBottom: 8,
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    shadowColor: '#959595',
    shadowOffset: { width: 8, height: 3 },
    shadowOpacity: 0.11,
    shadowRadius: 22,
    elevation: 4,
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    shadowColor: '#959595',
    shadowOffset: { width: 8, height: 3 },
    shadowOpacity: 0.11,
    shadowRadius: 22,
    elevation: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingVertical: 12,
  },
  rowLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1F1F1F',
    lineHeight: 20,
  },
  rowValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1F1F1F',
    lineHeight: 20,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },

  input: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1F1F1F',
    lineHeight: 20,
    minHeight: 50,
    paddingVertical: 12,
    textAlignVertical: 'center',
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },

  specialDayRow: {
    paddingTop: 14,
    paddingBottom: 8,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 14,
    paddingRight: 4,
  },
  chip: {
    height: 30,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#9C8C84',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#C9A86A',
    borderColor: '#C9A86A',
  },
  chipText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#1F1F1F',
    lineHeight: 16,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 94,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#9C8C84',
    overflow: 'hidden',
  },
  stepperBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  stepperBtnText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1F1F1F',
    lineHeight: 18,
  },
  stepperDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#000000',
    opacity: 0.15,
  },

});
