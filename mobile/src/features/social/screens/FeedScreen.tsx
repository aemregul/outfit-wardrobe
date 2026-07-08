import React, { useMemo, useCallback, useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';
import { PostCard } from '../components/PostCard';
import { useInfiniteFeed, useLikePost, useUnlikePost } from '../hooks/useSocial';
import type { RootStackParamList } from '../../../app/navigation/types';
import type { PostResponse } from '../../../shared/types/social.types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MOCK_POSTS: PostResponse[] = [
  {
    id: 'mock-1',
    userId: 'user-zeynep',
    username: 'zeynep_k',
    displayName: 'Zeynep K.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    caption: 'Bugünün kombini ☀️ Yazlık casual look için vazgeçilmezlerim — bej tonu her şeyle gidiyor!',
    visibility: 'PUBLIC',
    likesCount: 142,
    commentsCount: 18,
    likedByCurrentUser: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    userId: 'user-elif',
    username: 'elif_style',
    displayName: 'Elif S.',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    caption: 'Office look 🖤 Klasik hiç bitmez. Siyah-beyaz kombinasyonu her zaman kazandırıyor.',
    visibility: 'PUBLIC',
    likesCount: 89,
    commentsCount: 7,
    likedByCurrentUser: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    outfitId: 'outfit-demo-1',
  },
];

export function FeedScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<TextInput>(null);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    }, [queryClient]),
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteFeed();

  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();

  const backendPosts = useMemo(
    () => data?.pages.flatMap(page => page.data.content) ?? [],
    [data],
  );

  const allPosts = backendPosts.length > 0 ? backendPosts : MOCK_POSTS;

  const posts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allPosts;
    return allPosts.filter(p =>
      p.username?.toLowerCase().includes(q) ||
      p.displayName?.toLowerCase().includes(q) ||
      p.caption?.toLowerCase().includes(q),
    );
  }, [allPosts, searchQuery]);

  const openSearch = () => {
    setSearchActive(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchActive(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => (
    <View style={styles.footer}>
      {isFetchingNextPage ? (
        <ActivityIndicator size="small" color="#C9A86A" />
      ) : !hasNextPage && backendPosts.length > 0 ? (
        <Text style={styles.footerText}>Tüm gönderiler yüklendi</Text>
      ) : null}
    </View>
  ), [isFetchingNextPage, hasNextPage, backendPosts.length]);

  if (!fontsLoaded) return <View style={styles.safe} />;

  const ListHeader = (
    <View>
      {searchActive ? (
        /* ── Arama modu ── */
        <View style={styles.searchHeader}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search-outline" size={18} color="#9C8C84" />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Kullanıcı veya kombin ara…"
              placeholderTextColor="#9C8C84"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color="#9C8C84" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={closeSearch} activeOpacity={0.7}>
            <Text style={styles.searchCancelText}>İptal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Normal header ── */
        <View style={styles.header}>
          <Text style={styles.title}>Akış</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={openSearch}>
              <Ionicons name="search-outline" size={22} color="#4A403A" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.createBtnText}>Paylaş</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sonuç sayısı (arama aktifken) */}
      {searchActive && searchQuery.length > 0 && (
        <Text style={styles.searchResultCount}>
          {posts.length} sonuç bulundu
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={isLoading ? [] : posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('PostDetail', { id: item.id })}
            onLike={likePost}
            onUnlike={unlikePost}
            onComments={postId => navigation.navigate('PostComments', { postId })}
            onViewOutfit={(outfitId, imageUrl, caption, username) =>
              navigation.navigate('OutfitPreview', { outfitId, imageUrl, caption, username })
            }
            onAuthorPress={userId => navigation.navigate('UserProfile', { id: userId })}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#C9A86A" />
            </View>
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    paddingBottom: 14,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 24,
    color: '#4A403A',
    lineHeight: 32,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 9999,
  },
  createBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 20,
  },

  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 20,
    paddingVertical: 0,
  },
  searchCancelText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: '#C9A86A',
  },
  searchResultCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
    paddingBottom: 8,
  },

  loadingWrap: {
    paddingTop: 80,
    alignItems: 'center',
  },

  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
  },
});
