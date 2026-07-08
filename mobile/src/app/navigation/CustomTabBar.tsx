import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tabBarTranslateY } from './TabBarVisibility';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type IconFamily = 'Ionicons' | 'MaterialCommunityIcons';

type TabConfig = {
  family: IconFamily;
  icon: string;
  label: string;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  OutfitList:   { family: 'Ionicons', icon: 'grid',      label: 'Akış' },
  WardrobeList: { family: 'MaterialCommunityIcons', icon: 'hanger', label: 'Dolap' },
  Feed:         { family: 'Ionicons', icon: 'home',       label: 'Ana Sayfa' },
  WearLogList:  { family: 'Ionicons', icon: 'sparkles',   label: 'Yapay Zeka' },
  Profile:      { family: 'Ionicons', icon: 'person',     label: 'Profil' },
};

function TabIcon({ family, icon, size, color }: { family: IconFamily; icon: string; size: number; color: string }) {
  if (family === 'MaterialCommunityIcons') {
    return <MaterialCommunityIcons name={icon as any} size={size} color={color} />;
  }
  return <Ionicons name={icon as any} size={size} color={color} />;
}

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const isFirstRender = useRef(true);

  const pillX = useSharedValue(0);

  const scale0 = useSharedValue(1);
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  const scale4 = useSharedValue(1);

  const iconStyle0 = useAnimatedStyle(() => ({ transform: [{ scale: scale0.value }] }));
  const iconStyle1 = useAnimatedStyle(() => ({ transform: [{ scale: scale1.value }] }));
  const iconStyle2 = useAnimatedStyle(() => ({ transform: [{ scale: scale2.value }] }));
  const iconStyle3 = useAnimatedStyle(() => ({ transform: [{ scale: scale3.value }] }));
  const iconStyle4 = useAnimatedStyle(() => ({ transform: [{ scale: scale4.value }] }));
  const iconStyles = [iconStyle0, iconStyle1, iconStyle2, iconStyle3, iconStyle4];

  const pillAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  // Tab bar'ı ekran dışına taşıyan animasyon — component asla unmount olmaz
  const hideStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tabBarTranslateY.value }],
  }));

  const tabCount = state.routes.length;
  const tabWidth = barWidth > 0 ? barWidth / tabCount : 0;

  useEffect(() => {
    if (barWidth === 0) return;

    const newX = state.index * tabWidth;

    if (isFirstRender.current) {
      pillX.value = newX;
      isFirstRender.current = false;
      return;
    }

    pillX.value = withSpring(newX, { damping: 22, stiffness: 280, mass: 0.7 });

    const scales = [scale0, scale1, scale2, scale3, scale4];
    const active = scales[state.index];
    if (active) {
      active.value = withSequence(
        withTiming(1.22, { duration: 110, easing: Easing.out(Easing.quad) }),
        withTiming(1.0,  { duration: 160, easing: Easing.in(Easing.quad) }),
      );
    }
  }, [state.index, barWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  const bottomOffset = Math.max(insets.bottom, 8) + 12;

  return (
    <Animated.View
      style={[styles.wrapper, { bottom: bottomOffset }, hideStyle]}
      pointerEvents="box-none"
    >
      <View style={styles.shadow} />

      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        <View style={styles.goldOverlay} />

        <View
          style={styles.tabsRow}
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        >
          {barWidth > 0 && (
            <Animated.View
              style={[
                styles.activePill,
                { width: tabWidth - 10 },
                pillAnimStyle,
              ]}
            />
          )}

          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name];
            if (!config) return null;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params as any);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.75}
                style={styles.tab}
              >
                <Animated.View style={iconStyles[index]}>
                  <TabIcon
                    family={config.family}
                    icon={config.icon}
                    size={22}
                    color={isFocused ? '#4A403A' : '#FFFFFF'}
                  />
                </Animated.View>
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 65,
    zIndex: 100,
  },
  shadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
  },
  goldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(201,168,106,0.35)',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activePill: {
    position: 'absolute',
    top: 7,
    left: 5,
    height: 50,
    borderRadius: 30,
    backgroundColor: 'rgba(156,140,132,0.50)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 65,
  },
  label: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    lineHeight: 14,
    color: '#FFFFFF',
    marginTop: 3,
  },
  labelActive: {
    color: '#4A403A',
  },
});
