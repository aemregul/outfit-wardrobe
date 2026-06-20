import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { navigationRef, onNavigationReady } from '../../shared/navigation/navigationRef';
import { MainTabs } from './MainTabs.native';
import { Splash } from '../../features/auth/screens/Splash';
import { Onboarding } from '../../features/onboarding/screens/Onboarding';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { ProfileSetup } from '../../features/profile-setup/screens/ProfileSetup';
import { ClothingDetailScreen } from '../../features/wardrobe/screens/ClothingDetailScreen';
import { OutfitDetailScreen } from '../../features/outfits/screens/OutfitDetailScreen';
import { PostDetailScreen } from '../../features/social/screens/PostDetailScreen';
import { UserProfilePublicScreen } from '../../features/social/screens/UserProfilePublicScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['outfitcombine://'],
  config: {
    screens: {
      Login: 'login',
      Main: {
        screens: {
          Feed: {
            screens: {
              Feed: 'feed',
              Explore: 'explore',
              CreatePost: 'create-post',
            },
          },
          WardrobeList: {
            screens: {
              WardrobeList: 'wardrobe',
              AddClothing: 'add-clothing',
            },
          },
          OutfitList: {
            screens: {
              OutfitList: 'outfits',
              GenerateOutfit: 'generate-outfit',
            },
          },
          WearLogList: {
            screens: {
              WearLogList: 'wear-log',
              WearLogDetail: 'wear-log/:id',
            },
          },
          Profile: {
            screens: {
              Profile: 'profile',
              Settings: 'settings',
            },
          },
        },
      },
      ClothingDetail: 'clothing/:id',
      OutfitDetail: 'outfit/:id',
      PostDetail: 'post/:id',
      UserProfile: 'user/:id',
    },
  },
};

const SPLASH_DURATION_MS = 3000;

function AuthGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!navigationRef.isReady()) return;
    const timer = setTimeout(() => {
      navigationRef.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}

export function AppNavigator() {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onNavigationReady}
      linking={linking}
    >
      <AuthGuard>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AuthLoading" component={Splash} />
          <Stack.Screen name="Onboarding" component={Onboarding} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="ClothingDetail" component={ClothingDetailScreen} />
          <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
          <Stack.Screen name="PostDetail" component={PostDetailScreen} />
          <Stack.Screen name="UserProfile" component={UserProfilePublicScreen} />
        </Stack.Navigator>
      </AuthGuard>
    </NavigationContainer>
  );
}
