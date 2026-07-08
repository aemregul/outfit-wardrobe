import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ActivityIndicator, ScrollView, StyleSheet, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useMe } from '../../auth/hooks/useMe';
import type { AppNavigationProp } from '../../../app/navigation/types';

// ─── Mock fallback ────────────────────────────────────────────────
const MOCK_PROFILE = {
  username: 'ardaemre',
  displayName: 'Arda',
  email: 'ardaemregul36@gmail.com',
  bio: 'Moda tutkunu ✨',
  profileImageUrl: null as string | null | undefined,
  isPrivate: false,
  stylePreferences: ['Minimalist', 'Gündelik'],
  createdAt: '2024-01-01T00:00:00Z',
};

const MOCK_STATS = {
  outfits: 24,
  kombinler: 8,
  takipci: 142,
  takip: 89,
};

const MOCK_POSTS = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
  'https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=400&q=80',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
];

type ContentTab = 'gonderiler' | 'koleksiyonlar' | 'dolabim';

const CONTENT_TABS: { key: ContentTab; label: string }[] = [
  { key: 'gonderiler', label: 'Gönderiler' },
  { key: 'koleksiyonlar', label: 'Koleksiyonlar' },
  { key: 'dolabim', label: 'Dolabım' },
];

// ─── Main Screen ─────────────────────────────────────────────────
export function ProfileScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading, isError, refetch } = useMe();

  const [activeTab, setActiveTab] = useState<ContentTab>('gonderiler');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const displayProfile = profile ?? MOCK_PROFILE;
  const isMock = !profile;

  if (!fontsLoaded) return <View style={styles.container} />;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#C9A86A" />
      </View>
    );
  }

  const name = displayProfile.displayName || displayProfile.username || 'Kullanıcı';
  const initial = name[0]?.toUpperCase() ?? 'U';
  const avatarUri = displayProfile.profileImageUrl;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => (navigation.navigate as (s: string) => void)('Settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={20} color="#4A403A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Profil</Text>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => (navigation.navigate as (s: string) => void)('EditProfile')}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color="#4A403A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 90 }]}
      >
        {/* ── Avatar + Info ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} resizeMode="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraBtn}
              activeOpacity={0.85}
              onPress={() => (navigation.navigate as (s: string) => void)('EditProfile')}
            >
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{displayProfile.email}</Text>
          {displayProfile.bio ? (
            <Text style={styles.profileBio}>{displayProfile.bio}</Text>
          ) : null}

          {displayProfile.stylePreferences && displayProfile.stylePreferences.length > 0 && (
            <View style={styles.styleTagRow}>
              {displayProfile.stylePreferences.map((tag, i) => (
                <View key={i} style={styles.styleTag}>
                  <Text style={styles.styleTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Stats Card ── */}
        <View style={styles.statsCard}>
          {[
            { label: 'Giysi', value: isMock ? MOCK_STATS.outfits : 0 },
            { label: 'Kombin', value: isMock ? MOCK_STATS.kombinler : 0 },
            { label: 'Takipçi', value: isMock ? MOCK_STATS.takipci : 0 },
            { label: 'Takip', value: isMock ? MOCK_STATS.takip : 0 },
          ].map((stat, i, arr) => (
            <React.Fragment key={stat.label}>
              <Pressable style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Pressable>
              {i < arr.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Premium Banner ── */}
        <TouchableOpacity activeOpacity={0.88} style={styles.premiumBannerWrap}>
          <LinearGradient
            colors={['#1F1F1F', '#2E2820']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.premiumBanner}
          >
            <View style={styles.premiumIconWrap}>
              <Ionicons name="sparkles" size={18} color="#C9A86A" />
            </View>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>Pro'ya Yükselt</Text>
              <Text style={styles.premiumSub}>Tüm premium özellikleri aç</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(201,168,106,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Content Tabs ── */}
        <View style={styles.tabsRow}>
          {CONTENT_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab Content ── */}
        {activeTab === 'gonderiler' && (
          <View style={styles.grid}>
            {MOCK_POSTS.map((url, i) => (
              <TouchableOpacity key={i} style={styles.gridItem} activeOpacity={0.88}>
                <Image source={{ uri: url }} style={styles.gridImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'koleksiyonlar' && (
          <View style={styles.emptyState}>
            <Ionicons name="albums-outline" size={48} color="#D4C4B8" />
            <Text style={styles.emptyTitle}>Henüz koleksiyon yok</Text>
            <Text style={styles.emptySubtitle}>Beğendiğin kombinleri koleksiyona ekle</Text>
          </View>
        )}

        {activeTab === 'dolabim' && (
          <View style={styles.emptyState}>
            <Ionicons name="shirt-outline" size={48} color="#D4C4B8" />
            <Text style={styles.emptyTitle}>Dolap boş görünüyor</Text>
            <Text style={styles.emptySubtitle}>Kıyafetlerini ekleyerek dolabını oluştur</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#4A403A',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },

  content: {
    paddingHorizontal: 20,
  },

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 24,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#C9A86A',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#C9A86A',
    backgroundColor: '#4A403A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 38,
    color: '#C9A86A',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDFBF7',
  },
  profileName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    lineHeight: 30,
    color: '#4A403A',
    marginBottom: 3,
  },
  profileEmail: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#9C8C84',
    marginBottom: 6,
  },
  profileBio: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 20,
    color: '#6E655C',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  styleTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  styleTag: {
    backgroundColor: 'rgba(201,168,106,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.3)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  styleTagText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: '#C9A86A',
  },

  // Stats card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    lineHeight: 26,
    color: '#4A403A',
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#9C8C84',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.07)',
    alignSelf: 'center',
  },

  // Premium banner
  premiumBannerWrap: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 24,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  premiumIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(201,168,106,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  premiumSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.6)',
  },

  // Edit form
  editCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  editSectionLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    color: '#9C8C84',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  editFieldLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#4A403A',
    marginBottom: 6,
    marginTop: 14,
  },
  editInput: {
    backgroundColor: '#EAE3D8',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1F1F1F',
  },
  editInputMulti: {
    height: 80,
    paddingTop: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  switchSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
    marginTop: 1,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#4A403A',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  editError: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // Content tabs
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.07)',
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12,
  },
  tabLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#9C8C84',
  },
  tabLabelActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#4A403A',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '60%',
    backgroundColor: '#C9A86A',
    borderRadius: 1,
  },

  // Post grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0EDE8',
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: '#9C8C84',
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#B8AFA8',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
