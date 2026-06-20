import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootStackParamList } from './types';
import { WardrobeStack } from './stacks/WardrobeStack';
import { OutfitStack } from './stacks/OutfitStack';
import { FeedStack } from './stacks/FeedStack';
import { WearLogStack } from './stacks/WearLogStack';
import { ProfileStack } from './stacks/ProfileStack';
import { CustomTabBar } from './CustomTabBar';

type TabParamList = Pick<RootStackParamList, 'WardrobeList' | 'OutfitList' | 'Feed' | 'WearLogList' | 'Profile'>;

const Tab = createBottomTabNavigator<TabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="OutfitList"   component={OutfitStack} />
      <Tab.Screen name="WardrobeList" component={WardrobeStack} />
      <Tab.Screen name="Feed"         component={FeedStack} />
      <Tab.Screen name="WearLogList"  component={WearLogStack} />
      <Tab.Screen name="Profile"      component={ProfileStack} />
    </Tab.Navigator>
  );
}
