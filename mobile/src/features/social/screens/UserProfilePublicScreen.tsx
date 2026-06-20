import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
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
            <Text style={styles.linkText}>← Geri dön</Text>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Geri</Text>
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
                <ActivityIndicator color={profile.isFollowing ? '#6366F1' : '#fff'} size="small" />
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
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },

  header: { marginBottom: 20 },
  backBtn: { color: '#6366F1', fontSize: 15, fontWeight: '500' },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  avatarImg: { width: 88, height: 88, borderRadius: 44, marginBottom: 14 },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarFallbackText: { color: '#fff', fontSize: 28, fontWeight: '700' },

  displayName: { fontSize: 20, fontWeight: '700', color: '#1E1B4B' },
  username: { fontSize: 14, color: '#9CA3AF', marginTop: 2, marginBottom: 10 },

  privateBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 10,
  },
  privateBadgeText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },

  bio: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
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
  statNumber: { fontSize: 20, fontWeight: '700', color: '#1E1B4B' },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  statDivider: { width: 1, height: 32, backgroundColor: '#E5E7EB' },

  followBtn: {
    width: 200,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  followBtnInactive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  followBtnActive: { backgroundColor: '#fff', borderColor: '#6366F1' },
  followBtnPending: { opacity: 0.7 },
  followBtnText: { fontSize: 15, fontWeight: '700' },
  followBtnTextInactive: { color: '#fff' },
  followBtnTextActive: { color: '#6366F1' },

  errorText: { fontSize: 15, color: '#EF4444' },
  linkText: { color: '#6366F1', fontSize: 14 },
});
