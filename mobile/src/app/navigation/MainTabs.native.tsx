import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { RootStackParamList } from './types';
import { WardrobeStack } from './stacks/WardrobeStack';
import { SocialStack } from './stacks/SocialStack';
import { FeedStack } from './stacks/FeedStack';
import { AIStack } from './stacks/AIStack';
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
      <Tab.Screen name="OutfitList"   component={SocialStack} />
      <Tab.Screen name="WardrobeList" component={WardrobeStack} />
      <Tab.Screen name="Feed"         component={FeedStack} />
      <Tab.Screen name="WearLogList"  component={AIStack} />
      <Tab.Screen name="Profile"      component={ProfileStack} />
    </Tab.Navigator>
  );
}
