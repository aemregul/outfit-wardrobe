import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert,
} from 'react-native';
import { ImagePreview } from './ImagePreview';
import { useImageUpload } from '../hooks/useImageUpload';
import type { UploadFolder } from '../types/upload.types';

interface Props {
  folder: UploadFolder;
  currentUrl?: string;
  onUploaded: (publicUrl: string) => void;
}

export function ImagePickerButton({ folder, currentUrl, onUploaded }: Props) {
  const { pickAndUpload, takeAndUpload, isUploading, uploadError } = useImageUpload(folder);

  function handlePress() {
    Alert.alert(
      'Görsel Seç',
      'Nereden eklemek istersiniz?',
      [
        {
          text: 'Kamera',
          onPress: async () => {
            const url = await takeAndUpload();
            if (url) onUploaded(url);
          },
        },
        {
          text: 'Galeri',
          onPress: async () => {
            const url = await pickAndUpload();
            if (url) onUploaded(url);
          },
        },
        { text: 'İptal', style: 'cancel' },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <ImagePreview uri={currentUrl} size="large" />
      <TouchableOpacity
        style={[styles.btn, isUploading && styles.btnDisabled]}
        onPress={handlePress}
        disabled={isUploading}
        activeOpacity={0.8}
      >
        {isUploading ? (
          <>
            <ActivityIndicator color="#fff" size="small" style={styles.spinner} />
            <Text style={styles.btnText}>Yükleniyor...</Text>
          </>
        ) : (
          <Text style={styles.btnText}>
            {currentUrl ? '📷  Görseli Değiştir' : '📷  Görsel Ekle'}
          </Text>
        )}
      </TouchableOpacity>
      {uploadError ? <Text style={styles.error}>{uploadError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 6 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F1F',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 9999,
    marginTop: 12,
    gap: 8,
  },
  btnDisabled: { backgroundColor: '#9C8C84' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  spinner: { marginRight: 4 },
  error: { color: '#E74C3C', fontSize: 13, marginTop: 8 },
});
