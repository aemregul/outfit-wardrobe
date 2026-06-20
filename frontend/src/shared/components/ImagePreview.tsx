import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

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
    return (
      <View style={[styles.placeholder, isThumb ? styles.placeholderThumb : styles.placeholderLarge]}>
        <Text style={isThumb ? styles.emojiThumb : styles.emojiLarge}>👕</Text>
        <Text style={isThumb ? styles.labelThumb : styles.labelLarge}>Görsel yok</Text>
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
    height: 240,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    marginBottom: 20,
  },
  placeholder: {
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  placeholderThumb: { width: 100, height: 100 },
  placeholderLarge: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 20,
  },
  emojiThumb: { fontSize: 28 },
  emojiLarge: { fontSize: 64 },
  labelThumb: { fontSize: 10, color: '#7C3AED', fontWeight: '500' },
  labelLarge: { fontSize: 14, color: '#7C3AED', fontWeight: '500' },
});
