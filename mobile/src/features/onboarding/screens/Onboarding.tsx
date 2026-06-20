import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { PressableScale } from '../../../shared/components/PressableScale';
import PagerView from 'react-native-pager-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
  useFonts,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../../../app/navigation/types';

const slides = [
  {
    video: require('../../../../assets/videos/splash-1.mp4'),
    title: 'Ne giyeceğini düşünmekten yorulma.',
    subtitle: 'Stylely, hava durumuna ve planlarına göre kombin önerir.',
    subtitleColor: '#6E655C',
  },
  {
    video: require('../../../../assets/videos/splash-2.mp4'),
    title: 'Gardırobundaki parçaları yeniden keşfet.',
    subtitle: 'Yapay zeka kıyafetlerini analiz eder ve yüzlerce kombin oluşturur.',
    subtitleColor: '#C9A86A',
  },
  {
    video: require('../../../../assets/videos/splash-3.mp4'),
    title: 'Her gün hazır bir kombinle güne başla.',
    subtitle: 'Dakikalarca düşünmek yerine tek dokunuşla öneri al.',
    subtitleColor: '#C9A86A',
  },
];

function VideoSlide({ source }: { source: number }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      style={styles.media}
      player={player}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

function Dot({ active }: { active: boolean }) {
  const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [active]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: [7, 18] });
  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#C9A86A'],
  });
  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D8D8D8', '#C9A86A'],
  });

  return <Animated.View style={[styles.dot, { width, backgroundColor, borderColor }]} />;
}

export function Onboarding() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<PagerView>(null);
  const [page, setPage] = useState(0);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(() => new Set([0]));
  const fade = useRef(new Animated.Value(1)).current;

  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_700Bold,
  });

  const finishOnboarding = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleContinue = () => {
    if (page < slides.length - 1) {
      pagerRef.current?.setPage(page + 1);
    } else {
      finishOnboarding();
    }
  };

  const handlePageSelected = (e: { nativeEvent: { position: number } }) => {
    const newPage = e.nativeEvent.position;
    if (newPage === page) return;

    setLoadedPages((prev) => {
      if (prev.has(newPage)) return prev;
      const next = new Set(prev);
      next.add(newPage);
      return next;
    });

    Animated.timing(fade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setPage(newPage);
      Animated.timing(fade, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    const timers = slides.map((_, i) => (i === 0 ? null : setTimeout(() => {
      setLoadedPages((prev) => {
        if (prev.has(i)) return prev;
        const next = new Set(prev);
        next.add(i);
        return next;
      });
    }, i * 400)));

    return () => timers.forEach((t) => t && clearTimeout(t));
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  const current = slides[page];

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {slides.map((slide, i) => (
          <View key={i} style={styles.page}>
            {loadedPages.has(i) ? (
              <VideoSlide source={slide.video} />
            ) : (
              <View style={styles.media} />
            )}
          </View>
        ))}
      </PagerView>

      <View style={[styles.panel, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Animated.View style={{ opacity: fade }}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={[styles.subtitle, { color: current.subtitleColor }]}>
            {current.subtitle}
          </Text>
        </Animated.View>

        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Dot key={i} active={i === page} />
          ))}
        </View>

        <PressableScale style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>
            {page < slides.length - 1 ? 'Devam Et' : 'Hadi Başlayalım'}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  media: {
    flex: 1,
    backgroundColor: '#E5E1D8',
  },
  panel: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    lineHeight: 26,
    color: '#C9A86A',
  },
  subtitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 24,
    alignItems: 'center',
  },
  dot: {
    height: 7,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#D8D8D8',
  },
  continueButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  continueText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#1F1F1F',
  },
});
