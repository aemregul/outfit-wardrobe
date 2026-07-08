import { makeMutable, withTiming } from 'react-native-reanimated';

// Shared value — UI thread'de anında güncellenir, React re-render gerekmez
export const tabBarTranslateY = makeMutable(0);

export function hideTabBar() {
  tabBarTranslateY.value = withTiming(120, { duration: 220 });
}

export function showTabBar() {
  tabBarTranslateY.value = 0; // animasyonsuz, anında
}
