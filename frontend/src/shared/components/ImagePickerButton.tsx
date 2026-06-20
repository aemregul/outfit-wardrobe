import React from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, StyleSheet,
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
  const { pickAndUpload, isUploading, uploadError } = useImageUpload(folder);

  async function handlePress() {
    const publicUrl = await pickAndUpload();
    if (publicUrl) onUploaded(publicUrl);
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
            {currentUrl ? 'Görseli Değiştir' : 'Görsel Seç'}
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
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  btnDisabled: { backgroundColor: '#A5B4FC' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  spinner: { marginRight: 4 },
  error: { color: '#EF4444', fontSize: 13, marginTop: 6 },
});
