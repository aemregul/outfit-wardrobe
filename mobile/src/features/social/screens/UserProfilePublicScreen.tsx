import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { usePublicUser, useFollowUser, useUnfollowUser } from '../hooks/useSocial';
import { useMe } from '../../auth/hooks/useMe';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'UserProfile'>;

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function UserProfilePublicScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const userId = params.id;
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

  const { data: profile, isLoading, isError } = usePublicUser(userId);
  const { mutate: follow, isPending: following } = useFollowUser();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollowUser();
  const { data: me } = useMe();
  const isOwnProfile = !!me && me.id === userId;

  const followPending = following || unfollowing;

  function handleFollowToggle() {
    if (!profile) return;
    if (profile.isFollowing) {
      unfollow(userId);
    } else {
      follow(userId);
    }
  }

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FDFBF7' }} />;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C9A86A" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Profil bulunamadı.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayLabel = profile.displayName ?? profile.username;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={20} color="#4A403A" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          {profile.profileImageUrl ? (
            <Image
              source={{ uri: profile.profileImageUrl }}
              style={styles.avatarImg}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{initials(profile.username)}</Text>
            </View>
          )}

          <Text style={styles.displayName}>{displayLabel}</Text>
          <Text style={styles.username}>@{profile.username}</Text>

          {profile.isPrivate && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateBadgeText}>Gizli Hesap</Text>
            </View>
          )}

          {profile.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.followerCount}</Text>
              <Text style={styles.statLabel}>Takipçi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.followingCount}</Text>
              <Text style={styles.statLabel}>Takip</Text>
            </View>
          </View>

          {!isOwnProfile && (
            <TouchableOpacity
              style={[
                styles.followBtn,
                profile.isFollowing ? styles.followBtnActive : styles.followBtnInactive,
                followPending && styles.followBtnPending,
              ]}
              onPress={handleFollowToggle}
              disabled={followPending}
            >
              {followPending ? (
                <ActivityIndicator color={profile.isFollowing ? '#C9A86A' : '#fff'} size="small" />
              ) : (
                <Text style={[
                  styles.followBtnText,
                  profile.isFollowing ? styles.followBtnTextActive : styles.followBtnTextInactive,
                ]}>
                  {profile.isFollowing ? 'Takibi Bırak' : 'Takip Et'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FDFBF7' },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

  header: { marginBottom: 20 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },

  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#C9A86A',
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#C9A86A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarFallbackText: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 28 },

  displayName: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#4A403A' },
  username: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9C8C84', marginTop: 2, marginBottom: 10 },

  privateBadge: {
    backgroundColor: '#F0EDE8',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  privateBadgeText: { fontFamily: 'Poppins_500Medium', fontSize: 11, color: '#9C8C84' },

  bio: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#9C8C84',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 20,
  },
  statItem: { alignItems: 'center', gap: 2 },
  statNumber: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#C9A86A' },
  statLabel: { fontFamily: 'Poppins_500Medium', fontSize: 11, color: '#9C8C84' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(74,64,58,0.10)' },

  followBtn: {
    width: 200,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  followBtnInactive: { backgroundColor: '#1F1F1F', borderColor: '#1F1F1F' },
  followBtnActive: { backgroundColor: '#fff', borderColor: '#C9A86A' },
  followBtnPending: { opacity: 0.6 },
  followBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
  followBtnTextInactive: { color: '#fff' },
  followBtnTextActive: { color: '#C9A86A' },

  errorText: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#EF4444' },
  linkText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#C9A86A' },
});
