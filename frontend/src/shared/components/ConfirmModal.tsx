import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface Props {
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title = 'Silmek istediğine emin misin?',
  message,
  confirmLabel = 'Sil',
  isLoading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>⚠</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={isLoading} activeOpacity={0.7}>
              <Text style={styles.cancelText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, isLoading && styles.confirmBtnDisabled]}
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.confirmText}>{confirmLabel}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,9,20,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 32,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    ...theme.shadow.modal,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconText: { fontSize: 26 },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 21,
    marginBottom: 28,
    textAlign: 'center',
  },
  actions: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.borderLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: theme.colors.textSecondary },
  confirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#FCA5A5' },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
