import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { theme } from '../theme';

export interface FilterOption {
  label: string;
  isActive: boolean;
  onPress: () => void;
  color?: string;
}

export interface FilterGroupConfig {
  label: string;
  options: FilterOption[];
  scrollable?: boolean;
}

export interface ActiveChip {
  label: string;
  onRemove: () => void;
}

interface Props {
  groups: FilterGroupConfig[];
  activeCount: number;
  activeChips: ActiveChip[];
  onClearAll: () => void;
}

export function FilterPanel({ groups, activeCount, activeChips, onClearAll }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      {/* Toggle button */}
      <TouchableOpacity
        style={[styles.toggleBtn, open && styles.toggleBtnOpen]}
        onPress={() => setOpen(v => !v)}
        activeOpacity={0.8}
      >
        <Text style={[styles.toggleIcon, open && styles.toggleIconOpen]}>⬦</Text>
        <Text style={[styles.toggleLabel, open && styles.toggleLabelOpen]}>Filtrele</Text>
        {activeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeCount}</Text>
          </View>
        )}
        <Text style={[styles.chevron, open && styles.chevronOpen]}>›</Text>
      </TouchableOpacity>

      {/* Active chips strip (always visible when filters set, panel collapsed) */}
      {activeChips.length > 0 && !open && (
        <View style={styles.chipsStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {activeChips.map(chip => (
              <TouchableOpacity
                key={chip.label}
                style={styles.activeChip}
                onPress={chip.onRemove}
                activeOpacity={0.7}
              >
                <Text style={styles.activeChipText}>{chip.label}</Text>
                <Text style={styles.activeChipX}>✕</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.clearAllChip} onPress={onClearAll} activeOpacity={0.7}>
              <Text style={styles.clearAllText}>Tümünü Temizle</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Expanded panel */}
      {open && (
        <View style={styles.panel}>
          {groups.map((group) => (
            <View key={group.label} style={styles.group}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              {group.scrollable ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.optionsRow}>
                    {group.options.map(opt => (
                      <OptionChip key={opt.label} opt={opt} />
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.optionsRow}>
                  {group.options.map(opt => (
                    <OptionChip key={opt.label} opt={opt} />
                  ))}
                </View>
              )}
            </View>
          ))}

          {activeCount > 0 && (
            <TouchableOpacity style={styles.clearPanelBtn} onPress={onClearAll} activeOpacity={0.7}>
              <Text style={styles.clearPanelText}>✕ Filtreleri Temizle ({activeCount})</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function OptionChip({ opt }: { opt: FilterOption }) {
  const activeColor = opt.color ?? theme.colors.primary;
  return (
    <TouchableOpacity
      style={[
        styles.optionChip,
        opt.isActive && { backgroundColor: activeColor + '1A', borderColor: activeColor },
      ]}
      onPress={opt.onPress}
      activeOpacity={0.7}
    >
      {opt.isActive && <Text style={[styles.checkMark, { color: activeColor }]}>✓ </Text>}
      <Text style={[styles.optionLabel, opt.isActive && { color: activeColor, fontWeight: '700' }]}>
        {opt.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },

  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleBtnOpen: {
    backgroundColor: theme.colors.indigo50,
    borderColor: theme.colors.primary,
  },
  toggleIcon: { fontSize: 13, color: theme.colors.textMuted },
  toggleIconOpen: { color: theme.colors.primary },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  toggleLabelOpen: { color: theme.colors.primary },
  chevron: {
    fontSize: 16,
    color: theme.colors.textMuted,
    transform: [{ rotate: '90deg' }],
    marginLeft: 2,
  },
  chevronOpen: {
    color: theme.colors.primary,
    transform: [{ rotate: '-90deg' }],
  },

  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  chipsStrip: { marginTop: 2 },
  chipsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.indigo50,
    borderWidth: 1,
    borderColor: theme.colors.indigo200,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
  },
  activeChipText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  activeChipX: { fontSize: 10, color: theme.colors.primary, fontWeight: '700' },
  clearAllChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.errorBg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearAllText: { fontSize: 12, color: theme.colors.errorText, fontWeight: '700' },

  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    gap: 14,
  },

  group: { gap: 8 },
  groupLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.borderLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checkMark: { fontSize: 11, fontWeight: '800' },
  optionLabel: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' },

  clearPanelBtn: {
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.errorBg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  clearPanelText: { fontSize: 13, color: theme.colors.errorText, fontWeight: '700' },
});
