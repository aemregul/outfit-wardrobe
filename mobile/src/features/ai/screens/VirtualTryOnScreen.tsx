import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image, StyleSheet,
  Animated, Easing, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

type Step = 0 | 1 | 2 | 3;
type SourceTab = 'wardrobe' | 'gallery';

const MOCK_WARDROBE = [
  { id: '1', name: 'Beyaz Bluz', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=400&q=80' },
  { id: '2', name: 'Krem Elbise', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80' },
  { id: '3', name: 'Bej Trençkot', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80' },
  { id: '4', name: 'Siyah Pantolon', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=400&q=80' },
  { id: '5', name: 'Çizgili Kazak', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80' },
  { id: '6', name: 'Denim Ceket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80' },
];

const STEP_LABELS = ['Fotoğraf', 'Kıyafet', 'İşlem', 'Sonuç'];

export function VirtualTryOnScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [step, setStep] = useState<Step>(0);
  const [personPhoto, setPersonPhoto] = useState<string | null>(null);
  const [sourceTab, setSourceTab] = useState<SourceTab>('wardrobe');
  const [selectedClothing, setSelectedClothing] = useState<typeof MOCK_WARDROBE[0] | null>(null);
  const [saved, setSaved] = useState(false);

  // Spinner animation for processing step
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (step === 2) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1600,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseValue, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      const timer = setTimeout(() => setStep(3), 2800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPersonPhoto(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPersonPhoto(result.assets[0].uri);
    }
  };

  const spin = spinValue.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (!fontsLoaded) return <View style={styles.container} />;

  // ─── Step 0: Upload person photo ─────────────────────────────────────────
  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Fotoğrafını Yükle</Text>
      <Text style={styles.stepSubtitle}>Tam vücut fotoğrafın en iyi sonucu verir</Text>

      <TouchableOpacity
        style={[styles.photoFrame, personPhoto && styles.photoFrameFilled]}
        activeOpacity={0.85}
        onPress={pickFromGallery}
      >
        {personPhoto ? (
          <Image source={{ uri: personPhoto }} style={styles.personPhoto} resizeMode="cover" />
        ) : (
          <View style={styles.photoPlaceholder}>
            <View style={styles.photoIconCircle}>
              <Ionicons name="person-outline" size={36} color="#C9A86A" />
            </View>
            <Text style={styles.photoPlaceholderText}>Fotoğraf Ekle</Text>
            <Text style={styles.photoPlaceholderSub}>Galerinizden bir fotoğraf seçin</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.pickRow}>
        <TouchableOpacity style={styles.pickBtn} activeOpacity={0.85} onPress={pickFromCamera}>
          <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
          <Text style={styles.pickBtnText}>Kameradan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.pickBtn, styles.pickBtnLight]} activeOpacity={0.85} onPress={pickFromGallery}>
          <Ionicons name="images-outline" size={18} color="#4A403A" />
          <Text style={[styles.pickBtnText, styles.pickBtnTextDark]}>Galeriden</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hintCard}>
        <Ionicons name="information-circle-outline" size={16} color="#C9A86A" />
        <Text style={styles.hintText}>Düz arka plan önünde çekilmiş dik duruş fotoğrafları en iyi sonucu verir.</Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryBtn, !personPhoto && styles.primaryBtnDisabled]}
        activeOpacity={personPhoto ? 0.85 : 1}
        onPress={() => personPhoto && setStep(1)}
      >
        <Text style={[styles.primaryBtnText, !personPhoto && styles.primaryBtnTextDisabled]}>Devam Et</Text>
        <Ionicons name="arrow-forward" size={18} color={personPhoto ? '#FFFFFF' : '#9C8C84'} />
      </TouchableOpacity>
    </View>
  );

  // ─── Step 1: Select clothing ──────────────────────────────────────────────
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Kıyafet Seç</Text>
      <Text style={styles.stepSubtitle}>Denemek istediğin kıyafeti seç</Text>

      {/* Source tabs */}
      <View style={styles.sourceTabs}>
        {(['wardrobe', 'gallery'] as SourceTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.sourceTab, sourceTab === t && styles.sourceTabActive]}
            onPress={() => setSourceTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[styles.sourceTabText, sourceTab === t && styles.sourceTabTextActive]}>
              {t === 'wardrobe' ? 'Gardıroptan' : 'Galeriden'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {sourceTab === 'wardrobe' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.wardrobeScroll}
          contentContainerStyle={styles.wardrobeGrid}
          nestedScrollEnabled
        >
          {MOCK_WARDROBE.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.wardrobeItem,
                selectedClothing?.id === item.id && styles.wardrobeItemSelected,
              ]}
              activeOpacity={0.85}
              onPress={() => setSelectedClothing(item)}
            >
              <Image source={{ uri: item.url }} style={styles.wardrobeImage} resizeMode="cover" />
              {selectedClothing?.id === item.id && (
                <View style={styles.wardrobeCheck}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
              <Text style={styles.wardrobeItemName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <TouchableOpacity style={styles.galleryPickArea} activeOpacity={0.85} onPress={async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, quality: 0.85 });
          if (!result.canceled && result.assets[0]) {
            setSelectedClothing({ id: 'gallery', name: 'Seçilen Kıyafet', url: result.assets[0].uri });
          }
        }}>
          {selectedClothing?.id === 'gallery' ? (
            <Image source={{ uri: selectedClothing.url }} style={styles.galleryPreview} resizeMode="contain" />
          ) : (
            <>
              <View style={styles.photoIconCircle}>
                <Ionicons name="images-outline" size={30} color="#C9A86A" />
              </View>
              <Text style={styles.photoPlaceholderText}>Galeriden Seç</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, !selectedClothing && styles.primaryBtnDisabled, { marginTop: 12 }]}
        activeOpacity={selectedClothing ? 0.85 : 1}
        onPress={() => selectedClothing && setStep(2)}
      >
        <Text style={[styles.primaryBtnText, !selectedClothing && styles.primaryBtnTextDisabled]}>Denemeyi Başlat</Text>
        <Ionicons name="sparkles" size={18} color={selectedClothing ? '#FFFFFF' : '#9C8C84'} />
      </TouchableOpacity>
    </View>
  );

  // ─── Step 2: Processing ───────────────────────────────────────────────────
  const renderStep2 = () => (
    <View style={styles.processingContainer}>
      {personPhoto && (
        <Image source={{ uri: personPhoto }} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={20} />
      )}
      <View style={styles.processingOverlay}>
        <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }, { scale: pulseValue }] }]}>
          <Ionicons name="sparkles" size={36} color="#C9A86A" />
        </Animated.View>
        <Text style={styles.processingTitle}>Kıyafetinizi Oluşturuyor</Text>
        <Text style={styles.processingSubtitle}>Yapay zeka görüntüyü işliyor...</Text>
        <View style={styles.processingDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: pulseValue.interpolate({
                    inputRange: [0.8, 1],
                    outputRange: i === 1 ? [1, 0.3] : [0.3, 1],
                  }),
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  // ─── Step 3: Result ───────────────────────────────────────────────────────
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.resultBadge}>
        <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
        <Text style={styles.resultBadgeText}>Kıyafetiniz Hazır!</Text>
      </View>
      <Text style={styles.stepTitle}>İşte Görünümün</Text>

      <View style={styles.resultImageWrap}>
        {personPhoto ? (
          <Image source={{ uri: personPhoto }} style={styles.resultImage} resizeMode="cover" />
        ) : (
          <View style={[styles.resultImage, styles.resultImagePlaceholder]}>
            <Ionicons name="person" size={64} color="rgba(201,168,106,0.4)" />
          </View>
        )}
        {selectedClothing && (
          <View style={styles.resultClothingBadge}>
            <Image source={{ uri: selectedClothing.url }} style={styles.resultClothingThumb} resizeMode="cover" />
            <Text style={styles.resultClothingName}>{selectedClothing.name}</Text>
          </View>
        )}
        <View style={styles.aiWatermark}>
          <Ionicons name="sparkles" size={10} color="#C9A86A" />
          <Text style={styles.aiWatermarkText}>YourStyle AI</Text>
        </View>
      </View>

      <View style={styles.resultActions}>
        <TouchableOpacity
          style={[styles.resultBtn, saved && styles.resultBtnSaved]}
          activeOpacity={0.85}
          onPress={() => setSaved(true)}
        >
          <Ionicons name={saved ? 'checkmark' : 'bookmark-outline'} size={18} color={saved ? '#22C55E' : '#FFFFFF'} />
          <Text style={[styles.resultBtnText, saved && { color: '#22C55E' }]}>
            {saved ? 'Kaydedildi' : 'Gardıroba Kaydet'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resultBtnOutline}
          activeOpacity={0.85}
          onPress={() => {
            setStep(0);
            setPersonPhoto(null);
            setSelectedClothing(null);
            setSaved(false);
          }}
        >
          <Ionicons name="refresh-outline" size={18} color="#4A403A" />
          <Text style={styles.resultBtnOutlineText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const canGoBack = step > 0 && step !== 2 && step !== 3;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => (canGoBack ? setStep((step - 1) as Step) : navigation.goBack())}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#4A403A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sanal Deneme</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {STEP_LABELS.map((label, i) => (
          <View key={i} style={styles.progressItem}>
            <View style={[styles.progressBar, i <= step && styles.progressBarActive]} />
            <Text style={[styles.progressLabel, i <= step && styles.progressLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={step === 2 ? { flex: 1 } : { paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={step !== 2}
      >
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBack: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#4A403A',
  },
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  progressBar: {
    width: '100%',
    height: 3,
    borderRadius: 9999,
    backgroundColor: '#E8E0D8',
  },
  progressBarActive: {
    backgroundColor: '#C9A86A',
  },
  progressLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#9C8C84',
  },
  progressLabelActive: {
    color: '#C9A86A',
    fontFamily: 'Poppins_500Medium',
  },

  stepContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  stepTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 30,
    color: '#4A403A',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    lineHeight: 22,
    color: '#9C8C84',
    marginBottom: 20,
  },

  // Step 0 - Photo upload
  photoFrame: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(201,168,106,0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(201,168,106,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  photoFrameFilled: {
    borderStyle: 'solid',
    borderColor: 'rgba(201,168,106,0.5)',
  },
  personPhoto: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  photoIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(201,168,106,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,106,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  photoPlaceholderText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#C9A86A',
  },
  photoPlaceholderSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
  },
  pickRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  pickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F1F1F',
    borderRadius: 14,
    paddingVertical: 13,
  },
  pickBtnLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },
  pickBtnText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  pickBtnTextDark: {
    color: '#4A403A',
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(201,168,106,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.2)',
    padding: 12,
    marginBottom: 20,
  },
  hintText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#6E655C',
    flex: 1,
  },

  // Primary button
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  primaryBtnDisabled: {
    backgroundColor: '#F0EDE8',
  },
  primaryBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  primaryBtnTextDisabled: {
    color: '#9C8C84',
  },

  // Step 1 - Clothing select
  sourceTabs: {
    flexDirection: 'row',
    backgroundColor: '#F0EDE8',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  sourceTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  sourceTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sourceTabText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#9C8C84',
  },
  sourceTabTextActive: {
    color: '#4A403A',
  },
  wardrobeScroll: {
    maxHeight: 340,
  },
  wardrobeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wardrobeItem: {
    width: '31%',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wardrobeItemSelected: {
    borderColor: '#C9A86A',
  },
  wardrobeImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F0EDE8',
  },
  wardrobeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wardrobeItemName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#4A403A',
    padding: 4,
    backgroundColor: '#FFFFFF',
  },
  galleryPickArea: {
    height: 200,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(201,168,106,0.3)',
    backgroundColor: 'rgba(201,168,106,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  galleryPreview: {
    width: '100%',
    height: '100%',
  },

  // Step 2 - Processing
  processingContainer: {
    flex: 1,
    minHeight: 480,
    overflow: 'hidden',
    borderRadius: 24,
    margin: 20,
  },
  processingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  spinnerRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: 'transparent',
  },
  processingTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  processingSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  processingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C9A86A',
  },

  // Step 3 - Result
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  resultBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#22C55E',
  },
  resultImageWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F0EDE8',
    marginTop: 12,
    marginBottom: 20,
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultClothingBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 8,
  },
  resultClothingThumb: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0EDE8',
  },
  resultClothingName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#4A403A',
  },
  aiWatermark: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  aiWatermarkText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#C9A86A',
  },
  resultActions: {
    gap: 10,
    marginBottom: 20,
  },
  resultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    paddingVertical: 16,
  },
  resultBtnSaved: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  resultBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  resultBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },
  resultBtnOutlineText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#4A403A',
  },
});
