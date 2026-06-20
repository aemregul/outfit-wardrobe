import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';

export function Splash() {
  const breath = useRef(new Animated.Value(0)).current;
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  const scale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Svg style={[styles.glow, styles.glowTop]} width={500} height={541.03}>
        <Defs>
          <RadialGradient id="glowTop" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#C9A86A" stopOpacity={0.15} />
            <Stop offset="100%" stopColor="#C9A86A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={250} cy={270.515} rx={250} ry={270.515} fill="url(#glowTop)" />
      </Svg>

      <Svg style={[styles.glow, styles.glowBottom]} width={467.67} height={539.95}>
        <Defs>
          <RadialGradient id="glowBottom" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#C9A86A" stopOpacity={0.4} />
            <Stop offset="100%" stopColor="#C9A86A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={233.835} cy={269.975} rx={233.835} ry={269.975} fill="url(#glowBottom)" />
      </Svg>

      <View style={styles.content}>
        <Animated.Text style={[styles.title, { transform: [{ scale }], opacity }]}>
          Stylely
        </Animated.Text>
        <Text style={styles.subtitle}>Smart ✦ Wardrobe</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
  },
  glowTop: {
    left: 16,
    top: -70,
  },
  glowBottom: {
    left: -164,
    bottom: -227.95,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 48,
    lineHeight: 58,
    color: '#1F1F1F',
  },
  subtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 7,
    color: '#C9A86A',
    marginTop: 6,
  },
});
