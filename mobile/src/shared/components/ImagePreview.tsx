import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  uri?: string;
  size?: 'thumb' | 'large';
}

export function ImagePreview({ uri, size = 'large' }: Props) {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [uri]);

  const isThumb = size === 'thumb';

  if (!uri || errored) {
    if (isThumb) {
      return (
        <View style={[styles.placeholder, styles.placeholderThumb]}>
          <Ionicons name="image-outline" size={28} color="#C9A86A" />
        </View>
      );
    }
    return (
      <View style={[styles.placeholder, styles.placeholderLarge]}>
        <View style={styles.iconCircle}>
          <Ionicons name="camera-outline" size={30} color="#C9A86A" />
        </View>
        <Text style={styles.labelLarge}>Fotoğraf Ekle</Text>
        <Text style={styles.labelSub}>Kombinini paylaşmak için bir görsel seç</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={isThumb ? styles.imageThumb : styles.imageLarge}
      resizeMode="cover"
      onError={() => setErrored(true)}
    />
  );
}

const styles = StyleSheet.create({
  imageThumb: { width: 100, height: 100 },
  imageLarge: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#F5F0E8',
  },
  placeholder: {
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  placeholderThumb: { width: 100, height: 100, borderRadius: 12 },
  placeholderLarge: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(201,168,106,0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(201,168,106,0.06)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(201,168,106,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,106,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  labelLarge: { fontSize: 15, color: '#C9A86A', fontWeight: '600' },
  labelSub: { fontSize: 12, color: '#9C8C84', textAlign: 'center', paddingHorizontal: 24 },
});
