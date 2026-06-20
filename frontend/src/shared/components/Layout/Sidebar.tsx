import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation/AppNavigator';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { useKeycloak } from '../../../app/providers/AuthProvider';
import { useMe } from '../../../features/auth/hooks/useMe';
import { theme } from '../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ParamlessScreen = {
  [K in keyof RootStackParamList]: RootStackParamList[K] extends undefined ? K : never;
}[keyof RootStackParamList];

interface NavItem {
  label: string;
  icon: string;
  screen: ParamlessScreen | null;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    icon: '⊞', screen: 'Dashboard' },
  { label: 'Dolabım',      icon: '▣', screen: 'WardrobeList' },
  { label: 'Kombinler',    icon: '◆', screen: 'OutfitList' },
  { label: 'Geçmiş',       icon: '◷', screen: 'WearLogList' },
  { label: 'Sosyal Feed',  icon: '◎', screen: 'Feed' },
  { label: 'Keşfet',       icon: '⊕', screen: 'Explore' },
  { label: 'Profil',       icon: '○', screen: 'Profile' },
  { label: 'Ayarlar',      icon: '◈', screen: 'Settings' },
];

function avatarInitial(name: string) {
  return name.trim()[0]?.toUpperCase() ?? '?';
}

export function Sidebar() {
  const navigation = useNavigation<Nav>();
  const route = useRoute();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMe();
  const { logout } = useKeycloak();

  const displayName =
    profile?.displayName ?? profile?.username ??
    user?.firstName ?? user?.username ?? 'Kullanıcı';

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandIconText}>OC</Text>
        </View>
        <View>
          <Text style={styles.brandName}>Outfit</Text>
          <Text style={styles.brandSub}>Combine</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Nav */}
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = route.name === item.screen;
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User section */}
      <View style={styles.divider} />
      <View style={styles.userSection}>
        <View style={styles.userRow}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{avatarInitial(displayName)}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.userRole}>Üye</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>↩ Çıkış</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 224,
    backgroundColor: theme.colors.sidebarBg,
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 6,
    marginBottom: 24,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 17,
  },
  brandSub: {
    color: theme.colors.primaryLight,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.sidebarBorder,
    marginVertical: 12,
    marginHorizontal: 6,
  },

  nav: { flex: 1, gap: 2 },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: theme.colors.sidebarActiveBg,
  },
  navIcon: {
    fontSize: 15,
    width: 20,
    textAlign: 'center',
    color: theme.colors.sidebarText,
  },
  navIconActive: {
    color: theme.colors.primaryLight,
  },
  navLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.sidebarText,
  },
  navLabelActive: {
    color: theme.colors.sidebarTextActive,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },

  userSection: { gap: 10, paddingHorizontal: 4 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.sidebarActiveBg,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: theme.colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  userInfo: { flex: 1 },
  userName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  userRole: {
    color: theme.colors.sidebarText,
    fontSize: 11,
    lineHeight: 14,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(239,68,68,0.12)',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
  },
});
